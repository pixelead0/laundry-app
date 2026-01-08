from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone

from app.models.machine import Machine
from app.models.turn import Turn
from app.core.enums import MachineStatus, TurnStatus
from app.services.websocket import manager

class MachineService:
    @staticmethod
    async def get_all(db: AsyncSession):
        result = await db.execute(select(Machine).order_by(Machine.machine_order.asc(), Machine.name.asc()))
        return result.scalars().all()

    @staticmethod
    async def create(db: AsyncSession, machine_data: dict):
        new_machine = Machine(**machine_data, status=MachineStatus.FREE.value)
        db.add(new_machine)
        await db.commit()
        await db.refresh(new_machine)
        return new_machine

    @staticmethod
    async def get_by_id(db: AsyncSession, id: int) -> Machine:
        result = await db.execute(select(Machine).filter(Machine.id == id))
        machine = result.scalar_one_or_none()
        if not machine:
            raise HTTPException(status_code=404, detail="Machine not found")
        return machine

    @staticmethod
    async def update(db: AsyncSession, id: int, updates: dict):
        machine = await MachineService.get_by_id(db, id)
        for key, value in updates.items():
            setattr(machine, key, value)
        await db.commit()
        await db.refresh(machine)
        return machine

    @staticmethod
    async def delete(db: AsyncSession, id: int):
        machine = await MachineService.get_by_id(db, id)
        await db.delete(machine)
        await db.commit()

    @staticmethod
    async def assign(db: AsyncSession, id: int, duration_minutes: int | None, turn_id: int | None):
        machine = await MachineService.get_by_id(db, id)

        final_duration = duration_minutes if duration_minutes is not None else machine.default_cycle_time
        end_time = datetime.now(timezone.utc) + timedelta(minutes=final_duration)

        machine.status = MachineStatus.OCCUPIED.value
        machine.current_cycle_end = end_time

        if turn_id:
            machine.current_turn_id = turn_id
            t_result = await db.execute(select(Turn).filter(Turn.id == turn_id))
            turn = t_result.scalar_one_or_none()
            if turn:
                turn.status = TurnStatus.IN_PROGRESS.value
                turn.machine_id = id

        await db.commit()
        await db.refresh(machine)

        await manager.broadcast({
            "type": "machine_update",
            "id": id,
            "status": MachineStatus.OCCUPIED.value,
            "end_time": end_time.isoformat().replace('+00:00', 'Z') if end_time else None,
            "turn_id": turn_id
        })
        return machine

    @staticmethod
    async def complete(db: AsyncSession, id: int):
        machine = await MachineService.get_by_id(db, id)

        if machine.current_turn_id:
            t_result = await db.execute(select(Turn).filter(Turn.id == machine.current_turn_id))
            turn = t_result.scalar_one_or_none()
            if turn:
                turn.status = TurnStatus.COMPLETED.value
            machine.current_turn_id = None

        machine.status = MachineStatus.FREE.value
        machine.current_cycle_end = None
        await db.commit()
        await db.refresh(machine)

        await manager.broadcast({"type": "machine_update", "id": id, "status": MachineStatus.FREE.value, "turn_id": None})
        return machine

    @staticmethod
    async def cancel(db: AsyncSession, id: int):
        machine = await MachineService.get_by_id(db, id)

        if machine.current_turn_id:
            t_result = await db.execute(select(Turn).filter(Turn.id == machine.current_turn_id))
            turn = t_result.scalar_one_or_none()
            if turn:
                turn.status = TurnStatus.WAITING.value
                turn.machine_id = None
            machine.current_turn_id = None

        machine.status = MachineStatus.FREE.value
        machine.current_cycle_end = None
        await db.commit()
        await db.refresh(machine)

        await manager.broadcast({"type": "machine_update", "id": id, "status": MachineStatus.FREE.value, "turn_id": None})
        return machine

    @staticmethod
    async def maintenance(db: AsyncSession, id: int):
        machine = await MachineService.get_by_id(db, id)

        if machine.current_turn_id:
            t_result = await db.execute(select(Turn).filter(Turn.id == machine.current_turn_id))
            turn = t_result.scalar_one_or_none()
            if turn:
                turn.status = TurnStatus.WAITING.value
                turn.machine_id = None
            machine.current_turn_id = None

        machine.status = MachineStatus.MAINTENANCE.value
        machine.current_cycle_end = None
        await db.commit()
        await db.refresh(machine)

        await manager.broadcast({"type": "machine_update", "id": id, "status": MachineStatus.MAINTENANCE.value, "turn_id": None})
        return machine

    @staticmethod
    async def recover(db: AsyncSession, id: int):
        machine = await MachineService.get_by_id(db, id)

        machine.status = MachineStatus.FREE.value
        machine.current_cycle_end = None
        machine.current_turn_id = None
        await db.commit()
        await db.refresh(machine)

        await manager.broadcast({"type": "machine_update", "id": id, "status": MachineStatus.FREE.value, "turn_id": None})
        return machine

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta, timezone

from app.db.session import get_db
from app.models.machine import Machine
from app.models.turn import Turn
from app.schemas.machine import MachineCreate, MachineResponse
from app.services.websocket import manager
from app.core.enums import MachineStatus, TurnStatus
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta, timezone

from app.db.session import get_db
from app.models.machine import Machine
from app.models.turn import Turn
from app.schemas.machine import MachineCreate, MachineResponse
from app.services.websocket import manager

router = APIRouter()

@router.get("/", response_model=list[MachineResponse])
async def get_machines(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).order_by(Machine.machine_order.asc(), Machine.name.asc()))
    return result.scalars().all()

@router.post("/", response_model=MachineResponse)
async def create_machine(machine: MachineCreate, db: AsyncSession = Depends(get_db)):
    new_machine = Machine(**machine.dict(), status=MachineStatus.FREE.value)
    db.add(new_machine)
    await db.commit()
    await db.refresh(new_machine)
    return new_machine

@router.put("/{id}", response_model=MachineResponse)
async def update_machine(id: int, machine: MachineCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    db_machine = result.scalar_one_or_none()
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    for key, value in machine.dict().items():
        setattr(db_machine, key, value)

    await db.commit()
    await db.refresh(db_machine)
    return db_machine

@router.delete("/{id}")
async def delete_machine(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    db_machine = result.scalar_one_or_none()
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    await db.delete(db_machine)
    await db.commit()
    return {"message": "Machine deleted"}

# --- Actions ---

@router.post("/{id}/assign", response_model=MachineResponse)
async def assign_machine(id: int, duration_minutes: int | None = None, turn_id: int | None = None, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

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

@router.post("/{id}/complete", response_model=MachineResponse)
async def complete_machine(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

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

@router.post("/{id}/cancel", response_model=MachineResponse)
async def cancel_assignment(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

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

@router.post("/{id}/maintenance", response_model=MachineResponse)
async def report_failure(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

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

@router.post("/{id}/recover", response_model=MachineResponse)
async def recover_machine(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    machine.status = MachineStatus.FREE.value
    machine.current_cycle_end = None
    machine.current_turn_id = None
    await db.commit()
    await db.refresh(machine)

    await manager.broadcast({"type": "machine_update", "id": id, "status": MachineStatus.FREE.value, "turn_id": None})
    return machine

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from datetime import datetime, timezone

from app.models.turn import Turn
from app.models.machine import Machine
from app.core.enums import TurnStatus, MachineStatus
from app.services.waitlist import WaitlistService


class TurnService:
    @staticmethod
    async def get_all(db: AsyncSession, status: str | None = None, type: str | None = None):
        query = select(Turn)

        if status:
            query = query.filter(Turn.status == status)
        if type:
            query = query.filter(Turn.type == type)

        query = query.order_by(Turn.created_at.asc())
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def create(db: AsyncSession, turn_data: dict):
        new_turn = Turn(**turn_data, status=TurnStatus.WAITING.value, created_at=datetime.now(timezone.utc).replace(tzinfo=None))
        db.add(new_turn)
        await db.commit()
        await db.refresh(new_turn)
        return new_turn

    @staticmethod
    async def get_by_id(db: AsyncSession, id: int) -> Turn:
        result = await db.execute(select(Turn).filter(Turn.id == id))
        turn = result.scalar_one_or_none()
        if not turn:
            raise HTTPException(status_code=404, detail="Turn not found")
        return turn

    @staticmethod
    async def delete(db: AsyncSession, id: int):
        turn = await TurnService.get_by_id(db, id)
        await db.delete(turn)
        await db.commit()

    @staticmethod
    async def get_waitlist_with_estimates(db: AsyncSession):
        """Get waiting turns with estimated wait times"""
        waiting_turns = await TurnService.get_all(db, status=TurnStatus.WAITING.value)

        # Get all machines
        machines_result = await db.execute(select(Machine))
        machines = machines_result.scalars().all()

        # Calculate wait times
        washer_turns = [t for t in waiting_turns if t.type == 'washer']
        dryer_turns = [t for t in waiting_turns if t.type == 'dryer']

        washers = [m for m in machines if m.type == 'washer']
        dryers = [m for m in machines if m.type == 'dryer']

        washer_waits = WaitlistService.calculate_wait(washer_turns, washers, 'washer')
        dryer_waits = WaitlistService.calculate_wait(dryer_turns, dryers, 'dryer')

        return {
            "washers": washer_waits,
            "dryers": dryer_waits
        }

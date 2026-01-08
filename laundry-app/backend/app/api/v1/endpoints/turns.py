from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.turn import Turn
from app.models.machine import Machine
from app.schemas.turn import TurnCreate, TurnResponse
from app.services.waitlist import WaitlistService
from app.core.enums import TurnStatus, MachineType

router = APIRouter()

@router.get("/", response_model=list[TurnResponse])
async def get_turns(db: AsyncSession = Depends(get_db)):
    # 1. Get all active turns
    result = await db.execute(select(Turn).filter(Turn.status.in_([TurnStatus.WAITING.value, TurnStatus.IN_PROGRESS.value])).order_by(Turn.created_at))
    all_turns = result.scalars().all()

    # 2. Get all machines needed for wait calc
    m_result = await db.execute(select(Machine))
    all_machines = m_result.scalars().all()

    # 3. Separate in_progress from waiting
    in_progress = [t for t in all_turns if t.status == TurnStatus.IN_PROGRESS.value]
    waiting_washers = [t for t in all_turns if t.status == TurnStatus.WAITING.value and t.type == MachineType.WASHER.value]
    waiting_dryers = [t for t in all_turns if t.status == TurnStatus.WAITING.value and t.type == MachineType.DRYER.value]

    response = []

    # Add in_progress turns (wait = 0)
    for t in in_progress:
        # Pydantic will handle mapping, we just need to ensure keys exist
        # Manual mapping for safety or Pydantic `from_orm`
        response.append(t)

    # Add calculated waiting times
    washer_times = WaitlistService.calculate_wait(waiting_washers, all_machines, MachineType.WASHER)
    dryer_times = WaitlistService.calculate_wait(waiting_dryers, all_machines, MachineType.DRYER)

    # Combine
    # Note: detailed logic in service returns dictionaries, we need to ensure they match TurnResponse
    # The service returns dicts with 'id', 'customer_name', etc.
    response.extend(washer_times)
    response.extend(dryer_times)

    return response

@router.post("/", response_model=TurnResponse)
async def create_turn(turn: TurnCreate, db: AsyncSession = Depends(get_db)):
    new_turn = Turn(**turn.dict(), status=TurnStatus.WAITING.value)
    db.add(new_turn)
    await db.commit()
    await db.refresh(new_turn)
    return new_turn

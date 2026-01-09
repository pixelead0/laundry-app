from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.turn import TurnCreate, TurnResponse
from app.services.turn_service import TurnService

router = APIRouter()

@router.get("", response_model=list[TurnResponse])
async def get_turns(db: AsyncSession = Depends(get_db)):
    waitlist = await TurnService.get_waitlist_with_estimates(db)
    # Flatten the response
    return waitlist["washers"] + waitlist["dryers"]

@router.post("", response_model=TurnResponse)
async def create_turn(turn: TurnCreate, db: AsyncSession = Depends(get_db)):
    return await TurnService.create(db, turn.dict())

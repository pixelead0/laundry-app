from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.machine import MachineCreate, MachineResponse
from app.services.machine_service import MachineService

router = APIRouter()

@router.get("", response_model=list[MachineResponse])
async def get_machines(db: AsyncSession = Depends(get_db)):
    return await MachineService.get_all(db)

@router.post("", response_model=MachineResponse)
async def create_machine(machine: MachineCreate, db: AsyncSession = Depends(get_db)):
    return await MachineService.create(db, machine.dict())

@router.put("/{id}", response_model=MachineResponse)
async def update_machine(id: int, machine: MachineCreate, db: AsyncSession = Depends(get_db)):
    return await MachineService.update(db, id, machine.dict())

@router.delete("/{id}")
async def delete_machine(id: int, db: AsyncSession = Depends(get_db)):
    await MachineService.delete(db, id)
    return {"message": "Machine deleted"}

# --- Actions ---

@router.post("/{id}/assign", response_model=MachineResponse)
async def assign_machine(id: int, duration_minutes: int | None = None, turn_id: int | None = None, db: AsyncSession = Depends(get_db)):
    return await MachineService.assign(db, id, duration_minutes, turn_id)

@router.post("/{id}/complete", response_model=MachineResponse)
async def complete_machine(id: int, db: AsyncSession = Depends(get_db)):
    return await MachineService.complete(db, id)

@router.post("/{id}/cancel", response_model=MachineResponse)
async def cancel_assignment(id: int, db: AsyncSession = Depends(get_db)):
    return await MachineService.cancel(db, id)

@router.post("/{id}/maintenance", response_model=MachineResponse)
async def report_failure(id: int, db: AsyncSession = Depends(get_db)):
    return await MachineService.maintenance(db, id)

@router.post("/{id}/recover", response_model=MachineResponse)
async def recover_machine(id: int, db: AsyncSession = Depends(get_db)):
    return await MachineService.recover(db, id)

from pydantic import BaseModel, field_validator
from datetime import datetime, timezone

from app.core.enums import MachineType, MachineStatus
from datetime import datetime, timezone

class MachineBase(BaseModel):
    name: str
    type: MachineType
    capacity: str
    default_cycle_time: int = 45
    machine_order: int = 0

class MachineCreate(MachineBase):
    pass

class MachineResponse(MachineBase):
    id: int
    status: MachineStatus
    current_cycle_end: datetime | None = None
    current_turn_id: int | None = None

    @field_validator('current_cycle_end')
    @classmethod
    def ensure_utc(cls, v: datetime | None) -> datetime | None:
        if v and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

    class Config:
        from_attributes = True

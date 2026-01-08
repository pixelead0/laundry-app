from pydantic import BaseModel
from datetime import datetime

from pydantic import BaseModel
from datetime import datetime
from app.core.enums import TurnStatus, MachineType

class TurnBase(BaseModel):
    customer_name: str
    customer_phone: str
    type: MachineType = MachineType.WASHER

class TurnCreate(TurnBase):
    pass

class TurnResponse(TurnBase):
    id: int
    status: TurnStatus
    created_at: datetime
    machine_id: int | None = None
    estimated_wait: int = 0  # Computed field

    class Config:
        from_attributes = True

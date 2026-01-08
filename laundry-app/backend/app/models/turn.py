from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone
from app.db.session import Base
from app.core.enums import TurnStatus, MachineType

class Turn(Base):
    __tablename__ = "turns"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    customer_phone = Column(String)
    status = Column(String, default=TurnStatus.WAITING.value) # 'waiting', 'in_progress', 'completed', 'cancelled'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=True)
    type = Column(String, default=MachineType.WASHER.value)

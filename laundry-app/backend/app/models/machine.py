from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.core.enums import MachineStatus

class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # 'washer' or 'dryer'
    capacity = Column(String)
    status = Column(String, default=MachineStatus.FREE.value)  # 'free', 'occupied', 'finishing', 'maintenance'
    default_cycle_time = Column(Integer, default=45)
    machine_order = Column(Integer, default=0)
    current_cycle_end = Column(DateTime, nullable=True)
    current_turn_id = Column(Integer, ForeignKey("turns.id"), nullable=True)

    # Relationships
    turn = relationship("Turn", foreign_keys=[current_turn_id])

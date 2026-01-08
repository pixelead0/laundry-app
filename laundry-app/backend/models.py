from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # 'washer' or 'dryer'
    capacity = Column(String) # '10kg', '15kg', etc.
    status = Column(String, default="free")  # 'free', 'occupied', 'finishing', 'maintenance'
    current_cycle_end = Column(DateTime, nullable=True)
    current_turn_id = Column(Integer, ForeignKey("turns.id"), nullable=True)

    # Relationships
    turn = relationship("Turn", foreign_keys=[current_turn_id])

class Turn(Base):
    __tablename__ = "turns"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    customer_phone = Column(String)
    status = Column(String, default="waiting") # 'waiting', 'in_progress', 'completed', 'cancelled'
    created_at = Column(DateTime, default=datetime.utcnow)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=True)

class CycleConfig(Base):
    __tablename__ = "cycle_configs"

    id = Column(Integer, primary_key=True, index=True)
    machine_type = Column(String)
    load_size = Column(String) # 'small', 'medium', 'large'
    duration_minutes = Column(Integer)

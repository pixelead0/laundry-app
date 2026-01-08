from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from typing import List
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
import json
import asyncio

from backend.database import engine, get_db, Base, SessionLocal
from backend.models import Machine, Turn

app = FastAPI(title="Laundry System API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# Init DB
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed data if empty
    async with SessionLocal() as session:
        result = await session.execute(select(Machine))
        machines = result.scalars().all()
        if not machines:
            # Seed 5 washers and 5 dryers
            for i in range(1, 6):
                session.add(Machine(name=f"W{i}", type="washer", capacity="10kg", status="free"))
            for i in range(1, 6):
                session.add(Machine(name=f"D{i}", type="dryer", capacity="15kg", status="free"))
            await session.commit()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- APIs ---

# --- APIs ---

class MachineResponse(BaseModel):
    id: int
    name: str
    type: str
    capacity: str
    status: str
    default_cycle_time: int
    machine_order: int
    current_cycle_end: datetime | None = None
    current_turn_id: int | None = None

    class Config:
        orm_mode = True

@app.get("/machines", response_model=List[MachineResponse])
async def get_machines(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).order_by(Machine.machine_order.asc(), Machine.name.asc()))
    machines = result.scalars().all()
    # Ensure timezone info is present if missing (SQLite naive issue)
    # We can't easily mutate the ORM objects in place cleanly without detaching.
    # But Pydantic can handle naive datetimes if we tell it to assume UTC.
    # Let's rely on frontend assuming UTC for now if naive.
    return machines

@app.get("/turns")
async def get_turns(db: AsyncSession = Depends(get_db)):
    # 1. Get waiting and in_progress turns
    result = await db.execute(select(Turn).filter(Turn.status.in_(["waiting", "in_progress"])).order_by(Turn.created_at))
    turns = result.scalars().all()

    # 2. Get all machines for calculation mechanism

    m_result = await db.execute(select(Machine))
    machines = m_result.scalars().all()

    # Helper to calculate wait for a specific type
    def calculate_wait_times(machine_type):
        type_machines = [m for m in machines if m.type == machine_type]
        # Sort by end time: null (free) first, then by time
        # Free machines have wait_time = 0
        occupied = sorted([m for m in type_machines if m.status != "free" and m.current_cycle_end], key=lambda m: m.current_cycle_end)
        free_count = len([m for m in type_machines if m.status == "free"])

        return occupied, free_count

    washers_occupied_initial, washers_free_initial = calculate_wait_times("washer")
    dryers_occupied_initial, dryers_free_initial = calculate_wait_times("dryer")

    response = []

    # Simulated queues for calculation
    # Calculate estimated wait
    washers_occupied = list(washers_occupied_initial) # Create a mutable copy
    dryers_occupied = list(dryers_occupied_initial) # Create a mutable copy

    washers_free = washers_free_initial
    dryers_free = dryers_free_initial

    now = datetime.now(timezone.utc)

    # Populate initial occupied list
    # Simple heuristic: assume they want a washer if not specified (or we could add type to Turn)
    # For MVP, let's assume all waiting turns are for *any* machine, but predominantly washers first?
    # Actually, let's just show wait time for "next available washer" for now as a generic proxy
    # Or better: The turn itself doesn't specify type in MVP model yet.
    # Let's assume they are waiting for a WASHER for the calculation unless we add 'type' to Turn.
    # IMPROVEMENT: Add 'machine_type' to Turn model later. For now, assume Washer.

    for t in turns:
        # Simple heuristic: assume they want a washer if not specified (or we could add type to Turn)
        # For MVP, let's assume all waiting turns are for *any* machine, but predominantly washers first?
        # Actually, let's just show wait time for "next available washer" for now as a generic proxy
        # Or better: The turn itself doesn't specify type in MVP model yet.
        # Let's assume they are waiting for a WASHER for the calculation unless we add 'type' to Turn.
        # IMPROVEMENT: Add 'machine_type' to Turn model later. For now, assume Washer.

        estimated_wait_minutes = 0

        # Algorithm:
        # If free > 0: wait is 0, decrement free
        # Else: take earliest finish time, add that to queue
        # For MVP simplification: We will just return the list of people.
        # The prompt asked for "Wait time calculation".

        # Let's do a robust calculation assuming Washer for everyone for now (80% case)
        if washers_free > 0:
            estimated_wait_minutes = 0
            washers_free -= 1
            # We assume one washer becomes occupied starting NOW until NOW + default_cycle
            # Add a simulated occupied machine to the list for future people in line
            # We don't have a specific machine object, so we simulate a finish time.
            simulated_end_time = now + timedelta(minutes=45) # Average cycle if unknown
            # Insert into sorted list
            washers_occupied.append(type('obj', (object,), {'current_cycle_end': simulated_end_time, 'default_cycle_time': 45})())
            washers_occupied.sort(key=lambda m: m.current_cycle_end)
        else:
            if washers_occupied:
                # User takes the slot of the first machine to become free
                next_machine = washers_occupied.pop(0)

                # Wait time is diff between machine end and now
                wait_seconds = (next_machine.current_cycle_end - now).total_seconds()
                estimated_wait_minutes = int(max(0, wait_seconds / 60))

                # Now this machine is occupied by THIS user until (End Time + Cycle Time)
                # We use the machine's specific default_cycle_time if available, else 45
                cycle_duration = getattr(next_machine, 'default_cycle_time', 45)

                # If the machine finished in the past (wait=0), the new cycle starts NOW.
                # If it finishes in the future, new cycle starts THEN.
                start_time = max(now, next_machine.current_cycle_end)
                new_end_time = start_time + timedelta(minutes=cycle_duration)

                # Re-queue this machine with new end time
                # We create a dummy object or update the existing one if mutable (it's an ORM object, better not mutate in place if it affects DB, but here it's a list from query)
                # Safest to create a simple object/dict wrapper
                washers_occupied.append(type('obj', (object,), {'current_cycle_end': new_end_time, 'default_cycle_time': cycle_duration})())
                washers_occupied.sort(key=lambda m: m.current_cycle_end)
            else:
                estimated_wait_minutes = 30 # Should not happen if logic is correct unless 0 machines exist

        response.append({
            "id": t.id,
            "customer_name": t.customer_name,
            "status": t.status,
            "type": t.type,
            "estimated_wait": estimated_wait_minutes
        })

    return response

from pydantic import BaseModel
class TurnRequest(BaseModel):
    customer_name: str
    customer_phone: str
    type: str = "washer"

@app.post("/turns")
async def create_turn(turn: TurnRequest, db: AsyncSession = Depends(get_db)):
    new_turn = Turn(customer_name=turn.customer_name, customer_phone=turn.customer_phone, status="waiting", type=turn.type)
    db.add(new_turn)
    await db.commit()
    await db.refresh(new_turn)
    return new_turn

@app.post("/machines/{id}/assign")
async def assign_machine(id: int, duration_minutes: int = None, turn_id: int = None, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    # Use default cycle time if not provided
    final_duration = duration_minutes if duration_minutes is not None else machine.default_cycle_time

    end_time = datetime.now(timezone.utc) + timedelta(minutes=final_duration)

    machine.status = "occupied"
    machine.current_cycle_end = end_time

    # Handle Turn
    if turn_id:
        machine.current_turn_id = turn_id
        # Update Turn Status
        t_result = await db.execute(select(Turn).filter(Turn.id == turn_id))
        turn = t_result.scalar_one_or_none()
        if turn:
            turn.status = "in_progress"
            turn.machine_id = id

    await db.commit()
    await db.refresh(machine)

    # Broadcast update
    await manager.broadcast({
        "type": "machine_update",
        "id": id,
        "status": "occupied",
        # Force ISO format with Z if naive
        "end_time": end_time.isoformat().replace('+00:00', 'Z') if end_time else None,
        "turn_id": turn_id
    })

    return machine

@app.post("/machines/{id}/complete")
async def complete_machine(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    # Handle Turn Completion
    if machine.current_turn_id:
        t_result = await db.execute(select(Turn).filter(Turn.id == machine.current_turn_id))
        turn = t_result.scalar_one_or_none()
        if turn:
            turn.status = "completed"
        machine.current_turn_id = None

    machine.status = "free"
    machine.current_cycle_end = None
    await db.commit()

    await manager.broadcast({"type": "machine_update", "id": id, "status": "free", "turn_id": None})
    return machine

@app.post("/machines/{id}/cancel")
async def cancel_assignment(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    # Handle Active Turn - Reset to waiting
    if machine.current_turn_id:
        t_result = await db.execute(select(Turn).filter(Turn.id == machine.current_turn_id))
        turn = t_result.scalar_one_or_none()
        if turn:
            turn.status = "waiting"
            turn.machine_id = None
        machine.current_turn_id = None

    machine.status = "free"
    machine.current_cycle_end = None
    await db.commit()

    await manager.broadcast({"type": "machine_update", "id": id, "status": "free", "turn_id": None})
    return machine

class MachineCreate(BaseModel):
    name: str
    type: str
    capacity: str
    default_cycle_time: int = 45
    machine_order: int = 0

@app.post("/machines")
async def create_machine(machine: MachineCreate, db: AsyncSession = Depends(get_db)):
    new_machine = Machine(
        name=machine.name,
        type=machine.type,
        capacity=machine.capacity,
        status="free",
        default_cycle_time=machine.default_cycle_time,
        machine_order=machine.machine_order
    )
    db.add(new_machine)
    await db.commit()
    await db.refresh(new_machine)
    return new_machine

@app.delete("/machines/{id}")
async def delete_machine(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    await db.delete(machine)
    await db.commit()
    return {"message": "Machine deleted"}

@app.post("/machines/{id}/maintenance")
async def report_machine_failure(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    # Handle Active Turn - Reset to waiting
    if machine.current_turn_id:
        t_result = await db.execute(select(Turn).filter(Turn.id == machine.current_turn_id))
        turn = t_result.scalar_one_or_none()
        if turn:
            turn.status = "waiting"
            turn.machine_id = None
        machine.current_turn_id = None

    machine.status = "maintenance"
    machine.current_cycle_end = None

    await db.commit()
    await manager.broadcast({"type": "machine_update", "id": id, "status": "maintenance", "turn_id": None})
    return machine

@app.post("/machines/{id}/recover")
async def recover_machine(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    machine.status = "free"
    machine.current_cycle_end = None
    machine.current_turn_id = None

    await db.commit()
    await manager.broadcast({"type": "machine_update", "id": id, "status": "free", "turn_id": None})
    return machine

@app.put("/machines/{id}")
async def update_machine_details(id: int, machine: MachineCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    db_machine = result.scalar_one_or_none()
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    db_machine.name = machine.name
    db_machine.type = machine.type
    db_machine.capacity = machine.capacity
    db_machine.default_cycle_time = machine.default_cycle_time
    db_machine.machine_order = machine.machine_order

    await db.commit()
    await db.refresh(db_machine)
    return db_machine

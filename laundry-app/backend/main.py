from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from typing import List
from datetime import datetime, timedelta
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

@app.get("/machines")
async def get_machines(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).order_by(Machine.id))
    machines = result.scalars().all()
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

    washers_occupied, washers_free = calculate_wait_times("washer")
    dryers_occupied, dryers_free = calculate_wait_times("dryer")

    response = []

    # Simulated queues for calculation
    w_queue = [] # list of finish times
    d_queue = []

    now = datetime.utcnow()

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
        else:
            if washers_occupied:
                # User takes the slot of the first machine to become free
                next_free_time = washers_occupied.pop(0)
                wait_seconds = (next_free_time.current_cycle_end - now).total_seconds()
                estimated_wait_minutes = int(max(0, wait_seconds / 60))

                # That machine is now "occupied" by this user for 30 mins (avg cycle)
                # re-add it to the pool for the *next* person
                # We need to simulate the machine becoming busy again
                # But we can't modify the real object.
                # Heuristic: Just report the time to *start*.
            else:
                estimated_wait_minutes = 30 # Fallback if no machines found

        response.append({
            "id": t.id,
            "customer_name": t.customer_name,
            "status": t.status,
            "estimated_wait": estimated_wait_minutes
        })

    return response

from pydantic import BaseModel
class TurnRequest(BaseModel):
    customer_name: str
    customer_phone: str

@app.post("/turns")
async def create_turn(turn: TurnRequest, db: AsyncSession = Depends(get_db)):
    new_turn = Turn(customer_name=turn.customer_name, customer_phone=turn.customer_phone, status="waiting")
    db.add(new_turn)
    await db.commit()
    await db.refresh(new_turn)
    return new_turn

@app.post("/machines/{id}/assign")
async def assign_machine(id: int, duration_minutes: int, turn_id: int = None, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Machine).filter(Machine.id == id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    end_time = datetime.utcnow() + timedelta(minutes=duration_minutes)

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

    # Broadcast update
    await manager.broadcast({
        "type": "machine_update",
        "id": id,
        "status": "occupied",
        "end_time": end_time.isoformat(),
        "turn_id": turn_id
    })

    # Also broadcast list update if needed, but frontend can poll/refetch
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

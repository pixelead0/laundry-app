import pytest
from httpx import AsyncClient
from app.core.enums import MachineStatus, MachineType, TurnStatus
from app.models.machine import Machine
from fastapi.testclient import TestClient
from app.main import app

def test_sync_machines_coverage():
    client = TestClient(app)
    # This should definitely be covered if coverage works at all
    response = client.get("/machines/")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_create_get_machine(client: AsyncClient):
    # Create
    response = await client.post("/machines/", json={
        "name": "W1",
        "type": "washer",
        "capacity": "15kg",
        "default_cycle_time": 45
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "W1"
    assert data["status"] == "free"

    # Get List
    response = await client.get("/machines/")
    assert response.status_code == 200
    assert len(response.json()) == 1

@pytest.mark.asyncio
async def test_update_machine(client: AsyncClient):
    # Setup
    await client.post("/machines/", json={"name": "D1", "type": "dryer", "capacity": "10kg"})

    # Update
    response = await client.put("/machines/1", json={"name": "D1-Pro", "type": "dryer", "capacity": "12kg"})
    assert response.status_code == 200
    assert response.json()["name"] == "D1-Pro"
    assert response.json()["capacity"] == "12kg"

@pytest.mark.asyncio
async def test_delete_machine(client: AsyncClient):
    # Setup
    await client.post("/machines/", json={"name": "D2", "type": "dryer", "capacity": "10kg"})

    # Delete
    response = await client.delete("/machines/1")
    assert response.status_code == 200

    # Verify
    response = await client.get("/machines/")
    assert len(response.json()) == 0

@pytest.mark.asyncio
async def test_assign_machine(client: AsyncClient):
    # Setup machine
    await client.post("/machines/", json={"name": "W2", "type": "washer", "capacity": "10kg"})

    # Assign (Assignment sends WebSocket broadcast, need to mock manager if strict,
    # but for integration we check DB changes)
    response = await client.post("/machines/1/assign?duration_minutes=30")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == MachineStatus.OCCUPIED.value
    assert data["current_cycle_end"] is not None

@pytest.mark.asyncio
async def test_complete_machine(client: AsyncClient):
    # Setup
    await client.post("/machines/", json={"name": "W3", "type": "washer", "capacity": "10kg"})
    await client.post("/machines/1/assign") # Occupy it

    # Complete
    response = await client.post("/machines/1/complete")
    assert response.status_code == 200
    assert response.json()["status"] == MachineStatus.FREE.value

@pytest.mark.asyncio
async def test_fail_recover_machine(client: AsyncClient):
    # Setup
    await client.post("/machines/", json={"name": "W4", "type": "washer", "capacity": "10kg"})

    # Maintenance
    response = await client.post("/machines/1/maintenance")
    assert response.status_code == 200
    assert response.json()["status"] == MachineStatus.MAINTENANCE.value

    # Recover
    response = await client.post("/machines/1/recover")
    assert response.status_code == 200
    assert response.json()["status"] == MachineStatus.FREE.value

@pytest.mark.asyncio
async def test_machine_actions_with_turns(client: AsyncClient):
    # Setup
    m1 = await client.post("/machines/", json={"name": "Integration-W", "type": "washer", "capacity": "10kg"})
    m1_id = m1.json()["id"]

    t1 = await client.post("/turns/", json={"customer_name": "T1", "customer_phone": "1", "type": "washer"})
    t1_id = t1.json()["id"]

    # 1. Assign with Turn
    resp = await client.post(f"/machines/{m1_id}/assign?turn_id={t1_id}")
    assert resp.status_code == 200
    # Verify Turn is IN_PROGRESS
    # We can't GET /turns/{id} directly, verifying via listing or side effect?
    # Actually we can trust the return of assign/complete if they expose it? No, they return Machine.
    # We can inspect the DB directly using test_db fixture if we passed it, but client tests are cleaner.
    # We can use GET /turns/ to see if it's there (it's In Progress)
    turns = (await client.get("/turns/")).json()
    assert any(t["id"] == t1_id and t["status"] == "in_progress" for t in turns)

    # 2. Cancel Assignment (should revert Turn to WAITING)
    resp = await client.post(f"/machines/{m1_id}/cancel")
    assert resp.status_code == 200
    turns = (await client.get("/turns/")).json()
    assert any(t["id"] == t1_id and t["status"] == "waiting" for t in turns)

    # 3. Re-assign
    await client.post(f"/machines/{m1_id}/assign?turn_id={t1_id}")

    # 4. Maintenance (should revert Turn to WAITING)
    resp = await client.post(f"/machines/{m1_id}/maintenance")
    assert resp.status_code == 200
    turns = (await client.get("/turns/")).json()
    assert any(t["id"] == t1_id and t["status"] == "waiting" for t in turns)

    # Recover
    await client.post(f"/machines/{m1_id}/recover")

    # 5. Re-assign and Complete
    await client.post(f"/machines/{m1_id}/assign?turn_id={t1_id}")
    resp = await client.post(f"/machines/{m1_id}/complete")
    assert resp.status_code == 200
    # Turn should be COMPLETED (not in /turns/ listing)
    turns = (await client.get("/turns/")).json()
    assert not any(t["id"] == t1_id for t in turns)

@pytest.mark.asyncio
async def test_machine_not_found(client: AsyncClient):
    # Update unknown
    response = await client.put("/machines/999", json={"name": "X", "type": "washer", "capacity": "1"})
    assert response.status_code == 404

    # Delete unknown
    response = await client.delete("/machines/999")
    assert response.status_code == 404

    # Assign unknown
    response = await client.post("/machines/999/assign")
    assert response.status_code == 404

    # Complete unknown
    response = await client.post("/machines/999/complete")
    assert response.status_code == 404

    # Maintenance unknown
    response = await client.post("/machines/999/maintenance")
    assert response.status_code == 404

    # Recover unknown
    response = await client.post("/machines/999/recover")
    assert response.status_code == 404

    # Cancel unknown
    response = await client.post("/machines/999/cancel")
    assert response.status_code == 404

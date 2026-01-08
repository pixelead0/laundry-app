import pytest
from httpx import AsyncClient
from app.core.enums import TurnStatus, MachineType

@pytest.mark.asyncio
async def test_create_and_get_turns(client: AsyncClient):
    # Create Turn
    response = await client.post("/turns/", json={
        "customer_name": "Alice",
        "customer_phone": "555-1234",
        "type": "washer"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["customer_name"] == "Alice"
    assert data["status"] == TurnStatus.WAITING.value

    # Get Turns
    response = await client.get("/turns/")
    assert response.status_code == 200
    turns = response.json()
    assert len(turns) == 1
    assert turns[0]["customer_name"] == "Alice"
    # Basic check for estimated_wait existence (calculated field)
    assert "estimated_wait" in turns[0]

@pytest.mark.asyncio
async def test_turns_filtering(client: AsyncClient):
    # Add multiple turns
    await client.post("/turns/", json={"customer_name": "Bob", "customer_phone": "1", "type": "dryer"})
    await client.post("/turns/", json={"customer_name": "Charlie", "customer_phone": "2", "type": "washer"})

    # Only waiting/in_progress are returned by default GET /turns logic
    response = await client.get("/turns/")
    assert len(response.json()) == 2

@pytest.mark.asyncio
async def test_assign_turn_flow(client: AsyncClient):
    # 1. Create Machine
    await client.post("/machines/", json={"name": "W1", "type": "washer", "capacity": "15kg"})

    # 2. Create Turn
    tr = await client.post("/turns/", json={"customer_name": "Dave", "customer_phone": "999", "type": "washer"})
    turn_id = tr.json()["id"]

    # 3. Assign Machine to Turn
    # The machine assignment endpoint logic handles updating the turn status
    resp = await client.post(f"/machines/1/assign?turn_id={turn_id}")
    assert resp.status_code == 200

    # 4. Verify Turn Status is IN_PROGRESS
    # We don't have a GET /turns/{id} endpoint, so we list all
    # Actually GET /turns/ only returns waiting/in_progress, so it should appear with status in_progress
    list_resp = await client.get("/turns/")
    turns = list_resp.json()
    found = next(t for t in turns if t["id"] == turn_id)
    assert found["status"] == TurnStatus.IN_PROGRESS.value

@pytest.mark.asyncio
async def test_complete_turn_flow(client: AsyncClient):
    # Setup: Machine + Turn + Assignment
    await client.post("/machines/", json={"name": "W-End", "type": "washer", "capacity": "10kg"})
    tr = await client.post("/turns/", json={"customer_name": "EndUser", "customer_phone": "000", "type": "washer"})
    tid = tr.json()["id"]
    await client.post(f"/machines/1/assign?turn_id={tid}")

    # Complete Machine
    await client.post("/machines/1/complete")

    # Verify Turn is COMPLETED
    # Completed turns are NOT returned by default GET /turns (logic filters for waiting/in_progress)
    list_resp = await client.get("/turns/")
    turns = list_resp.json()
    # It should NOT be in the list
    assert not any(t["id"] == tid for t in turns)

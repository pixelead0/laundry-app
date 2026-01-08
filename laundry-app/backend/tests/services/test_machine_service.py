import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone, timedelta

from app.services.machine_service import MachineService
from app.models.machine import Machine
from app.models.turn import Turn
from app.core.enums import MachineStatus, TurnStatus
from fastapi import HTTPException


@pytest.mark.asyncio
async def test_get_all_machines():
    """Test retrieving all machines ordered correctly"""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_machines = [
        Machine(id=1, name="W1", type="washer", status="free", machine_order=1),
        Machine(id=2, name="W2", type="washer", status="occupied", machine_order=2)
    ]
    mock_result.scalars.return_value.all.return_value = mock_machines
    mock_db.execute.return_value = mock_result

    machines = await MachineService.get_all(mock_db)

    assert len(machines) == 2
    assert machines[0].name == "W1"
    mock_db.execute.assert_called_once()


@pytest.mark.asyncio
async def test_create_machine():
    """Test creating a new machine"""
    mock_db = AsyncMock()
    machine_data = {
        "name": "W3",
        "type": "washer",
        "capacity": "10kg",
        "default_cycle_time": 45,
        "machine_order": 3
    }

    machine = await MachineService.create(mock_db, machine_data)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_get_by_id_success():
    """Test retrieving a machine by ID"""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_machine = Machine(id=1, name="W1", type="washer", status="free")
    mock_result.scalar_one_or_none.return_value = mock_machine
    mock_db.execute.return_value = mock_result

    machine = await MachineService.get_by_id(mock_db, 1)

    assert machine.id == 1
    assert machine.name == "W1"


@pytest.mark.asyncio
async def test_get_by_id_not_found():
    """Test retrieving a non-existent machine raises 404"""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    with pytest.raises(HTTPException) as exc_info:
        await MachineService.get_by_id(mock_db, 999)

    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_update_machine():
    """Test updating machine details"""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_machine = Machine(id=1, name="W1", type="washer", status="free")
    mock_result.scalar_one_or_none.return_value = mock_machine
    mock_db.execute.return_value = mock_result

    updates = {"name": "WASHER-1", "capacity": "15kg"}
    machine = await MachineService.update(mock_db, 1, updates)

    assert machine.name == "WASHER-1"
    assert machine.capacity == "15kg"
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_delete_machine():
    """Test deleting a machine"""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_machine = Machine(id=1, name="W1", type="washer", status="free")
    mock_result.scalar_one_or_none.return_value = mock_machine
    mock_db.execute.return_value = mock_result

    await MachineService.delete(mock_db, 1)

    mock_db.delete.assert_called_once_with(mock_machine)
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
@patch('app.services.machine_service.manager')
async def test_assign_machine_without_turn(mock_manager):
    """Test assigning a machine without a turn"""
    mock_manager.broadcast = AsyncMock()
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_machine = Machine(id=1, name="W1", type="washer", status="free", default_cycle_time=45)
    mock_result.scalar_one_or_none.return_value = mock_machine
    mock_db.execute.return_value = mock_result

    machine = await MachineService.assign(mock_db, 1, None, None)

    assert machine.status == MachineStatus.OCCUPIED.value
    assert machine.current_cycle_end is not None
    mock_db.commit.assert_called_once()
    mock_manager.broadcast.assert_called_once()


@pytest.mark.asyncio
@patch('app.services.machine_service.manager')
async def test_assign_machine_with_turn(mock_manager):
    """Test assigning a machine with a turn"""
    mock_manager.broadcast = AsyncMock()
    mock_db = AsyncMock()

    # Mock machine
    mock_machine_result = MagicMock()
    mock_machine = Machine(id=1, name="W1", type="washer", status="free", default_cycle_time=45)
    mock_machine_result.scalar_one_or_none.return_value = mock_machine

    # Mock turn
    mock_turn_result = MagicMock()
    mock_turn = Turn(id=10, customer_name="Test", status=TurnStatus.WAITING.value)
    mock_turn_result.scalar_one_or_none.return_value = mock_turn

    mock_db.execute.side_effect = [mock_machine_result, mock_turn_result]

    machine = await MachineService.assign(mock_db, 1, 30, 10)

    assert machine.status == MachineStatus.OCCUPIED.value
    assert machine.current_turn_id == 10
    assert mock_turn.status == TurnStatus.IN_PROGRESS.value
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
@patch('app.services.machine_service.manager')
async def test_complete_machine_with_turn(mock_manager):
    """Test completing a machine that has an active turn"""
    mock_manager.broadcast = AsyncMock()
    mock_db = AsyncMock()

    mock_machine_result = MagicMock()
    mock_machine = Machine(id=1, name="W1", status="occupied", current_turn_id=10)
    mock_machine_result.scalar_one_or_none.return_value = mock_machine

    mock_turn_result = MagicMock()
    mock_turn = Turn(id=10, customer_name="Test", status=TurnStatus.IN_PROGRESS.value)
    mock_turn_result.scalar_one_or_none.return_value = mock_turn

    mock_db.execute.side_effect = [mock_machine_result, mock_turn_result]

    machine = await MachineService.complete(mock_db, 1)

    assert machine.status == MachineStatus.FREE.value
    assert machine.current_turn_id is None
    assert mock_turn.status == TurnStatus.COMPLETED.value
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
@patch('app.services.machine_service.manager')
async def test_cancel_assignment(mock_manager):
    """Test canceling a machine assignment"""
    mock_manager.broadcast = AsyncMock()
    mock_db = AsyncMock()

    mock_machine_result = MagicMock()
    mock_machine = Machine(id=1, name="W1", status="occupied", current_turn_id=10)
    mock_machine_result.scalar_one_or_none.return_value = mock_machine

    mock_turn_result = MagicMock()
    mock_turn = Turn(id=10, customer_name="Test", status=TurnStatus.IN_PROGRESS.value)
    mock_turn_result.scalar_one_or_none.return_value = mock_turn

    mock_db.execute.side_effect = [mock_machine_result, mock_turn_result]

    machine = await MachineService.cancel(mock_db, 1)

    assert machine.status == MachineStatus.FREE.value
    assert machine.current_turn_id is None
    assert mock_turn.status == TurnStatus.WAITING.value
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
@patch('app.services.machine_service.manager')
async def test_maintenance_mode(mock_manager):
    """Test setting a machine to maintenance"""
    mock_manager.broadcast = AsyncMock()
    mock_db = AsyncMock()

    mock_machine_result = MagicMock()
    mock_machine = Machine(id=1, name="W1", status="occupied", current_turn_id=10)
    mock_machine_result.scalar_one_or_none.return_value = mock_machine

    mock_turn_result = MagicMock()
    mock_turn = Turn(id=10, customer_name="Test", status=TurnStatus.IN_PROGRESS.value)
    mock_turn_result.scalar_one_or_none.return_value = mock_turn

    mock_db.execute.side_effect = [mock_machine_result, mock_turn_result]

    machine = await MachineService.maintenance(mock_db, 1)

    assert machine.status == MachineStatus.MAINTENANCE.value
    assert machine.current_turn_id is None
    assert mock_turn.status == TurnStatus.WAITING.value
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
@patch('app.services.machine_service.manager')
async def test_recover_machine(mock_manager):
    """Test recovering a machine from maintenance"""
    mock_manager.broadcast = AsyncMock()
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_machine = Machine(id=1, name="W1", status="maintenance")
    mock_result.scalar_one_or_none.return_value = mock_machine
    mock_db.execute.return_value = mock_result

    machine = await MachineService.recover(mock_db, 1)

    assert machine.status == MachineStatus.FREE.value
    assert machine.current_cycle_end is None
    assert machine.current_turn_id is None
    mock_db.commit.assert_called_once()
    mock_manager.broadcast.assert_called_once()

from datetime import datetime, timezone, timedelta
from app.services.waitlist import WaitlistService
from app.models.machine import Machine
from app.models.turn import Turn
from app.core.enums import MachineStatus, MachineType, TurnStatus

class TestWaitlistService:
    def test_calculate_wait_empty(self):
        """Test calculation with no waiting turns returns empty list."""
        machines = [Machine(id=1, type=MachineType.WASHER, status=MachineStatus.FREE, default_cycle_time=45)]
        result = WaitlistService.calculate_wait([], machines, MachineType.WASHER)
        assert result == []

    def test_calculate_wait_basic(self):
        """Test simple wait calculation for one turn with one free machine."""
        machines = [Machine(id=1, type=MachineType.WASHER, status=MachineStatus.FREE, default_cycle_time=45)]
        turn = Turn(
            id=1,
            customer_name="Test",
            customer_phone="123",
            status=TurnStatus.WAITING,
            type=MachineType.WASHER,
            created_at=datetime.now(timezone.utc)
        )

        result = WaitlistService.calculate_wait([turn], machines, MachineType.WASHER)

        assert len(result) == 1
        assert result[0]["estimated_wait"] == 0
        assert result[0]["customer_phone"] == "123"

    def test_calculate_wait_occupied(self):
        """Test wait calculation when machine is occupied."""
        now = datetime.now(timezone.utc)
        # Cycle ends in 20 mins
        end_time = now + timedelta(minutes=20)

        machines = [
            Machine(
                id=1,
                type=MachineType.WASHER,
                status=MachineStatus.OCCUPIED,
                default_cycle_time=45,
                current_cycle_end=end_time
            )
        ]

        turn = Turn(
            id=1,
            customer_name="Test",
            customer_phone="123", # Checking field persistence
            status=TurnStatus.WAITING,
            type=MachineType.WASHER,
            created_at=now
        )

        result = WaitlistService.calculate_wait([turn], machines, MachineType.WASHER)

        assert len(result) == 1
        # Wait should be approx 20 mins
        assert 19 <= result[0]["estimated_wait"] <= 21

    def test_calculate_wait_multiple_turns(self):
        """Test cascading wait times for multiple turns."""
        now = datetime.now(timezone.utc)

        machines = [
            Machine(id=1, type=MachineType.WASHER, status=MachineStatus.FREE, default_cycle_time=45)
        ]

        t1 = Turn(id=1, customer_name="A", customer_phone="A", status=TurnStatus.WAITING, type=MachineType.WASHER, created_at=now)
        t2 = Turn(id=2, customer_name="B", customer_phone="B", status=TurnStatus.WAITING, type=MachineType.WASHER, created_at=now)

        result = WaitlistService.calculate_wait([t1, t2], machines, MachineType.WASHER)

        assert len(result) == 2

        # First person gets free machine immediately
        assert result[0]["id"] == 1
        assert result[0]["estimated_wait"] == 0

        # Second person waits 45 mins (cycle time)
        assert result[1]["id"] == 2
        assert result[1]["estimated_wait"] == 45

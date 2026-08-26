from datetime import datetime, timedelta, timezone
from app.models.machine import Machine
from app.models.turn import Turn
from app.core.enums import MachineType, MachineStatus

class SimMachine:
    def __init__(self, end_time, cycle_time):
        self.current_cycle_end = end_time
        self.default_cycle_time = cycle_time

class WaitlistService:
    @staticmethod
    def calculate_wait(waiting_list: list[Turn], all_machines: list[Machine], machine_type: MachineType) -> list[dict]:
        # Handle both enum and string inputs
        type_value = machine_type.value if hasattr(machine_type, 'value') else machine_type
        type_machines = [m for m in all_machines if m.type == type_value]
        # Skip machines in maintenance
        available_machines = [m for m in type_machines if m.status != MachineStatus.MAINTENANCE.value]
        free_count = len([m for m in available_machines if m.status == MachineStatus.FREE.value])

        occupied = []
        for m in available_machines:
            if m.status == MachineStatus.OCCUPIED.value and m.current_cycle_end:
                end = m.current_cycle_end
                occupied.append(SimMachine(end, m.default_cycle_time))

        occupied.sort(key=lambda m: m.current_cycle_end.replace(tzinfo=None) if getattr(m.current_cycle_end, 'tzinfo', None) else m.current_cycle_end)

        results = []
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        sim_occupied = list(occupied)
        current_free = free_count

        for t in waiting_list:
            if current_free > 0:
                wait_min = 0
                current_free -= 1
                sim_end = now + timedelta(minutes=45)
                sim_occupied.append(SimMachine(sim_end, 45))
                sim_occupied.sort(key=lambda m: m.current_cycle_end.replace(tzinfo=None) if getattr(m.current_cycle_end, 'tzinfo', None) else m.current_cycle_end)
            else:
                if sim_occupied:
                    m = sim_occupied.pop(0)
                    cycle_end = m.current_cycle_end.replace(tzinfo=None) if getattr(m.current_cycle_end, 'tzinfo', None) else m.current_cycle_end
                    wait_sec = (cycle_end - now).total_seconds()
                    wait_min = int(max(0, wait_sec / 60))

                    cycle_dur = getattr(m, 'default_cycle_time', 45)
                    start = max(now, cycle_end)
                    new_end = start + timedelta(minutes=cycle_dur)

                    sim_occupied.append(SimMachine(new_end, cycle_dur))
                    sim_occupied.sort(key=lambda m: m.current_cycle_end.replace(tzinfo=None) if getattr(m.current_cycle_end, 'tzinfo', None) else m.current_cycle_end)
                else:
                    wait_min = 30 # Fallback

            results.append({
                "id": t.id,
                "customer_name": t.customer_name,
                "customer_phone": t.customer_phone,
                "status": t.status,
                "type": t.type,
                "estimated_wait": wait_min,
                "created_at": t.created_at,
                "machine_id": t.machine_id
            })
        return results

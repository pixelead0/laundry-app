from enum import Enum

class MachineType(str, Enum):
    WASHER = "washer"
    DRYER = "dryer"

class MachineStatus(str, Enum):
    FREE = "free"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"

class TurnStatus(str, Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

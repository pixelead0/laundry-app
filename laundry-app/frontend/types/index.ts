export type TurnStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';
export type MachineType = 'washer' | 'dryer';
export type MachineStatus = 'free' | 'occupied' | 'finishing' | 'maintenance';

export interface Turn {
    id: number;
    customer_name: string;
    customer_phone?: string;
    status: TurnStatus;
    type: MachineType;
    estimated_wait: number;
}

export interface Machine {
    id: number;
    name: string;
    type: MachineType;
    capacity: string;
    status: MachineStatus;
    default_cycle_time: number;
    machine_order: number;
    current_cycle_end: string | null;
    current_turn_id: number | null;
}

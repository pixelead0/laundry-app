import { create } from 'zustand';
import { api } from '../services/api';
import { Machine, Turn } from '../types';

interface MachineStore {
    machines: Machine[];
    turns: Turn[];
    setMachines: (machines: Machine[]) => void;
    updateMachine: (id: number, updates: Partial<Machine>) => void;
    fetchMachines: () => Promise<void>;
    fetchTurns: () => Promise<void>;
    addTurn: (name: string, phone: string, type: string) => Promise<void>;
    assignTurnToMachine: (machineId: number, turnId?: number) => Promise<void>;
    createMachine: (name: string, type: string, capacity: string, duration: number, order: number) => Promise<void>;
    deleteMachine: (id: number) => Promise<void>;
    updateMachineDetails: (id: number, updates: Partial<Machine>) => Promise<void>;
    reportFailure: (id: number) => Promise<void>;
    recoverMachine: (id: number) => Promise<void>;
    completeMachine: (id: number) => Promise<void>;
    cancelAssignment: (id: number) => Promise<void>;
}

export const useMachineStore = create<MachineStore>((set, get) => ({
    machines: [],
    turns: [],
    setMachines: (machines) => set({ machines }),
    updateMachine: (id, updates) =>
        set((state) => ({
            machines: state.machines.map((m) =>
                m.id === id ? { ...m, ...updates } : m
            ),
        })),
    fetchMachines: async () => {
        try {
            const data = await api.fetchMachines();
            set({ machines: data });
        } catch (error) {
            console.error('Failed to fetch machines:', error);
        }
    },
    fetchTurns: async () => {
        try {
            const data = await api.fetchTurns();
            set({ turns: data });
        } catch (error) {
            console.error('Failed to fetch turns:', error);
        }
    },
    addTurn: async (name, phone, type) => {
        await api.addTurn(name, phone, type);
        get().fetchTurns();
    },
    assignTurnToMachine: async (machineId, turnId) => {
        await api.assignTurn(machineId, turnId);
    },
    createMachine: async (name, type, capacity, duration, order) => {
        await api.createMachine({ name, type, capacity, default_cycle_time: duration, machine_order: order });
        get().fetchMachines();
    },
    deleteMachine: async (id) => {
        await api.deleteMachine(id);
        get().fetchMachines();
    },
    updateMachineDetails: async (id, updates) => {
        const current = get().machines.find(m => m.id === id);
        if (!current) return;
        const payload = {
            name: updates.name || current.name,
            type: updates.type || current.type,
            capacity: updates.capacity || current.capacity,
            default_cycle_time: updates.default_cycle_time || current.default_cycle_time,
            machine_order: updates.machine_order !== undefined ? updates.machine_order : current.machine_order
        };
        await api.updateMachine(id, payload);
        get().fetchMachines();
    },
    reportFailure: async (id) => {
        await api.setMaintenance(id);
        get().fetchTurns();
        get().fetchMachines();
    },
    recoverMachine: async (id) => {
        await api.recoverMachine(id);
        get().fetchMachines();
    },
    completeMachine: async (id) => {
        await api.completeMachine(id);
        get().fetchMachines();
    },
    cancelAssignment: async (id) => {
        await api.cancelAssignment(id);
        get().fetchMachines();
        get().fetchTurns();
    },
}));

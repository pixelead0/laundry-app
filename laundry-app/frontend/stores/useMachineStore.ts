import { create } from 'zustand'

export type Turn = {
    id: number
    customer_name: string
    status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
    estimated_wait: number
}

export type Machine = {
    id: number
    name: string
    type: 'washer' | 'dryer'
    capacity: string
    status: 'free' | 'occupied' | 'finishing' | 'maintenance'
    current_cycle_end: string | null
    current_turn_id: number | null
}

interface MachineStore {
    machines: Machine[]
    turns: Turn[]
    setMachines: (machines: Machine[]) => void
    updateMachine: (id: number, updates: Partial<Machine>) => void
    fetchMachines: () => Promise<void>
    fetchTurns: () => Promise<void>
    addTurn: (name: string, phone: string) => Promise<void>
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
            const host = window.location.hostname
            const res = await fetch(`http://${host}:8000/machines`)
            const data = await res.json()
            set({ machines: data })
        } catch (error) {
            console.error('Failed to fetch machines:', error)
        }
    },
    fetchTurns: async () => {
        try {
            const host = window.location.hostname
            const res = await fetch(`http://${host}:8000/turns`)
            const data = await res.json()
            set({ turns: data })
        } catch (error) {
            console.error('Failed to fetch turns:', error)
        }
    },
    addTurn: async (name: string, phone: string) => {
        const host = window.location.hostname
        const res = await fetch(`http://${host}:8000/turns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_name: name, customer_phone: phone }),
        })
        if (!res.ok) throw new Error('Failed to add turn')
        get().fetchTurns()
    },
    assignTurnToMachine: async (machineId: number, turnId?: number) => {
        const host = window.location.hostname
        // If turnId is provided, we use the specific assign flow
        const url = `http://${host}:8000/machines/${machineId}/assign?duration_minutes=45${turnId ? `&turn_id=${turnId}` : ''}`
        const res = await fetch(url, { method: 'POST' })
        if (!res.ok) throw new Error('Failed to assign machine')
    },
}))

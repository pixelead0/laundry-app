import { create } from 'zustand'

export type Turn = {
    id: number
    customer_name: string
    status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
    estimated_wait: number
    type?: 'washer' | 'dryer'
}

export type Machine = {
    id: number
    name: string
    type: 'washer' | 'dryer'
    capacity: string
    status: 'free' | 'occupied' | 'finishing' | 'maintenance'
    default_cycle_time: number
    machine_order: number
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
    addTurn: (name: string, phone: string, type: 'washer' | 'dryer') => Promise<void>
    createMachine: (name: string, type: 'washer' | 'dryer', capacity: string, duration: number, order: number) => Promise<void>
    deleteMachine: (id: number) => Promise<void>
    updateMachineDetails: (id: number, updates: Partial<Machine>) => Promise<void>
    reportFailure: (id: number) => Promise<void>
    recoverMachine: (id: number) => Promise<void>
    completeMachine: (id: number) => Promise<void>
    cancelAssignment: (id: number) => Promise<void>
}
// ... (existing code)

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
    addTurn: async (name: string, phone: string, type: 'washer' | 'dryer') => {
        const host = window.location.hostname
        const res = await fetch(`http://${host}:8000/turns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_name: name, customer_phone: phone, type }),
        })
        if (!res.ok) throw new Error('Failed to add turn')
        get().fetchTurns()
    },
    assignTurnToMachine: async (machineId: number, turnId?: number) => {
        const host = window.location.hostname
        // If turnId is provided, we use the specific assign flow.
        // Backend now uses default_cycle_time if duration_minutes is not passed.
        const url = `http://${host}:8000/machines/${machineId}/assign?${turnId ? `turn_id=${turnId}` : ''}`
        const res = await fetch(url, { method: 'POST' })
        if (!res.ok) throw new Error('Failed to assign machine')
    },
    createMachine: async (name, type, capacity, duration, order) => {
        const host = window.location.hostname
        const res = await fetch(`http://${host}:8000/machines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, capacity, default_cycle_time: duration, machine_order: order }),
        })
        if (!res.ok) throw new Error('Failed to create machine')
        get().fetchMachines()
    },
    deleteMachine: async (id) => {
        const host = window.location.hostname
        const res = await fetch(`http://${host}:8000/machines/${id}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete machine')
        get().fetchMachines()
    },
    updateMachineDetails: async (id, updates) => {
        const host = window.location.hostname
        // We need to send the full machine object or partial? Backend expects MachineCreate which has all fields.
        // Let's first get the current machine to merge.
        const currentMachine = get().machines.find(m => m.id === id)
        if (!currentMachine) return

        const payload = {
            name: updates.name || currentMachine.name,
            type: updates.type || currentMachine.type,
            capacity: updates.capacity || currentMachine.capacity,
            default_cycle_time: updates.default_cycle_time || currentMachine.default_cycle_time,
            machine_order: updates.machine_order !== undefined ? updates.machine_order : currentMachine.machine_order
        }

        const res = await fetch(`http://${host}:8000/machines/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to update machine')
        get().fetchMachines()
    },
    reportFailure: async (id) => {
        const host = window.location.hostname
        const res = await fetch(`http://${host}:8000/machines/${id}/maintenance`, {
            method: 'POST',
        })
        if (!res.ok) throw new Error('Failed to report failure')
        get().fetchTurns() // Turns update might happen (re-queue)
        get().fetchMachines()
    },
    recoverMachine: async (id) => {
        const host = window.location.hostname
        const res = await fetch(`http://${host}:8000/machines/${id}/recover`, {
            method: 'POST',
        })
        if (!res.ok) throw new Error('Failed to recover machine')
        get().fetchMachines()
    },
    completeMachine: async (id: number) => {
        const host = window.location.hostname
        const res = await fetch(`http://${host}:8000/machines/${id}/complete`, {
            method: 'POST',
        })
        if (!res.ok) throw new Error('Failed to complete machine')
        get().fetchMachines()
    },
    cancelAssignment: async (id: number) => {
        const host = window.location.hostname
        const res = await fetch(`http://${host}:8000/machines/${id}/cancel`, {
            method: 'POST',
        })
        if (!res.ok) throw new Error('Failed to cancel assignment')
        get().fetchMachines()
        get().fetchTurns()
    },
}))

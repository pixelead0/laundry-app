import { Machine, Turn } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:8000`
        : 'http://localhost:8000');

export const api = {
    async fetchMachines(): Promise<Machine[]> {
        const res = await fetch(`${API_URL}/machines`);
        if (!res.ok) throw new Error('Failed to fetch machines');
        return res.json();
    },

    async fetchTurns(): Promise<Turn[]> {
        const res = await fetch(`${API_URL}/turns`);
        if (!res.ok) throw new Error('Failed to fetch turns');
        return res.json();
    },

    async addTurn(name: string, phone: string, type: string): Promise<void> {
        const res = await fetch(`${API_URL}/turns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_name: name, customer_phone: phone, type }),
        });
        if (!res.ok) throw new Error('Failed to add turn');
    },

    async assignTurn(machineId: number, turnId?: number): Promise<void> {
        const url = `${API_URL}/machines/${machineId}/assign?${turnId ? `turn_id=${turnId}` : ''}`;
        const res = await fetch(url, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to assign machine');
    },

    async completeMachine(id: number): Promise<void> {
        const res = await fetch(`${API_URL}/machines/${id}/complete`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to complete machine');
    },

    async setMaintenance(id: number): Promise<void> {
        const res = await fetch(`${API_URL}/machines/${id}/maintenance`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to set maintenance');
    },

    async recoverMachine(id: number): Promise<void> {
        const res = await fetch(`${API_URL}/machines/${id}/recover`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to recover machine');
    },

    async cancelAssignment(id: number): Promise<void> {
        const res = await fetch(`${API_URL}/machines/${id}/cancel`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to cancel assignment');
    },

    async createMachine(payload: any): Promise<void> {
        const res = await fetch(`${API_URL}/machines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create machine');
    },

    async updateMachine(id: number, payload: any): Promise<void> {
        const res = await fetch(`${API_URL}/machines/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update machine');
    },

    async deleteMachine(id: number): Promise<void> {
        const res = await fetch(`${API_URL}/machines/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete machine');
    }
};

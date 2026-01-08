import { useEffect } from 'react';
import { useMachineStore } from '../stores/useMachineStore';

export const useWebSocket = () => {
    const { updateMachine, fetchTurns } = useMachineStore();

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const ws = new WebSocket(`${protocol}//${host}:8000/ws`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "machine_update") {
                updateMachine(data.id, {
                    status: data.status,
                    current_cycle_end: data.end_time || null,
                    current_turn_id: data.turn_id || null
                });
                fetchTurns();
            }
        };

        return () => ws.close();
    }, [updateMachine, fetchTurns]);
};

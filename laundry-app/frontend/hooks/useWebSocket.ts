import { useEffect } from 'react';
import { useMachineStore } from '../stores/useMachineStore';

export const useWebSocket = () => {
    const { updateMachine, fetchTurns } = useMachineStore();

    useEffect(() => {
        // 1. Get from env or fallback to current host
        let wsUrl = process.env.NEXT_PUBLIC_WS_URL ||
            `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/ws`;

        // 2. Absolute Safety: Force WSS if the frontend is served via HTTPS
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
            wsUrl = wsUrl.replace(/^ws:\/\//i, 'wss://');
        }

        const ws = new WebSocket(wsUrl);

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

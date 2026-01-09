import { useEffect } from 'react';
import { useMachineStore } from '../stores/useMachineStore';

export const useWebSocket = () => {
    const { updateMachine, fetchTurns } = useMachineStore();

    useEffect(() => {
        let wsUrl = process.env.NEXT_PUBLIC_WS_URL ||
            `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/ws`;

        // Safety: Force WSS for Railway production domains
        if (wsUrl.includes('.up.railway.app') && wsUrl.startsWith('ws://')) {
            wsUrl = wsUrl.replace('ws://', 'wss://');
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

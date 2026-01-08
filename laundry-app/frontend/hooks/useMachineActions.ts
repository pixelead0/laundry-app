import { useMachineStore } from '../stores/useMachineStore';

export const useMachineActions = () => {
    const store = useMachineStore();

    return {
        assign: store.assignTurnToMachine,
        complete: store.completeMachine,
        reportFailure: store.reportFailure,
        recover: store.recoverMachine,
        cancel: store.cancelAssignment,
        addTurn: store.addTurn,
        createMachine: store.createMachine,
        updateMachine: store.updateMachineDetails,
        deleteMachine: store.deleteMachine,
        fetchMachines: store.fetchMachines,
        fetchTurns: store.fetchTurns
    };
};

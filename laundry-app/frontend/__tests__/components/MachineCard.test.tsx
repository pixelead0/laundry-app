import { MachineCard } from '@/components/features/machines/MachineCard'
import { Machine } from '@/types'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock useTimer hook
vi.mock('@/hooks/useTimer', () => ({
    useTimer: (date: string | null) => ({
        formattedTime: date ? '20m 00s' : '---',
        isOverdue: false
    })
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: any) => <div className={className}>{children}</div>
    }
}))

const mockMachine: Machine = {
    id: 1,
    name: 'W1',
    type: 'washer',
    status: 'free',
    capacity: '10kg',
    default_cycle_time: 45,
    machine_order: 1,
    current_cycle_end: null,
    current_turn_id: null
}

describe('MachineCard', () => {
    const onAssign = vi.fn()
    const onComplete = vi.fn()
    const onRecover = vi.fn()
    const onCancel = vi.fn()
    const onReportFailure = vi.fn()

    it('renders machine details correctly', () => {
        render(
            <MachineCard
                machine={mockMachine}
                onAssign={onAssign}
            />
        )
        expect(screen.getByText('W1')).toBeInTheDocument()
        expect(screen.getByText(/10kg/)).toBeInTheDocument()
        expect(screen.getAllByText('Disponible').length).toBeGreaterThan(0)
    })

    it('calls onAssign when assign button clicked', () => {
        render(
            <MachineCard
                machine={mockMachine}
                onAssign={onAssign}
            />
        )
        const button = screen.getByText('Asignar')
        fireEvent.click(button)
        expect(onAssign).toHaveBeenCalledWith(1)
    })

    it('shows occupied state and action buttons', () => {
        const occupiedMachine = { ...mockMachine, status: 'occupied' as const, current_cycle_end: '2025-01-01T10:00:00Z' }
        render(
            <MachineCard
                machine={occupiedMachine}
                onAssign={onAssign}
                onComplete={onComplete}
                onCancel={onCancel}
                onReportFailure={onReportFailure}
            />
        )
        expect(screen.getByText('En Uso')).toBeInTheDocument()
        expect(screen.getByText('20m 00s')).toBeInTheDocument() // From mock

        // Buttons
        // "En Curso" is the main button text for occupied but it triggers complete?
        // Wait, looking at code: <Button ... onClick={() => onComplete?.(machine.id)}>En Curso</Button>
        // Yes, clicking "En Curso" calls onComplete.

        fireEvent.click(screen.getByText('En Curso'))
        expect(onComplete).toHaveBeenCalledWith(1)

        // Cancel button (Undo icon)
        const undoButton = screen.getByTitle('Deshacer Asignación')
        fireEvent.click(undoButton)
        expect(onCancel).toHaveBeenCalledWith(1)

        // Report Failure button (Wrench icon)
        const failButton = screen.getByTitle('Reportar Falla')
        fireEvent.click(failButton)
        expect(onReportFailure).toHaveBeenCalledWith(1)
    })

    it('shows maintenance state and recover button', () => {
        const maintenanceMachine = { ...mockMachine, status: 'maintenance' as const }
        render(
            <MachineCard
                machine={maintenanceMachine}
                onAssign={onAssign}
                onRecover={onRecover}
            />
        )
        expect(screen.getByText('Mantenimiento')).toBeInTheDocument()

        const recoverButton = screen.getByText('Recuperar')
        fireEvent.click(recoverButton)
        expect(onRecover).toHaveBeenCalledWith(1)
    })

    it('hides buttons in readOnly mode', () => {
        render(
            <MachineCard
                machine={mockMachine}
                onAssign={onAssign}
                readOnly={true}
            />
        )
        expect(screen.queryByText('Asignar')).not.toBeInTheDocument()
    })
})

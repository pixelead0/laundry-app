"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMachineActions } from "@/hooks/useMachineActions"
import { useMachineStore } from "@/stores/useMachineStore"
import { useState } from "react"
import { toast } from "sonner"

interface AssignModalProps {
    isOpen: boolean
    onClose: () => void
    machineId: number | null
}

export function AssignModal({ isOpen, onClose, machineId }: AssignModalProps) {
    const { turns, machines } = useMachineStore()
    const { assign, fetchTurns } = useMachineActions()
    const [selectedTurnId, setSelectedTurnId] = useState<string>("none")
    const [loading, setLoading] = useState(false)

    const machine = machines.find(m => m.id === machineId)
    const waitingPeople = turns.filter(t => t.status === 'waiting' && (!machine || t.type === machine.type))

    const handleAssign = async () => {
        if (!machineId) return

        setLoading(true)
        try {
            const turnId = selectedTurnId !== "none" ? parseInt(selectedTurnId) : undefined
            await assign(machineId, turnId)
            toast.success("Máquina asignada exitosamente")

            // Re-fetch to sync
            fetchTurns()
            onClose()
        } catch (e) {
            toast.error("Error al asignar máquina")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Asignar Máquina {machine?.name || machineId}</DialogTitle>
                    <DialogDescription>
                        Selecciona un cliente de la lista de espera o asigna manualmente.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="turn" className="text-right">
                            Cliente
                        </Label>
                        < Select value={selectedTurnId} onValueChange={setSelectedTurnId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seleccionar de la lista..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">-- Anónimo / Presencial --</SelectItem>
                                {waitingPeople.map((turn) => (
                                    <SelectItem key={turn.id} value={turn.id.toString()}>
                                        {turn.customer_name} (Espera: ~{turn.estimated_wait}m)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleAssign} disabled={loading}>
                        {loading ? "Asignando..." : "Asignar Máquina"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

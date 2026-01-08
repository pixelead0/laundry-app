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
import { useMachineStore } from "@/stores/useMachineStore"
import { useState } from "react"
import { toast } from "sonner"

interface AssignModalProps {
    isOpen: boolean
    onClose: () => void
    machineId: number | null
}

export function AssignModal({ isOpen, onClose, machineId }: AssignModalProps) {
    const { turns, fetchTurns } = useMachineStore()
    const [selectedTurnId, setSelectedTurnId] = useState<string>("none")
    const [loading, setLoading] = useState(false)

    // Filter only waiting people
    const waitingPeople = turns.filter(t => t.status === 'waiting')

    const handleAssign = async () => {
        if (!machineId) return

        setLoading(true)
        try {
            const turnIdParam = selectedTurnId !== "none" ? `&turn_id=${selectedTurnId}` : ""
            await fetch(`http://localhost:8000/machines/${machineId}/assign?duration_minutes=45${turnIdParam}`, {
                method: 'POST'
            })
            toast.success("Máquina asignada exitosamente")

            // Refresh turns to update list
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
                    <DialogTitle>Asignar Máquina {machineId}</DialogTitle>
                    <DialogDescription>
                        Selecciona un cliente de la lista de espera o asigna manualmente.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="turn" className="text-right">
                            Cliente
                        </Label>
                        <Select value={selectedTurnId} onValueChange={setSelectedTurnId}>
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

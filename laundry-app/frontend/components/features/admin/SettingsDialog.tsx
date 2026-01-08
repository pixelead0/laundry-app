"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMachineActions } from "@/hooks/useMachineActions"
import { useMachineStore } from "@/stores/useMachineStore"
import { Machine, MachineType } from "@/types"
import { Pencil, Plus, Trash2, WashingMachine, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface SettingsDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
    const { machines } = useMachineStore()
    const { createMachine, updateMachine, deleteMachine } = useMachineActions()
    const [name, setName] = useState("")
    const [type, setType] = useState<MachineType>("washer")
    const [capacity, setCapacity] = useState("")
    const [duration, setDuration] = useState("45")
    const [order, setOrder] = useState("0")
    const [editingId, setEditingId] = useState<number | null>(null)

    const handleSubmit = async () => {
        if (!name || !capacity || !duration) {
            toast.error("Por favor completa todos los campos")
            return
        }

        try {
            if (editingId) {
                await updateMachine(editingId, {
                    name,
                    type,
                    capacity,
                    default_cycle_time: parseInt(duration),
                    machine_order: parseInt(order) || 0
                })
                toast.success("Máquina actualizada exitosamente")
            } else {
                await createMachine(name, type, capacity, parseInt(duration), parseInt(order) || 0)
                toast.success("Máquina creada exitosamente")
            }
            resetForm()
        } catch (error) {
            toast.error("Error al guardar")
        }
    }

    const resetForm = () => {
        setName("")
        setCapacity("")
        setDuration("45")
        setOrder("0")
        setEditingId(null)
        setType("washer")
    }

    const handleEdit = (machine: Machine) => {
        setName(machine.name)
        setCapacity(machine.capacity)
        setType(machine.type)
        setDuration(machine.default_cycle_time?.toString() || "45")
        setOrder(machine.machine_order?.toString() || "0")
        setEditingId(machine.id)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta máquina?")) return
        try {
            await deleteMachine(id)
            if (editingId === id) resetForm()
            toast.success("Máquina eliminada")
        } catch (error) {
            toast.error("Error al eliminar máquina")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="font-bold text-xl">{editingId ? "Editar Máquina" : "Configuración de Máquinas"}</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                        {editingId ? "Modifica los detalles de la máquina." : "Agrega o elimina máquinas del sistema."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className={`p-5 rounded-xl space-y-4 ${editingId ? 'bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800' : 'bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm tracking-tight">{editingId ? "Editar Máquina" : "Agregar Nueva Máquina"}</h3>
                            {editingId && (
                                <Button variant="ghost" size="sm" onClick={resetForm} className="h-6 px-3 text-slate-500 hover:text-slate-900">
                                    <X className="w-4 h-4 mr-1" /> Cancelar
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Nombre (ej. W1)</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Capacidad</Label>
                                <Input
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    placeholder="ej. 10kg"
                                    className="bg-white dark:bg-slate-800 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Duración (min)</Label>
                                <Input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Orden / Posición</Label>
                                <Input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(e.target.value)}
                                    placeholder="0"
                                    className="bg-white dark:bg-slate-800 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Tipo</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="washer">Lavadora</SelectItem>
                                        <SelectItem value="dryer">Secadora</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end col-span-2">
                                <Button onClick={handleSubmit} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10">
                                    {editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    {editingId ? "Guardar Cambios" : "Agregar Máquina"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-sm mb-3 tracking-tight">Máquinas Existentes</h3>
                        <ScrollArea className="h-[250px] rounded-xl border border-slate-100 dark:border-slate-800 p-2">
                            <div className="space-y-2">
                                {machines.map(machine => (
                                    <div key={machine.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${editingId === machine.id ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 border-transparent'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                                <WashingMachine className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">
                                                    <span className="text-slate-400 mr-2 tabular-nums">#{machine.machine_order || 0}</span>
                                                    {machine.name}
                                                </p>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5 tracking-tight">
                                                    {machine.type === 'washer' ? 'Lavadora' : 'Secadora'} • {machine.capacity} • {machine.default_cycle_time} min
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50"
                                                onClick={() => handleEdit(machine)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(machine.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

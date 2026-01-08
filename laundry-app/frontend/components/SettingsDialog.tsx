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
import { useMachineStore } from "@/stores/useMachineStore"
import { Pencil, Plus, Trash2, WashingMachine, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface SettingsDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
    const { machines, createMachine, deleteMachine, updateMachineDetails } = useMachineStore()
    const [name, setName] = useState("")
    const [type, setType] = useState<"washer" | "dryer">("washer")
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
                await updateMachineDetails(editingId, {
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

    const handleEdit = (machine: any) => {
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
                    <DialogTitle>{editingId ? "Editar Máquina" : "Configuración de Máquinas"}</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                        {editingId ? "Modifica los detalles de la máquina." : "Agrega o elimina máquinas del sistema."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Add/Edit Machine Form */}
                    <div className={`p-4 rounded-lg space-y-4 ${editingId ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-900'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm">{editingId ? "Editar Máquina" : "Agregar Nueva Máquina"}</h3>
                            {editingId && (
                                <Button variant="ghost" size="sm" onClick={resetForm} className="h-6 px-2 text-slate-500">
                                    <X className="w-4 h-4 mr-1" /> Cancelar
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre (ej. W1)</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white dark:bg-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Capacidad</Label>
                                <Input
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    placeholder="ej. 10kg"
                                    className="bg-white dark:bg-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duración (min)</Label>
                                <Input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="bg-white dark:bg-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Orden / Posición</Label>
                                <Input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(e.target.value)}
                                    placeholder="0"
                                    className="bg-white dark:bg-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="washer">Lavadora</SelectItem>
                                        <SelectItem value="dryer">Secadora</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end col-span-2">
                                <Button onClick={handleSubmit} className="w-full">
                                    {editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    {editingId ? "Guardar Cambios" : "Agregar"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Machine List */}
                    <div>
                        <h3 className="font-semibold text-sm mb-2">Máquinas Existentes</h3>
                        <ScrollArea className="h-[200px] rounded-md border p-2">
                            <div className="space-y-2">
                                {machines.map(machine => (
                                    <div key={machine.id} className={`flex items-center justify-between p-2 rounded-md transition-colors ${editingId === machine.id ? 'bg-amber-100 dark:bg-amber-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-200 dark:bg-slate-700/50 rounded-full">
                                                <WashingMachine className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    <span className="text-slate-400 mr-2 text-xs">#{machine.machine_order || 0}</span>
                                                    {machine.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {machine.type === 'washer' ? 'Lavadora' : 'Secadora'} • {machine.capacity} • {machine.default_cycle_time} min
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-500 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800"
                                                onClick={() => handleEdit(machine)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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

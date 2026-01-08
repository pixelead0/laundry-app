"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useMachineStore } from "@/stores/useMachineStore"
import { Clock, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function Waitlist({ readOnly = false }: { readOnly?: boolean }) {
    const { turns, addTurn, machines } = useMachineStore()
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [loading, setLoading] = useState(false)

    // Derived state
    const waitingList = turns.filter(t => t.status === 'waiting')
    const activeList = turns.filter(t => t.status === 'in_progress')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return

        setLoading(true)
        try {
            await addTurn(name, phone)
            setName("")
            setPhone("")
            toast.success("Agregado a la lista")
        } catch (error) {
            toast.error("Error al agregar a la lista")
        } finally {
            setLoading(false)
        }
    }

    // Helper to find which machine a turn is using
    const getMachineName = (turnId: number) => {
        const machine = machines.find(m => m.current_turn_id === turnId)
        return machine ? `${machine.name} (${machine.type})` : "Desconocido"
    }

    return (
        <div className="w-full lg:w-80 h-fit space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg">Lista de Espera</CardTitle>
                </CardHeader>
                <CardContent>
                    {!readOnly && (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre del Cliente</Label>
                                    <Input
                                        id="name"
                                        placeholder="Juan Pérez"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono (Opcional)</Label>
                                    <Input
                                        id="phone"
                                        placeholder="555-0123"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Unirse a la Lista
                                </Button>
                            </form>

                            <Separator className="my-4" />
                        </>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">En Espera ({waitingList.length})</h3>
                        <ScrollArea className="h-[200px]">
                            {waitingList.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">Nadie en espera</p>
                            ) : (
                                <div className="space-y-3">
                                    {waitingList.map((turn, i) => (
                                        <div key={turn.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">{i + 1}</span>
                                                    {turn.customer_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs text-slate-500 gap-1">
                                                <Clock className="w-3 h-3" />
                                                {turn.estimated_wait > 0 ? `~${turn.estimated_wait}m` : 'Listo'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg">Turnos Activos</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[200px]">
                        {activeList.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">Sin turnos activos</p>
                        ) : (
                            <div className="space-y-3">
                                {activeList.map((turn) => (
                                    <div key={turn.id} className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{turn.customer_name}</span>
                                            <span className="text-xs text-slate-500">Usando {getMachineName(turn.id)}</span>
                                        </div>
                                        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs text-blue-700 dark:text-blue-300 font-mono">
                                            #{turn.id}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}

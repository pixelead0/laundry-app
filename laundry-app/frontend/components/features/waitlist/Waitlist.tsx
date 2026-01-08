"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useMachineActions } from "@/hooks/useMachineActions"
import { useMachineStore } from "@/stores/useMachineStore"
import { MachineType, Turn } from "@/types"
import { motion } from "framer-motion"
import { Clock, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Waitlist({ readOnly = false }: { readOnly?: boolean }) {
    const { turns, machines } = useMachineStore()
    const { addTurn } = useMachineActions()
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [type, setType] = useState<MachineType>("washer")
    const [loading, setLoading] = useState(false)

    const waitingListWasher = turns.filter(t => t.status === 'waiting' && t.type === 'washer')
    const waitingListDryer = turns.filter(t => t.status === 'waiting' && t.type === 'dryer')
    const activeList = turns.filter(t => t.status === 'in_progress')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return

        setLoading(true)
        try {
            await addTurn(name, phone, type)
            setName("")
            setPhone("")
            toast.success("Agregado a la lista")
        } catch (error) {
            toast.error("Error al agregar a la lista")
        } finally {
            setLoading(false)
        }
    }

    const getMachineName = (turnId: number) => {
        const machine = machines.find(m => m.current_turn_id === turnId)
        return machine ? `${machine.name} (${machine.type === 'washer' ? 'Lavadora' : 'Secadora'})` : "Desconocido"
    }

    const renderList = (list: Turn[], emptyMsg: string) => (
        <ScrollArea className="h-[200px]">
            {list.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">{emptyMsg}</p>
            ) : (
                <div className="space-y-3">
                    {list.map((turn, i) => (
                        <motion.div
                            key={turn.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-white/10 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
                        >
                            <div className="flex flex-col">
                                <span className="font-black text-sm uppercase italic tracking-tighter flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] italic shadow-lg">{i + 1}</span>
                                    {turn.customer_name}
                                </span>
                            </div>
                            <div className="flex items-center text-[10px] font-black uppercase italic tracking-widest text-slate-400 gap-1.5 bg-slate-100/50 dark:bg-black/20 px-2 py-1 rounded-lg">
                                <Clock className="w-3 h-3 text-indigo-500" />
                                {turn.estimated_wait > 0 ? `~${turn.estimated_wait}m` : 'Listo'}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </ScrollArea>
    )

    return (
        <div className="w-full lg:w-80 h-fit space-y-6">
            <Card className="border-none glass premium-shadow rounded-3xl overflow-hidden">
                <CardHeader className="pb-3 bg-white/5 dark:bg-black/5">
                    <CardTitle className="text-xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">
                        Lista de Espera
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {!readOnly && (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400">Cliente</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ej. Juan Pérez"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-white/50 dark:bg-slate-950/50 border-white/20 h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Servicio</Label>
                                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                                        <SelectTrigger className="bg-white/50 dark:bg-slate-950/50 border-white/20 h-11 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="glass">
                                            <SelectItem value="washer">Lavadora</SelectItem>
                                            <SelectItem value="dryer">Secadora</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase italic tracking-widest h-11 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Unirse a la Lista
                                </Button>
                            </form>
                            <Separator className="my-8 opacity-20" />
                        </>
                    )}

                    {readOnly ? (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    Lavadoras ({waitingListWasher.length})
                                </h3>
                                {renderList(waitingListWasher, "Nadie esperando lavadora")}
                            </div>
                            <Separator className="opacity-10" />
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    Secadoras ({waitingListDryer.length})
                                </h3>
                                {renderList(waitingListDryer, "Nadie esperando secadora")}
                            </div>
                        </div>
                    ) : (
                        <Tabs defaultValue="washer" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl p-1 mb-6">
                                <TabsTrigger value="washer" className="rounded-lg font-black text-[10px] uppercase tracking-widest">Lavadoras</TabsTrigger>
                                <TabsTrigger value="dryer" className="rounded-lg font-black text-[10px] uppercase tracking-widest">Secadoras</TabsTrigger>
                            </TabsList>
                            <TabsContent value="washer" className="mt-0">
                                {renderList(waitingListWasher, "No hay espera")}
                            </TabsContent>
                            <TabsContent value="dryer" className="mt-0">
                                {renderList(waitingListDryer, "No hay espera")}
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>

            <Card className="border-none glass premium-shadow rounded-3xl overflow-hidden">
                <CardHeader className="bg-blue-500/5 dark:bg-blue-500/10 border-b border-white/10 pb-3">
                    <CardTitle className="text-xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">
                        Turnos Activos
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <ScrollArea className="h-[250px]">
                        {activeList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-2">
                                <Clock className="w-8 h-8 opacity-20" />
                                <p className="text-sm italic">Sin turnos activos</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeList.map((turn) => (
                                    <motion.div
                                        key={turn.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center justify-between p-4 bg-blue-500/5 dark:bg-blue-400/10 rounded-2xl border border-blue-500/10 hover:border-blue-400 transition-colors group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{turn.customer_name}</span>
                                            <span className="text-[10px] uppercase font-black text-blue-500/70 mt-1 tracking-tighter">
                                                En: {getMachineName(turn.id)}
                                            </span>
                                        </div>
                                        <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black tracking-tighter shadow-lg shadow-blue-500/30">
                                            #{turn.id}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}

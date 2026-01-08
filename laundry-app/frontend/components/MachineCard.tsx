"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Machine } from "@/stores/useMachineStore"
import { motion } from "framer-motion"
import { AlertTriangle, Undo2, WashingMachine, Wrench } from "lucide-react"
import { useEffect, useState } from "react"

interface MachineCardProps {
    machine: Machine
    onAssign: (id: number) => void
    onComplete?: (id: number) => void
    onReportFailure?: (id: number) => void
    onRecover?: (id: number) => void
    onCancel?: (id: number) => void
    readOnly?: boolean
}

export function MachineCard({ machine, onAssign, onComplete, onReportFailure, onRecover, onCancel, readOnly = false }: MachineCardProps) {
    const [timeLeft, setTimeLeft] = useState<string | null>(null)
    const [isOverdue, setIsOverdue] = useState(false)

    useEffect(() => {
        if (!machine.current_cycle_end) {
            setTimeLeft(null)
            setIsOverdue(false)
            return
        }

        const interval = setInterval(() => {
            let endTimeStr = machine.current_cycle_end!
            // If the string doesn't end with Z or an offset, assume UTC
            if (!endTimeStr.endsWith('Z') && !endTimeStr.includes('+') && !endTimeStr.includes('-')) {
                endTimeStr += 'Z'
            }
            const end = new Date(endTimeStr).getTime()
            const now = new Date().getTime()
            const diff = end - now

            const absDiff = Math.abs(diff)
            const minutes = Math.floor((absDiff / (1000 * 60))) // Total minutes (no modulus) for simplicity or keep H:M:S?
            // User likely wants minutes. If > 60m, showing 65m is better than 1h 5m usually for laundry?
            // Previous code used modulo for hours. Let's stick to M:S but handle hours if needed.
            // Previous: const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            // If it's negative, we want total minutes overdue probably.

            const minutesCalc = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60)) + Math.floor(absDiff / (1000 * 60 * 60)) * 60
            const secondsCalc = Math.floor((absDiff % (1000 * 60)) / 1000)

            const formattedTime = `${minutesCalc}m ${secondsCalc}s`

            if (diff <= 0) {
                setIsOverdue(true)
                setTimeLeft(`-${formattedTime}`)
            } else {
                setIsOverdue(false)
                setTimeLeft(formattedTime)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [machine.current_cycle_end])

    const statusColorMap = {
        free: "bg-green-500/10 text-green-500 border-green-500/20",
        occupied: "bg-red-500/10 text-red-500 border-red-500/20",
        finishing: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        maintenance: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }
    const statusColor = statusColorMap[machine.status as keyof typeof statusColorMap] || statusColorMap.maintenance

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full"
        >
            <Card className={cn(
                "h-full border shadow-sm hover:shadow-md transition-all",
                isOverdue ? "border-red-500/50 shadow-red-500/20 dark:shadow-red-900/20 animate-pulse" : "border-slate-200 dark:border-slate-800"
            )}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <WashingMachine className="w-4 h-4 text-slate-500" />
                        {machine.name}
                    </CardTitle>
                    <Badge variant="outline" className={cn("capitalize", statusColor)}>
                        {machine.status}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {machine.status === "free" ? (
                            <span className="text-slate-900 dark:text-white">Disponible</span>
                        ) : (
                            <span className={cn(
                                "tabular-nums font-mono",
                                isOverdue ? "text-red-600 dark:text-red-400 font-black" : "text-slate-900 dark:text-white"
                            )}>
                                {timeLeft || "Calculando..."}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {machine.capacity} • {machine.type}
                    </p>

                    {/* Show Active Turn ID if occupied */}
                    {machine.status === 'occupied' && machine.current_turn_id && (
                        <div className="mt-2 text-xs font-mono text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded inline-block">
                            Turno #{machine.current_turn_id}
                        </div>
                    )}

                    {!readOnly && (
                        <div className="mt-4">
                            {machine.status === "free" ? (
                                <Button
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                                    onClick={() => onAssign(machine.id)}
                                >
                                    Asignar
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    {machine.status === 'maintenance' ? (
                                        onRecover && (
                                            <Button
                                                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                                onClick={() => onRecover(machine.id)}
                                            >
                                                <Wrench className="w-4 h-4 mr-2" />
                                                Habilitar
                                            </Button>
                                        )
                                    ) : (
                                        <>
                                            <Button className="w-full" variant="secondary" disabled>
                                                En Curso
                                            </Button>
                                            {onComplete && (
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    title="Liberar máquina"
                                                    onClick={() => onComplete(machine.id)}
                                                >
                                                    <span className="sr-only">Liberar</span>
                                                    ✕
                                                </Button>
                                            )}
                                            {onCancel && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Cancelar Asignación (Deshacer)"
                                                    onClick={() => {
                                                        if (confirm("¿Cancelar asignación? Esto liberará la máquina y devolverá el turno a la cola.")) {
                                                            onCancel(machine.id)
                                                        }
                                                    }}
                                                >
                                                    <Undo2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {onReportFailure && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                    title="Reportar Avería"
                                                    onClick={() => {
                                                        if (confirm("¿Reportar avería? Esto cancelará el turno actual y lo devolverá a la cola.")) {
                                                            onReportFailure(machine.id)
                                                        }
                                                    }}
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

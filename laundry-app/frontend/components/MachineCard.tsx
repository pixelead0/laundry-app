"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Machine } from "@/stores/useMachineStore"
import { motion } from "framer-motion"
import { WashingMachine } from "lucide-react"
import { useEffect, useState } from "react"

interface MachineCardProps {
    machine: Machine
    onAssign: (id: number) => void
    readOnly?: boolean
}

export function MachineCard({ machine, onAssign, readOnly = false }: MachineCardProps) {
    const [timeLeft, setTimeLeft] = useState<string | null>(null)

    useEffect(() => {
        if (!machine.current_cycle_end) {
            setTimeLeft(null)
            return
        }

        const interval = setInterval(() => {
            const end = new Date(machine.current_cycle_end!).getTime()
            const now = new Date().getTime()
            const diff = end - now

            if (diff <= 0) {
                setTimeLeft("Finalizado")
            } else {
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                setTimeLeft(`${minutes}m ${seconds}s`)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [machine.current_cycle_end])

    const statusColor = {
        free: "bg-green-500/10 text-green-500 border-green-500/20",
        occupied: "bg-red-500/10 text-red-500 border-red-500/20",
        finishing: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        maintenance: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }[machine.status]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full"
        >
            <Card className="h-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
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
                            <span className="tabular-nums font-mono text-slate-900 dark:text-white">
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
                                <Button className="w-full" variant="secondary" disabled>
                                    En Curso
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

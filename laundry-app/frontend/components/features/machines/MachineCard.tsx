"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTimer } from "@/hooks/useTimer"
import { cn } from "@/lib/utils"
import { Machine } from "@/types"
import { motion } from "framer-motion"
import { AlertTriangle, Undo2, WashingMachine, Wrench } from "lucide-react"

interface MachineCardProps {
    machine: Machine
    onAssign: (id: number) => void
    onComplete?: (id: number) => void
    onReportFailure?: (id: number) => void
    onRecover?: (id: number) => void
    onCancel?: (id: number) => void
    readOnly?: boolean
}

export function MachineCard({
    machine,
    onAssign,
    onComplete,
    onReportFailure,
    onRecover,
    onCancel,
    readOnly = false
}: MachineCardProps) {
    const { formattedTime, isOverdue } = useTimer(machine.current_cycle_end);

    const statusColorMap = {
        free: "bg-green-500/10 text-green-500 border-green-500/20",
        occupied: "bg-red-500/10 text-red-500 border-red-500/20",
        finishing: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        maintenance: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }
    const statusColor = statusColorMap[machine.status] || statusColorMap.maintenance

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
                        {machine.status === 'free' ? 'Disponible' :
                            machine.status === 'occupied' ? 'En Uso' :
                                machine.status === 'maintenance' ? 'Mantenimiento' : machine.status}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {machine.status === "free" ? (
                            <span className="text-slate-900 dark:text-white font-semibold">Disponible</span>
                        ) : (
                            <span className={cn(
                                "tabular-nums font-mono font-bold",
                                isOverdue ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"
                            )}>
                                {formattedTime}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        {machine.capacity} • {machine.type === 'washer' ? 'Lavadora' : 'Secadora'}
                    </p>

                    {machine.current_turn_id && (
                        <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                            Turno #{machine.current_turn_id}
                        </div>
                    )}

                    {!readOnly && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {machine.status === "free" ? (
                                <Button
                                    size="sm"
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                                    onClick={() => onAssign(machine.id)}
                                >
                                    Asignar
                                </Button>
                            ) : machine.status === "maintenance" ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-slate-200 hover:bg-slate-50"
                                    onClick={() => onRecover?.(machine.id)}
                                >
                                    <AlertTriangle className="w-3 h-3 mr-1 text-yellow-500" />
                                    Recuperar
                                </Button>
                            ) : (
                                <div className="flex flex-col w-full gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full bg-slate-50 hover:bg-slate-100 border-slate-200"
                                        onClick={() => onComplete?.(machine.id)}
                                    >
                                        En Curso
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => onComplete?.(machine.id)}
                                            title="Finalizar"
                                        >
                                            <Undo2 className="h-4 w-4 rotate-180" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-600 hover:bg-slate-50"
                                            onClick={() => onCancel?.(machine.id)}
                                            title="Deshacer Asignación"
                                        >
                                            <Undo2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                                            onClick={() => onReportFailure?.(machine.id)}
                                            title="Reportar Falla"
                                        >
                                            <Wrench className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

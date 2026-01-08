"use client"

import { AssignModal } from "@/components/AssignModal"
import { MachineCard } from "@/components/MachineCard"
import { SettingsDialog } from "@/components/SettingsDialog"
import { Button } from "@/components/ui/button"
import { Waitlist } from "@/components/Waitlist"
import { useMachineStore } from "@/stores/useMachineStore"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Toaster, toast } from "sonner"

export default function AdminPage() {
    const { machines, fetchMachines, updateMachine, fetchTurns, reportFailure, recoverMachine, completeMachine, cancelAssignment } = useMachineStore()
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchMachines(), fetchTurns()])
            setIsLoaded(true)
        }
        init()

        // Dynamic WebSocket Host
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = window.location.hostname
        const ws = new WebSocket(`${protocol}//${host}:8000/ws`)

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === "machine_update") {
                updateMachine(data.id, {
                    status: data.status,
                    current_cycle_end: data.end_time || null,
                    current_turn_id: data.turn_id || null
                })
                fetchTurns()

                if (data.status === 'occupied') {
                    toast.info(`Máquina ${data.id} iniciada`)
                } else if (data.status === 'free') {
                    toast.success(`¡Máquina ${data.id} finalizada!`)
                }
            }
        }

        return () => ws.close()
    }, [])

    const openAssignModal = (id: number) => {
        setSelectedMachineId(id)
        setAssignModalOpen(true)
    }

    const washers = machines.filter(m => m.type === 'washer')
    const dryers = machines.filter(m => m.type === 'dryer')

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Panel de Administración</h1>
                        <p className="text-slate-500 dark:text-slate-400">Gestionar máquinas, turnos y asignaciones.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => setSettingsOpen(true)}>
                            Configuración
                        </Button>
                        <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                            MODO ADMIN
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Machine Grid */}
                    <div className="flex-1 space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Lavadoras</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {washers.map(machine => (
                                    <MachineCard
                                        key={machine.id}
                                        machine={machine}
                                        onAssign={openAssignModal}
                                        onReportFailure={reportFailure}
                                        onRecover={recoverMachine}
                                        onComplete={completeMachine}
                                        onCancel={cancelAssignment}
                                    />
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Secadoras</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {dryers.map(machine => (
                                    <MachineCard
                                        key={machine.id}
                                        machine={machine}
                                        onAssign={openAssignModal}
                                        onReportFailure={reportFailure}
                                        onRecover={recoverMachine}
                                        onComplete={completeMachine}
                                        onCancel={cancelAssignment}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside>
                        <Waitlist />
                    </aside>
                </div>
            </div>

            <AssignModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                machineId={selectedMachineId}
            />
            <SettingsDialog
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />
            <Toaster />
        </main>
    )
}

"use client"

import { SettingsDialog } from "@/components/features/admin/SettingsDialog"
import { AssignModal } from "@/components/features/machines/AssignModal"
import { MachineCard } from "@/components/features/machines/MachineCard"
import { Waitlist } from "@/components/features/waitlist/Waitlist"
import { Shell } from "@/components/layout/Shell"
import { Button } from "@/components/ui/button"
import { useMachineActions } from "@/hooks/useMachineActions"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useMachineStore } from "@/stores/useMachineStore"
import { Loader2, Settings2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Toaster } from "sonner"

export default function AdminPage() {
    const { machines } = useMachineStore()
    const {
        fetchMachines,
        fetchTurns,
        reportFailure,
        recover,
        complete,
        cancel
    } = useMachineActions()

    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    // Centralized real-time updates
    useWebSocket()

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchMachines(), fetchTurns()])
            setIsLoaded(true)
        }
        init()
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
        <Shell
            title="Administración"
            subtitle="Gestionar máquinas, turnos y asignaciones en tiempo real."
            actions={
                <>
                    <Button
                        variant="outline"
                        onClick={() => setSettingsOpen(true)}
                        className="bg-white dark:bg-slate-900 border-slate-200 shadow-sm font-bold"
                    >
                        <Settings2 className="w-4 h-4 mr-2" />
                        Configuración
                    </Button>
                    <div className="bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest italic border border-slate-800 shadow-lg">
                        MODO ADMIN
                    </div>
                </>
            }
        >
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-10">
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-black tracking-tight uppercase italic text-slate-800 dark:text-slate-200">Lavadoras</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {washers.map(machine => (
                                <MachineCard
                                    key={machine.id}
                                    machine={machine}
                                    onAssign={openAssignModal}
                                    onReportFailure={reportFailure}
                                    onRecover={recover}
                                    onComplete={complete}
                                    onCancel={cancel}
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-black tracking-tight uppercase italic text-slate-800 dark:text-slate-200">Secadoras</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {dryers.map(machine => (
                                <MachineCard
                                    key={machine.id}
                                    machine={machine}
                                    onAssign={openAssignModal}
                                    onReportFailure={reportFailure}
                                    onRecover={recover}
                                    onComplete={complete}
                                    onCancel={cancel}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="lg:sticky lg:top-8 h-fit">
                    <Waitlist />
                </aside>
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
            <Toaster position="bottom-right" />
        </Shell>
    )
}

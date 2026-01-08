"use client"

import { MachineCard } from "@/components/features/machines/MachineCard"
import { Waitlist } from "@/components/features/waitlist/Waitlist"
import { Shell } from "@/components/layout/Shell"
import { useMachineActions } from "@/hooks/useMachineActions"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useMachineStore } from "@/stores/useMachineStore"
import { useEffect, useState } from "react"
import { Toaster } from "sonner"

export default function Home() {
    const { machines } = useMachineStore()
    const { fetchMachines, fetchTurns } = useMachineActions()
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

    const washers = machines.filter(m => m.type === 'washer')
    const dryers = machines.filter(m => m.type === 'dryer')

    if (!isLoaded) return null

    return (
        <Shell
            title="Laundry Dashboard"
            subtitle="Vista en vivo de disponibilidad y cola de espera."
        >
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-10">
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <h2 className="text-xl font-black tracking-tight uppercase italic text-slate-800 dark:text-slate-200">Lavadoras</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {washers.map(machine => (
                                <MachineCard
                                    key={machine.id}
                                    machine={machine}
                                    onAssign={() => { }}
                                    readOnly={true}
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                            <h2 className="text-xl font-black tracking-tight uppercase italic text-slate-800 dark:text-slate-200">Secadoras</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {dryers.map(machine => (
                                <MachineCard
                                    key={machine.id}
                                    machine={machine}
                                    onAssign={() => { }}
                                    readOnly={true}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="lg:sticky lg:top-8 h-fit">
                    <Waitlist readOnly={true} />
                </aside>
            </div>
            <Toaster position="bottom-right" />
        </Shell>
    )
}

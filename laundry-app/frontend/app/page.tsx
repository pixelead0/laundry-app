"use client"

import { MachineCard } from "@/components/MachineCard"
import { Waitlist } from "@/components/Waitlist"
import { useMachineStore } from "@/stores/useMachineStore"
import { useEffect, useState } from "react"
import { Toaster } from "sonner"

export default function Home() {
    const { machines, fetchMachines, updateMachine, fetchTurns } = useMachineStore()
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
            }
        }

        return () => ws.close()
    }, [])

    const washers = machines.filter(m => m.type === 'washer')
    const dryers = machines.filter(m => m.type === 'dryer')

    if (!isLoaded) {
        return null // Or a loading spinner
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Panel Público</h1>
                    <p className="text-slate-500 dark:text-slate-400">Vista en vivo de disponibilidad y cola de espera.</p>
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
                                        onAssign={() => { }}
                                        readOnly={true}
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
                                        onAssign={() => { }}
                                        readOnly={true}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside>
                        <Waitlist readOnly={true} />
                    </aside>
                </div>
            </div>
            <Toaster />
        </main>
    )
}

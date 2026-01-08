"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface ShellProps {
    children: ReactNode
    title: string
    subtitle?: string
    actions?: ReactNode
}

export function Shell({ children, title, subtitle, actions }: ShellProps) {
    return (
        <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-[1400px] mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1"
                    >
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>

                    {actions && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            {actions}
                        </motion.div>
                    )}
                </header>

                <div className="w-full">
                    {children}
                </div>
            </div>
        </main>
    )
}

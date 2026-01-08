"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { Component, ErrorInfo, ReactNode } from "react"

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/20 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                                Algo salió mal
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                La aplicación ha encontrado un error inesperado. Por favor, intenta recargar la página.
                            </p>
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-11"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Recargar Aplicación
                        </Button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

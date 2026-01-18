
import { Button } from "@/components/ui/button"
import { Printer, Download, Pause, Play } from "lucide-react"

interface HeaderScoreboardProps {
    localScore: number
    visitorScore: number
    teamAName: string
    teamBName: string
    time: number
    isRunning: boolean
    setIsRunning: (val: boolean) => void
    onExport: () => void
    formatTime: (seconds: number) => string
}

export function HeaderScoreboard({
    localScore,
    visitorScore,
    teamAName,
    teamBName,
    time,
    isRunning,
    setIsRunning,
    onExport,
    formatTime,
}: HeaderScoreboardProps) {
    return (
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2 flex items-center justify-between shadow-md shrink-0 z-30 relative h-20 box-border">
            {/* Equipo Local (A) - Izquierda */}
            <div className="flex flex-col items-start min-w-[120px] sm:min-w-[150px]">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-blue-400 font-bold tracking-wider">LOCAL (A)</span>
                </div>
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-white leading-none tabular-nums">{localScore}</span>
                    <span className="text-sm text-slate-400 truncate max-w-[160px]">{teamAName}</span>
                </div>
            </div>

            {/* Cronómetro Central */}
            <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 top-1">
                <div className="bg-black/40 px-6 py-1 rounded-b-xl border-b border-x border-slate-800 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <span className="font-mono text-4xl font-bold text-green-400 tracking-widest tabular-nums">
                        {formatTime(time)}
                    </span>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsRunning(!isRunning)}
                    className={`mt-1 h-6 text-xs uppercase tracking-widest font-bold ${isRunning ? "text-red-400 hover:bg-red-950/30" : "text-green-400 hover:bg-green-950/30"}`}
                >
                    {isRunning ? (
                        <span className="flex items-center gap-1">
                            <Pause className="w-3 h-3" /> Pausar
                        </span>
                    ) : (
                        <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" /> Iniciar
                        </span>
                    )}
                </Button>
            </div>

            {/* Equipo Visitante (B) - Derecha */}
            <div className="flex flex-col items-end min-w-[120px] sm:min-w-[150px]">
                <div className="flex items-center gap-2 mb-1 flex-row-reverse">
                    <span className="text-xs text-amber-400 font-bold tracking-wider">VISITANTE (B)</span>
                    <div className="flex gap-2 no-print ml-4">
                        <Button
                            onClick={() => window.print()}
                            className="h-8 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase px-3"
                        >
                            <Printer className="w-3 h-3 mr-1.5" />
                            INFORME PDF
                        </Button>
                        <Button
                            onClick={onExport}
                            className="h-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase px-3 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        >
                            <Download className="w-3 h-3 mr-1.5" />
                            CSV
                        </Button>
                    </div>
                </div>
                <div className="flex items-baseline gap-3 flex-row-reverse">
                    <span className="text-3xl font-bold text-white leading-none tabular-nums">{visitorScore}</span>
                    <span className="text-sm text-slate-400 truncate max-w-[160px]">{teamBName}</span>
                </div>
            </div>
        </div>
    )
}

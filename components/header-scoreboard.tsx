import { Button } from "@/components/ui/button"
import { Printer, Download, Pause, Play, Moon, Sun } from "lucide-react"

interface HeaderScoreboardProps {
    readonly localScore: number
    readonly visitorScore: number
    readonly teamAName: string
    readonly teamBName: string
    readonly time: number
    readonly isRunning: boolean
    readonly isNightMode: boolean
    readonly onToggleTheme: () => void
    readonly setIsRunning: (val: boolean) => void
    readonly onExport: () => void
    readonly onReset: () => void
    readonly formatTime: (seconds: number) => string
}

export function HeaderScoreboard({
    localScore,
    visitorScore,
    teamAName,
    teamBName,
    time,
    isRunning,
    isNightMode,
    onToggleTheme,
    setIsRunning,
    onExport,
    onReset,
    formatTime,
}: HeaderScoreboardProps) {
    return (
        <div className={`backdrop-blur-xl border-b px-3 sm:px-5 lg:px-6 py-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)] shrink-0 z-30 relative box-border h-auto sm:min-h-[92px] ${isNightMode ? 'bg-[#000000]/80 border-slate-900' : 'bg-slate-900/50 border-white/10'}`}>
            {/* Equipo Local (A) - Izquierda */}
            <div className="flex flex-col items-start min-w-0 sm:min-w-[140px] w-full sm:w-auto sm:h-full sm:justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">LOCAL (A)</span>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-2 sm:gap-3 min-w-0 w-full">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-white leading-[0.9] tabular-nums drop-shadow-md min-w-[1.4ch] text-center">
                        {localScore}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-300 truncate max-w-[120px] sm:max-w-[160px] pb-0.5">{teamAName}</span>
                </div>
            </div>

            {/* Cronómetro Central */}
            <div className="flex flex-col items-center justify-center pointer-events-auto h-full px-1 sm:px-3 w-auto justify-self-center">
                <div className={`backdrop-blur-md px-4 sm:px-6 py-1.5 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center h-full max-h-[56px] sm:max-h-[60px] ${isNightMode ? 'bg-black border-slate-900' : 'bg-slate-950/80 border-white/10'}`}>
                    <span className="font-mono text-2xl sm:text-4xl font-black text-white tracking-widest tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] block leading-none">
                        {formatTime(time)}
                    </span>
                    <div className="flex justify-center mt-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsRunning(!isRunning)}
                            className={`h-5 sm:h-6 px-2 sm:px-3 text-[8px] sm:text-[9px] rounded-full uppercase tracking-widest font-black transition-all shadow-sm ${isRunning ? "text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-500/20" : "text-green-400 bg-green-400/10 hover:bg-green-400/20 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]"}`}
                        >
                            {isRunning ? (
                                <span className="flex items-center gap-1.5">
                                    <Pause className="w-2.5 h-2.5 fill-current" /> Pausar
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                                    <Play className="w-2.5 h-2.5 fill-current" /> Iniciar
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 no-print mt-2 w-full">
                    <Button
                        onClick={onToggleTheme}
                        className={`h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg backdrop-blur-md shadow-sm border ${isNightMode ? 'bg-indigo-600/20 text-indigo-400 border-indigo-900/50 hover:bg-indigo-600/40' : 'bg-slate-700/50 text-amber-300 border-slate-600 hover:bg-slate-700'}`}
                        title="Alternar Modo Noche"
                    >
                        {isNightMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </Button>
                    <Button
                        onClick={() => globalThis.print()}
                        className="h-7 sm:h-8 bg-blue-600/80 hover:bg-blue-500 text-white font-bold text-[9px] sm:text-[10px] uppercase px-2 sm:px-3 backdrop-blur-md rounded-lg shadow-sm"
                    >
                        <Printer className="w-3 h-3 mr-1 sm:mr-1.5" />
                        <span className="hidden md:inline">INFORME PDF</span>
                        <span className="md:hidden">PDF</span>
                    </Button>
                    <Button
                        onClick={onExport}
                        className="h-7 sm:h-8 bg-emerald-500/80 hover:bg-emerald-400 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase px-2 sm:px-3 shadow-[0_0_15px_rgba(16,185,129,0.3)] backdrop-blur-md rounded-lg break-keep"
                    >
                        <Download className="w-3 h-3 mr-1 sm:mr-1.5" />
                        CSV
                    </Button>
                    <Button
                        onClick={() => {
                            if (globalThis.confirm("¿Estás seguro de que quieres finalizar este partido y borrar los datos locales?")) {
                                onReset()
                            }
                        }}
                        className="h-7 sm:h-8 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-bold text-[9px] sm:text-[10px] uppercase px-2 sm:px-3 border border-red-500/30 backdrop-blur-md rounded-lg transition-all"
                    >
                        REINICIAR
                    </Button>
                </div>
            </div>

            {/* Equipo Visitante (B) - Derecha */}
            <div className="flex flex-col items-end min-w-0 sm:min-w-[140px] w-full sm:w-auto sm:h-full sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 flex-row-reverse justify-between sm:justify-end w-full">
                    <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">VISITANTE (B)</span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:gap-3 min-w-0 w-full">
                    <span className="text-xs sm:text-sm font-bold text-slate-300 truncate max-w-[120px] sm:max-w-[160px] pb-0.5 text-right justify-self-end">{teamBName}</span>
                    <span className="text-3xl sm:text-4xl font-black font-mono text-white leading-[0.9] tabular-nums drop-shadow-md min-w-[1.4ch] text-center">
                        {visitorScore}
                    </span>
                </div>
            </div>
        </div>
    )
}

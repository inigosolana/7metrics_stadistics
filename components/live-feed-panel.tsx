import { useState } from "react"
import { Button } from "@/components/ui/button"
import { History, Undo2, Trash2, Pencil } from "lucide-react"
import { Event, ActionType } from "@/lib/types/api-types"

const ACTION_CONFIG: Record<ActionType, { color: string; bg: string; label: string }> = {
    "GOL":                  { color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Gol" },
    "GOL 7M":               { color: "text-lime-400",    bg: "bg-lime-500/20",    label: "Gol 7m" },
    "GOL CAMPO A CAMPO":    { color: "text-yellow-400",  bg: "bg-yellow-500/20",  label: "C. a C." },
    "FALLO 7M":             { color: "text-rose-400",    bg: "bg-rose-500/20",    label: "Fallo 7m" },
    "PARADA":               { color: "text-sky-400",     bg: "bg-sky-500/20",     label: "Parada" },
    "FUERA":                { color: "text-slate-400",   bg: "bg-slate-500/20",   label: "Fuera" },
    "POSTE":                { color: "text-orange-400",  bg: "bg-orange-500/20",  label: "Poste" },
    "BLOCADO":              { color: "text-purple-400",  bg: "bg-purple-500/20",  label: "Blocado" },
    "PÉRDIDA":              { color: "text-red-400",     bg: "bg-red-500/20",     label: "Pérdida" },
    "RECUPERACIÓN":         { color: "text-cyan-400",    bg: "bg-cyan-500/20",    label: "Recup." },
    "ASISTENCIA":           { color: "text-violet-400",  bg: "bg-violet-500/20",  label: "Asist." },
}

interface LiveFeedPanelProps {
    readonly events: Event[]
    readonly onUndo: () => void
    readonly onExport: () => void
    readonly isUndoing?: boolean
    readonly isNightMode?: boolean
    readonly onDeleteEvent?: (eventId: string) => void
    readonly onEditEvent?: (event: Event) => void
    readonly isDeletingEvent?: boolean
}

export function LiveFeedPanel({
    events,
    onUndo,
    onExport,
    isUndoing,
    isNightMode = false,
    onDeleteEvent,
    onEditEvent,
    isDeletingEvent,
}: LiveFeedPanelProps) {
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const glassBg = isNightMode
        ? "bg-slate-950/90 border-white/10"
        : "bg-white/80 border-slate-200"

    return (
        <div className={`flex flex-col h-full border rounded-2xl overflow-hidden shadow-2xl relative transition-all duration-500 ${glassBg}`}>
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full pointer-events-none ${isNightMode ? "bg-blue-900/10" : "bg-blue-500/10"}`}></div>

            {/* Cabecera */}
            <div className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-3 border-b flex justify-between items-center gap-2 shrink-0 ${isNightMode ? "bg-black/40 border-white/10" : "bg-slate-50/50 border-slate-200"}`}>
                <span className={`text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1 sm:gap-1.5 tracking-[0.15em] sm:tracking-[0.2em] shrink-0 ${isNightMode ? "text-slate-400" : "text-slate-500"}`}>
                    <History className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Registro en vivo
                </span>
                <div className="flex gap-1 sm:gap-2 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onUndo}
                        disabled={isUndoing || events.length === 0}
                        className={`h-7 sm:h-8 px-2 sm:px-3 transition-colors font-black text-[9px] sm:text-[10px] uppercase rounded-lg border shrink-0 ${isNightMode
                            ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10 border-white/5"
                            : "text-slate-500 hover:text-red-600 hover:bg-red-50 border-slate-100"}`}
                    >
                        <Undo2 className="w-3.5 h-3.5 shrink-0" />
                    </Button>
                </div>
            </div>

            {/* Lista de Eventos */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar p-0 ${isNightMode ? "bg-transparent" : "bg-slate-50/20"}`}>
                {events.length === 0 ? (
                    <div className={`min-h-full w-full flex flex-col items-center justify-center text-center text-[10px] font-bold uppercase tracking-widest gap-2 ${isNightMode ? "text-slate-700" : "text-slate-400"}`}>
                        Sin eventos registrados
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {events.map((e, i) => {
                            const isFirst = i === 0
                            const isConfirmingDelete = confirmDeleteId === e.id

                            return (
                                <div
                                    key={e.id || i}
                                    className={`flex flex-col px-2 sm:px-3 py-2 border-b transition-colors w-full ${isNightMode ? "border-white/5" : "border-slate-100"} ${isFirst ? (isNightMode ? "bg-blue-500/10" : "bg-blue-50/60") : ""}`}
                                >
                                    {isConfirmingDelete ? (
                                        <div className="flex items-center justify-between gap-2 w-full">
                                            <span className={`text-[9px] font-black uppercase ${isNightMode ? "text-red-400" : "text-red-600"}`}>
                                                ¿Eliminar?
                                            </span>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className={`h-6 px-2 text-[9px] font-black uppercase rounded-lg ${isNightMode ? "text-slate-400 hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"}`}
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isDeletingEvent}
                                                    onClick={() => {
                                                        if (e.id) {
                                                            onDeleteEvent?.(e.id)
                                                            setConfirmDeleteId(null)
                                                        }
                                                    }}
                                                    className="h-6 px-2 text-[9px] font-black uppercase rounded-lg bg-red-500 text-white hover:bg-red-600"
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Fila principal: tiempo + pastilla + número + zona */}
                                            <div className="flex items-center justify-between gap-2 w-full min-w-0">
                                                <span className={`font-black text-[9px] tabular-nums shrink-0 ${isNightMode ? "text-slate-500" : "text-slate-400"}`}>
                                                    {e.time_formatted}
                                                </span>
                                                <div className={`px-1.5 py-0.5 rounded-md shrink-0 ${ACTION_CONFIG[e.action].bg}`}>
                                                    <span className={`font-black text-[9px] uppercase leading-none ${ACTION_CONFIG[e.action].color}`}>
                                                        {ACTION_CONFIG[e.action].label}
                                                    </span>
                                                </div>
                                                <span className={`font-black text-[11px] shrink-0 ${e.team === "A" ? "text-blue-500" : "text-amber-500"}`}>
                                                    #{e.player}
                                                </span>
                                                {e.court_zone && (
                                                    <span className={`text-[8px] font-bold uppercase truncate min-w-0 ${isNightMode ? "text-slate-600" : "text-slate-400"}`}>
                                                        {e.court_zone}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Fila secundaria: subtipo + botones */}
                                            {(e.turnover_type || e.recovery_type || (e.id && (onEditEvent || onDeleteEvent))) && (
                                                <div className="flex items-center justify-center w-full mt-1 gap-1">
                                                    <span className={`text-[8px] font-bold uppercase ${e.turnover_type ? "text-red-400" : e.recovery_type ? "text-cyan-400" : ""}`}>
                                                        {e.turnover_type ?? e.recovery_type ?? ""}
                                                    </span>
                                                    {e.id && (onEditEvent || onDeleteEvent) && (
                                                        <div className="flex items-center gap-1">
                                                            {onEditEvent && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => onEditEvent(e)}
                                                                    className={`w-6 h-6 rounded-md transition-colors ${isNightMode
                                                                        ? "text-slate-600 hover:text-blue-400 hover:bg-blue-500/10"
                                                                        : "text-slate-300 hover:text-blue-500 hover:bg-blue-50"}`}
                                                                    title="Editar evento"
                                                                >
                                                                    <Pencil className="w-3 h-3" />
                                                                </Button>
                                                            )}
                                                            {onDeleteEvent && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setConfirmDeleteId(e.id!)}
                                                                    className={`w-6 h-6 rounded-md transition-colors ${isNightMode
                                                                        ? "text-slate-600 hover:text-red-400 hover:bg-red-500/10"
                                                                        : "text-slate-300 hover:text-red-500 hover:bg-red-50"}`}
                                                                    title="Eliminar evento"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

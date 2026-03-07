import { useState } from "react"
import { Button } from "@/components/ui/button"
import { History, Undo2, Trash2, Pencil } from "lucide-react"
import { Event } from "@/lib/types/api-types"

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
            <div className={`px-4 py-3 border-b flex justify-between items-center shrink-0 ${isNightMode ? "bg-black/40 border-white/10" : "bg-slate-50/50 border-slate-200"}`}>
                <span className={`text-[10px] font-black uppercase flex items-center gap-1.5 tracking-[0.2em] ${isNightMode ? "text-slate-400" : "text-slate-500"}`}>
                    <History className="w-3.5 h-3.5" /> Live Feed
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onUndo}
                        disabled={isUndoing || events.length === 0}
                        className={`h-8 px-3 transition-colors font-black text-[10px] uppercase rounded-lg border ${isNightMode
                            ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10 border-white/5"
                            : "text-slate-500 hover:text-red-600 hover:bg-red-50 border-slate-100"}`}
                    >
                        <Undo2 className="w-3.5 h-3.5 mr-1" /> Deshacer
                    </Button>
                </div>
            </div>

            {/* Lista de Eventos */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar p-0 ${isNightMode ? "bg-transparent" : "bg-slate-50/20"}`}>
                {events.length === 0 ? (
                    <div className={`h-full flex flex-col items-center justify-center text-[10px] font-bold uppercase tracking-widest gap-2 ${isNightMode ? "text-slate-700" : "text-slate-400"}`}>
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
                                    className={`flex items-center gap-3 px-3 py-3 border-b transition-colors ${isNightMode ? "border-white/5" : "border-slate-100"} ${isFirst ? (isNightMode ? "bg-blue-500/10" : "bg-blue-50") : ""}`}
                                >
                                    {isConfirmingDelete ? (
                                        <div className="flex-1 flex items-center justify-between gap-2">
                                            <span className={`text-[10px] font-black uppercase ${isNightMode ? "text-red-400" : "text-red-600"}`}>
                                                ¿Eliminar este evento?
                                            </span>
                                            <div className="flex gap-1.5 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className={`h-7 px-2 text-[9px] font-black uppercase rounded-lg ${isNightMode ? "text-slate-400 hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"}`}
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
                                                    className="h-7 px-2 text-[9px] font-black uppercase rounded-lg bg-red-500 text-white hover:bg-red-600"
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span className={`font-black text-[9px] w-8 shrink-0 ${isNightMode ? "text-slate-600" : "text-slate-400"}`}>
                                                {e.time_formatted}
                                            </span>
                                            <div className={`w-1 h-8 rounded-full shrink-0 ${e.team === "A" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-black text-xs uppercase ${isNightMode ? "text-slate-200" : "text-slate-800"}`}>
                                                        {e.action}
                                                    </span>
                                                    <span className={`font-black text-[10px] ${e.team === "A" ? "text-blue-500" : "text-amber-500"}`}>
                                                        #{e.player}
                                                    </span>
                                                </div>
                                                {e.context && e.context.length > 0 && (
                                                    <div className="text-[9px] font-bold text-slate-500 mt-0.5 uppercase tracking-tighter">
                                                        {e.context.join(" • ")}
                                                    </div>
                                                )}
                                                {e.turnover_type && (
                                                    <div className="text-[9px] font-bold text-red-500/80 mt-0.5 uppercase">
                                                        Pérdida: {e.turnover_type}
                                                    </div>
                                                )}
                                                {e.recovery_type && (
                                                    <div className="text-[9px] font-bold text-cyan-500/80 mt-0.5 uppercase">
                                                        Recup: {e.recovery_type}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Botones de acción por evento */}
                                            {e.id && (onEditEvent || onDeleteEvent) && (
                                                <div className="flex items-center gap-0.5 shrink-0">
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

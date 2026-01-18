
import { Button } from "@/components/ui/button"
import { History, Undo2, Download } from "lucide-react"
import { Event } from "@/lib/types/api-types"

interface LiveFeedPanelProps {
    events: Event[]
    onUndo: () => void
    onExport: () => void
    isUndoing?: boolean
}

export function LiveFeedPanel({ events, onUndo, onExport, isUndoing }: LiveFeedPanelProps) {
    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            {/* Cabecera con Botones Visibles */}
            <div className="bg-slate-950/80 px-3 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <History className="w-3 h-3" /> Live Feed
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onUndo}
                        disabled={isUndoing || events.length === 0}
                        className="h-8 px-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 flex items-center gap-1.5 font-bold text-[10px] uppercase disabled:opacity-50"
                    >
                        <Undo2 className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Deshacer</span>
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onExport}
                        className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 font-black text-xs uppercase shadow-[0_0_15px_rgba(16,185,129,0.3)] border-b-2 border-emerald-700 transition-all active:translate-y-0.5"
                    >
                        <Download className="w-4 h-4" /> <span>EXPORTAR CSV</span>
                    </Button>
                </div>
            </div>

            {/* Lista de Eventos */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                {events.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[10px] text-slate-600 italic">
                        Sin eventos registrados
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {events.map((e, i) => (
                            <div
                                key={e.id || i}
                                className={`flex items-center gap-2 px-3 py-2 border-b border-slate-800/50 text-xs ${i === 0 ? "bg-slate-800/30" : ""}`}
                            >
                                <span className="font-mono text-slate-500 text-[10px] w-8">{e.time_formatted}</span>
                                <div className={`w-1 h-8 rounded-full ${e.team === "A" ? "bg-blue-500" : "bg-amber-500"}`}></div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-200">
                                        {e.action} <span className="font-normal text-slate-400">#{e.player}</span>
                                    </div>
                                    {e.context && e.context.length > 0 && (
                                        <div className="text-[9px] text-slate-500 mt-0.5">{e.context.join(", ")}</div>
                                    )}
                                    {/* Nota: turnoverType y recoveryType no están explícitamente en el Event type generado del swagger actualmente (están como strings genéricos o habría que revisar el swagger en detalle, pero asumiré que vienen) 
                      Revisando types: api-types.ts tiene Event con defense_at_moment, context, pero NO tiene turnover_type ni recovery_type. 
                      El swagger original NO los tenía en la definición de Event, pero sí tenía los Enums. 
                      Voy a añadirlos manualmente a api-types luego si hace falta, pero por ahora usaré casting o los mostraré si existen */}
                                    {(e as any).turnover_type && (
                                        <div className="text-[9px] text-red-400 mt-0.5">Tipo Pérdida: {(e as any).turnover_type}</div>
                                    )}
                                    {(e as any).recovery_type && (
                                        <div className="text-[9px] text-cyan-400 mt-0.5">Tipo Recuperación: {(e as any).recovery_type}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

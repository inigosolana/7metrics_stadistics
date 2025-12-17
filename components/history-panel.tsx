"use client"

import { Button } from "@/components/ui/button"
import { Download, Undo2 } from "lucide-react"

type Event = {
  id: string
  timestamp: number
  player: number
  team: "A" | "B"
  action: string
  specificAction?: string
  courtZone?: string
  goalZone?: number
  defenseType?: string
  context?: string[]
}

type HistoryPanelProps = {
  events: Event[]
  teamAName: string
  teamBName: string
  onUndo: () => void
  onExport: () => void
  formatTime: (seconds: number) => string
}

export function HistoryPanel({ events, teamAName, teamBName, onUndo, onExport, formatTime }: HistoryPanelProps) {
  const getActionColor = (action: string) => {
    if (action === "GOL" || action === "GOL CAMPO A CAMPO") return "text-green-400"
    if (action === "PARADA") return "text-blue-400"
    if (action === "PÉRDIDA" || action === "GOL ENCAJADO") return "text-red-400"
    if (action === "FUERA" || action === "POSTE") return "text-yellow-400"
    return "text-slate-300"
  }

  return (
    <div className="h-full flex flex-col bg-slate-900/50 min-h-0">
      {/* Header con botones de acción */}
      <div className="flex gap-2 p-2 border-b border-slate-800 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={onUndo}
          disabled={events.length === 0}
          className="flex-1 bg-slate-900 border-slate-700 hover:bg-slate-800 disabled:opacity-30"
        >
          <Undo2 className="w-3 h-3 mr-1" />
          Deshacer
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onExport}
          disabled={events.length === 0}
          className="flex-1 bg-slate-900 border-slate-700 hover:bg-slate-800 disabled:opacity-30"
        >
          <Download className="w-3 h-3 mr-1" />
          Exportar
        </Button>
      </div>

      {/* Lista de eventos */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5 min-h-0">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm text-center p-4">
            No hay eventos registrados todavía
          </div>
        ) : (
          <>
            {[...events].reverse().map((event) => (
              <div
                key={event.id}
                className={`bg-slate-900 border rounded-lg p-2 text-xs ${
                  event.team === "A" ? "border-blue-900/30" : "border-amber-900/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                      {formatTime(event.timestamp)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        event.team === "A" ? "bg-blue-900/30 text-blue-400" : "bg-amber-900/30 text-amber-400"
                      }`}
                    >
                      {event.team === "A" ? teamAName : teamBName}
                    </span>
                  </div>
                  <span className="text-slate-400 font-bold">#{event.player}</span>
                </div>

                <div className={`font-bold ${getActionColor(event.action)} mb-1`}>{event.action}</div>

                {/* Detalles adicionales */}
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {event.specificAction && (
                    <span className="bg-red-950/30 text-red-400 px-1.5 py-0.5 rounded border border-red-900/50">
                      {event.specificAction}
                    </span>
                  )}
                  {event.defenseType && (
                    <span className="bg-indigo-950/30 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900/50">
                      {event.defenseType}
                    </span>
                  )}
                  {event.courtZone && (
                    <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                      {event.courtZone}
                    </span>
                  )}
                  {event.goalZone && (
                    <span className="bg-green-950/30 text-green-400 px-1.5 py-0.5 rounded border border-green-900/50">
                      Z{event.goalZone}
                    </span>
                  )}
                  {event.context && event.context.length > 0 && (
                    <span className="bg-orange-950/30 text-orange-400 px-1.5 py-0.5 rounded border border-orange-900/50">
                      {event.context.join(", ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer con contador */}
      {events.length > 0 && (
        <div className="border-t border-slate-800 p-2 text-center text-[10px] text-slate-500 shrink-0">
          Total eventos: <span className="text-white font-bold">{events.length}</span>
        </div>
      )}
    </div>
  )
}

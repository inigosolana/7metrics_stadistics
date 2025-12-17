"use client"

import { Button } from "./ui/button"

interface ActionsPanelProps {
  selectedPlayer: number | null
  isGoalkeeper: boolean
  onActionSelect: (action: string) => void
}

export const ActionsPanel = ({
  selectedPlayer,
  isGoalkeeper,
  onActionSelect,
}: ActionsPanelProps) => {
  const playerActions = [
    { label: "LANZAMIENTO", color: "bg-green-500 hover:bg-green-600 text-white" },
    { label: "PARADA", color: "bg-blue-500 hover:bg-blue-600 text-white" },
    { label: "FALTA ATAQUE", color: "bg-red-500 hover:bg-red-600 text-white" },
    { label: "PÉRDIDA", color: "bg-orange-500 hover:bg-orange-600 text-white" },
    { label: "ASISTENCIA", color: "bg-purple-500 hover:bg-purple-600 text-white" },
    { label: "FUERA", color: "bg-yellow-500 hover:bg-yellow-600 text-black" },
  ]

  const goalkeeperActions = [
    { label: "PARADA", color: "bg-blue-500 hover:bg-blue-600 text-white" },
    { label: "GOL ENCAJADO", color: "bg-red-500 hover:bg-red-600 text-white" },
    { label: "SAQUE", color: "bg-green-500 hover:bg-green-600 text-white" },
  ]

  const actions = isGoalkeeper ? goalkeeperActions : playerActions

  if (!selectedPlayer) {
    return (
      <div className="bg-slate-900/50 rounded-xl p-6 text-center text-slate-400 w-[280px] pointer-events-auto">
        <p>Selecciona un jugador para ver acciones</p>
      </div>
    )
  }

  return (
    <div className="self-start bg-slate-900 rounded-xl p-4 shadow-lg w-[280px] pointer-events-auto">
      <div className="text-center mb-4">
        <div className="text-sm text-slate-400">Jugador</div>
        <div className="text-3xl font-bold text-white">#{selectedPlayer}</div>
        {isGoalkeeper && (
          <div className="text-xs text-slate-400 mt-1">Portero</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            onClick={() => onActionSelect(action.label)}
            className={`${action.color} font-bold py-3 rounded-lg transition-transform hover:scale-105 active:scale-95`}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

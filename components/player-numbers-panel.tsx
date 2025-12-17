"use client"

import { Button } from "./ui/button"

interface PlayerNumbersPanelProps {
  players: Array<{ number: number; name: string; isGoalkeeper: boolean }>
  selectedPlayer: number | null
  onPlayerSelect: (number: number) => void
  teamLabel: string
  teamColor: string
}

export const PlayerNumbersPanel = ({
  players,
  selectedPlayer,
  onPlayerSelect,
  teamLabel,
  teamColor,
}: PlayerNumbersPanelProps) => {
  return (
    <div className={`bg-gradient-to-b ${teamColor} rounded-xl p-4 shadow-lg`}>
      <div className="text-center mb-4">
        <div className="text-sm font-bold text-white/80 mb-1">{teamLabel}</div>
        <div className="text-xs text-white/60 font-mono">Haz click en un número</div>
      </div>
      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {players.map((player) => (
          <Button
            key={player.number}
            onClick={() => onPlayerSelect(player.number)}
            className={`h-16 text-2xl font-bold rounded-lg transition-all transform hover:scale-105 ${
              selectedPlayer === player.number
                ? "bg-white text-blue-600 shadow-lg ring-2 ring-yellow-300"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {player.number}
          </Button>
        ))}
      </div>
    </div>
  )
}

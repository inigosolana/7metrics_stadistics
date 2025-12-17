"use client"

export const OpponentGoalStats = ({ events }: { events: any[] }) => {
  // Filtrar tiros del equipo contrario
  const opponentShots = events.filter((e) => ["GOL", "PARADA", "FUERA", "POSTE", "BLOCADO"].includes(e.action))

  const goals = opponentShots.filter((e) => e.action === "GOL").length
  const saves = opponentShots.filter((e) => e.action === "PARADA").length
  const blocks = opponentShots.filter((e) => e.action === "BLOCADO").length

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 shadow-lg">
      <div className="text-center">
        <div className="text-sm font-bold text-blue-100 mb-2">PORTERÍA LOCAL</div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{goals}</div>
            <div className="text-xs text-blue-100">Goles</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-300">{saves}</div>
            <div className="text-xs text-blue-100">Paradas</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-300">{blocks}</div>
            <div className="text-xs text-blue-100">Bloques</div>
          </div>
        </div>
      </div>
    </div>
  )
}

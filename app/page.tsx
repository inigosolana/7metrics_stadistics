"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Shield } from "lucide-react"

// --- TIPOS DE DATOS ---
type Player = {
  number: number
  name: string
  isGoalkeeper: boolean
}

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

// --- CONSTANTES ---
const COURT_ZONES = [
  "Extremo Izq",
  "Lateral Izq",
  "Central",
  "Lateral Der",
  "Extremo Der",
  "Pivote (6m)",
  "Línea 9m Izq",
  "Línea 9m Centro",
  "Línea 9m Der",
]

const LOSS_TYPES = ["Error Pase", "Error Recepción", "Pasos", "Pisando", "Falta en Ataque"]
const DEFENSE_TYPES = ["6:0", "5:1", "3:2:1", "4:2", "Mixta", "Presión Toda", "Otro"]
const GAME_SITUATIONS = [
  "Igualdad (6x6)",
  "Superioridad (6x5)",
  "Ataque 7x6",
  "Inferioridad (5x6)",
  "Inferioridad (4x6)",
  "Contraataque",
]

// Mock jugadores
const PLAYERS_A: Player[] = Array.from({ length: 14 }, (_, i) => ({
  number: i + 1,
  name: `Jugador ${i + 1}`,
  isGoalkeeper: i === 0,
}))

const PLAYERS_B: Player[] = Array.from({ length: 14 }, (_, i) => ({
  number: i + 1,
  name: `Oponente ${i + 1}`,
  isGoalkeeper: i === 0,
}))

const HeaderScoreboard = ({
  localScore,
  visitorScore,
  teamAName,
  teamBName,
  time,
  isRunning,
  setIsRunning,
  formatTime,
}: any) => (
  <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 border-b-4 border-blue-400 px-2 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between shadow-lg shrink-0 z-30 relative h-auto box-border">
    {/* Equipo Local */}
    <div className="flex flex-col items-start min-w-fit sm:min-w-[120px] md:min-w-[150px]">
      <span className="text-[9px] sm:text-xs md:text-sm font-bold text-white tracking-widest mb-0.5 sm:mb-1">
        LOCAL
      </span>
      <div className="flex items-baseline gap-1 sm:gap-2 md:gap-3">
        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-none tabular-nums">
          {localScore}
        </span>
        <span className="text-[8px] sm:text-xs md:text-sm text-white/80 truncate max-w-[60px] sm:max-w-[100px]">
          {teamAName}
        </span>
      </div>
    </div>

    {/* Cronómetro Central */}
    <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
      <div className="bg-black/50 px-2 sm:px-3 md:px-4 py-1 rounded-lg border-2 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
        <span className="font-mono text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-400 tracking-widest tabular-nums">
          {formatTime(time)}
        </span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsRunning(!isRunning)}
        className={`mt-1 h-5 sm:h-6 text-[8px] sm:text-xs uppercase tracking-widest font-bold ${isRunning ? "text-red-300 hover:text-red-200 hover:bg-red-950/30" : "text-green-300 hover:text-green-200 hover:bg-green-950/30"}`}
      >
        {isRunning ? "PAUSAR" : "INICIAR"}
      </Button>
    </div>

    {/* Equipo Visitante */}
    <div className="flex flex-col items-end min-w-fit sm:min-w-[120px] md:min-w-[150px]">
      <span className="text-[9px] sm:text-xs md:text-sm font-bold text-white tracking-widest mb-0.5 sm:mb-1">
        VISITANTE
      </span>
      <div className="flex items-baseline gap-1 sm:gap-2 md:gap-3 flex-row-reverse">
        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-none tabular-nums">
          {visitorScore}
        </span>
        <span className="text-[8px] sm:text-xs md:text-sm text-white/80 truncate max-w-[60px] sm:max-w-[100px]">
          {teamBName}
        </span>
      </div>
    </div>
  </div>
)

const PlayerNumbersPanel = ({
  team,
  players,
  selectedPlayer,
  onPlayerSelect,
  teamName,
}: {
  team: "A" | "B"
  players: Player[]
  selectedPlayer: number | null
  onPlayerSelect: (number: number) => void
  teamName: string
}) => {
  if (selectedPlayer !== null) {
    return (
      <div
        className={`bg-gradient-to-br ${team === "A" ? "from-blue-600 to-blue-800" : "from-amber-600 to-amber-800"} border-2 ${team === "A" ? "border-blue-400" : "border-amber-400"} rounded-lg p-2 sm:p-3 h-full flex flex-col min-h-0 shadow-lg`}
      >
        <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2 px-1 shrink-0 mb-2">
          <Trophy className="w-4 h-4" /> {teamName} - Jugador #{selectedPlayer}
        </div>
        <div className="flex-1 flex items-center justify-center text-center">
          <div className="text-5xl sm:text-6xl md:text-7xl font-black text-white drop-shadow-lg">{selectedPlayer}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-gradient-to-br ${team === "A" ? "from-blue-600 to-blue-800" : "from-amber-600 to-amber-800"} border-2 ${team === "A" ? "border-blue-400" : "border-amber-400"} rounded-lg p-2 sm:p-3 h-full flex flex-col min-h-0 shadow-lg`}
    >
      <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2 px-1 shrink-0 mb-2">
        <Trophy className="w-4 h-4" /> {teamName}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 overflow-y-auto pb-2 pr-1 custom-scrollbar flex-1 content-start min-h-0">
        {players.map((player) => (
          <Button
            key={player.number}
            onClick={() => {
              console.log("[v0] Player selected:", player.number)
              onPlayerSelect(player.number)
            }}
            className={`h-12 sm:h-14 md:h-16 flex flex-col justify-center items-center font-bold text-lg sm:text-xl rounded-lg transition-all active:scale-95 shadow-md ${
              team === "A"
                ? "bg-blue-500 hover:bg-blue-400 text-white border-2 border-blue-300"
                : "bg-amber-500 hover:bg-amber-400 text-white border-2 border-amber-300"
            }`}
          >
            {player.number}
            {player.isGoalkeeper && <span className="text-[8px] mt-0.5">GK</span>}
          </Button>
        ))}
      </div>
    </div>
  )
}

const ActionsPanel = ({
  selectedPlayer,
  selectedTeam,
  isGoalkeeper,
  onBack,
  onActionSelect,
  events,
}: {
  selectedPlayer: number | null
  selectedTeam: "A" | "B" | null
  isGoalkeeper: boolean
  onBack: () => void
  onActionSelect: (action: string) => void
  events: Event[]
}) => {
  const [step, setStep] = useState<"actions" | "details">("actions")
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [selectedDefense, setSelectedDefense] = useState<string>("")
  const [selectedZone, setSelectedZone] = useState<number | null>(null)
  const [selectedCourtZone, setSelectedCourtZone] = useState<string>("")
  const [selectedContext, setSelectedContext] = useState<string[]>([])

  if (!selectedPlayer) {
    return (
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 rounded-lg p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center shadow-lg">
        <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-slate-500 opacity-50 mb-3" />
        <p className="text-slate-300 text-sm sm:text-base font-medium">
          Selecciona un jugador para registrar una acción
        </p>
      </div>
    )
  }

  const handleConfirm = () => {
    if (selectedAction && selectedDefense && selectedCourtZone && selectedZone) {
      console.log("[v0] Action confirmed:", {
        player: selectedPlayer,
        action: selectedAction,
        defense: selectedDefense,
        courtZone: selectedCourtZone,
        zone: selectedZone,
      })
      // Reset states
      setStep("actions")
      setSelectedAction(null)
      setSelectedDefense("")
      setSelectedZone(null)
      setSelectedCourtZone("")
      onBack()
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 rounded-lg p-3 sm:p-4 h-full flex flex-col shadow-lg">
      {step === "actions" ? (
        <>
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-600 shrink-0">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-300 hover:text-white -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
            </Button>
            <span className="text-white font-bold">Jugador #{selectedPlayer}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1 overflow-y-auto pb-4 custom-scrollbar min-h-0">
            {!isGoalkeeper ? (
              <>
                <Button
                  className="h-16 sm:h-20 bg-green-600 hover:bg-green-500 text-white font-bold col-span-2"
                  onClick={() => {
                    setSelectedAction("GOL")
                    setStep("details")
                  }}
                >
                  GOL
                </Button>
                <Button
                  className="h-14 sm:h-16 bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  onClick={() => {
                    setSelectedAction("PARADA")
                    setStep("details")
                  }}
                >
                  PARADA
                </Button>
                <Button
                  className="h-14 sm:h-16 bg-yellow-600 hover:bg-yellow-500 text-white font-bold"
                  onClick={() => {
                    setSelectedAction("FUERA")
                    setStep("details")
                  }}
                >
                  FUERA
                </Button>
                <Button
                  className="h-12 bg-slate-600 hover:bg-slate-500 text-white col-span-2"
                  onClick={() => {
                    setSelectedAction("TIRO")
                    setStep("details")
                  }}
                >
                  TIRO
                </Button>
                <Button
                  className="h-12 bg-red-600 hover:bg-red-500 text-white col-span-2"
                  onClick={() => {
                    setSelectedAction("PÉRDIDA")
                    setStep("details")
                  }}
                >
                  PÉRDIDA
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="h-16 sm:h-20 bg-blue-600 hover:bg-blue-500 text-white font-bold col-span-2"
                  onClick={() => {
                    setSelectedAction("PARADA")
                    setStep("details")
                  }}
                >
                  PARADA
                </Button>
                <Button
                  className="h-16 sm:h-20 bg-red-600 hover:bg-red-500 text-white font-bold col-span-2"
                  onClick={() => {
                    setSelectedAction("GOL ENCAJADO")
                    setStep("details")
                  }}
                >
                  GOL ENCAJADO
                </Button>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-600 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("actions")}
              className="text-slate-300 hover:text-white -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="text-green-400 font-bold">{selectedAction}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pb-20 custom-scrollbar min-h-0 pr-2">
            {/* Defensa Rival */}
            <div className="bg-slate-800 p-2 sm:p-3 rounded-lg border border-slate-600">
              <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Defensa Rival</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEFENSE_TYPES.map((def) => (
                  <Button
                    key={def}
                    size="sm"
                    variant={selectedDefense === def ? "default" : "outline"}
                    className={`text-[10px] sm:text-xs h-8 sm:h-10 ${selectedDefense === def ? "bg-indigo-600 text-white" : "bg-slate-700 border-slate-600 text-slate-300"}`}
                    onClick={() => setSelectedDefense(def)}
                  >
                    {def}
                  </Button>
                ))}
              </div>
            </div>

            {/* Zona de Acción */}
            <div className="bg-slate-800 p-2 sm:p-3 rounded-lg border border-slate-600">
              <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Zona de Acción</div>
              <div className="grid grid-cols-3 gap-2">
                {COURT_ZONES.map((z, i) => (
                  <Button
                    key={z}
                    size="sm"
                    variant={selectedCourtZone === z ? "default" : "outline"}
                    className={`h-8 sm:h-10 text-[9px] sm:text-xs leading-tight ${selectedCourtZone === z ? "bg-blue-600 text-white" : "bg-slate-700 border-slate-600 text-slate-300"}`}
                    onClick={() => setSelectedCourtZone(z)}
                  >
                    {z}
                  </Button>
                ))}
              </div>
            </div>

            {/* Zona de Portería */}
            <div className="bg-slate-800 p-2 sm:p-3 rounded-lg border border-slate-600">
              <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Zona de Portería</div>
              <div className="aspect-square max-w-[150px] sm:max-w-[180px] mx-auto grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((z) => (
                  <Button
                    key={z}
                    variant="ghost"
                    className={`h-full font-bold text-sm rounded-sm transition-all ${selectedZone === z ? "bg-green-500 text-white" : "bg-slate-800 text-slate-400"}`}
                    onClick={() => setSelectedZone(z)}
                  >
                    {z}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 z-10">
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold"
              onClick={handleConfirm}
              disabled={!selectedDefense || !selectedCourtZone || !selectedZone}
            >
              CONFIRMAR
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// --- PÁGINA PRINCIPAL ---
export default function EventPadPage() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedPlayerA, setSelectedPlayerA] = useState<number | null>(null)
  const [selectedPlayerB, setSelectedPlayerB] = useState<number | null>(null)
  const [localScore, setLocalScore] = useState(0)
  const [visitorScore, setVisitorScore] = useState(0)

  // Cronómetro
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning) {
      interval = setInterval(() => setTime((t) => t + 1), 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const getSelectedPlayer = () => {
    if (selectedPlayerA !== null) {
      return PLAYERS_A.find((p) => p.number === selectedPlayerA)
    }
    if (selectedPlayerB !== null) {
      return PLAYERS_B.find((p) => p.number === selectedPlayerB)
    }
    return null
  }

  const handlePlayerSelect = (team: "A" | "B", number: number) => {
    console.log("[v0] Selecting player:", team, number)
    if (team === "A") {
      setSelectedPlayerA(selectedPlayerA === number ? null : number)
      setSelectedPlayerB(null)
    } else {
      setSelectedPlayerB(selectedPlayerB === number ? null : number)
      setSelectedPlayerA(null)
    }
  }

  const handleClearSelection = () => {
    console.log("[v0] Clearing selection")
    setSelectedPlayerA(null)
    setSelectedPlayerB(null)
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <HeaderScoreboard
        localScore={localScore}
        visitorScore={visitorScore}
        teamAName="Local"
        teamBName="Visitante"
        time={time}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        formatTime={formatTime}
      />

      {/* Contenedor principal responsive */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 overflow-hidden min-h-0">
        {/* Panel Izquierdo - Equipo Local */}
        <div className="min-h-0 min-w-0">
          <PlayerNumbersPanel
            team="A"
            players={PLAYERS_A}
            selectedPlayer={selectedPlayerA}
            onPlayerSelect={(number) => handlePlayerSelect("A", number)}
            teamName="Equipo A"
          />
        </div>

        {/* Panel Central - Acciones */}
        <div className="min-h-0 min-w-0 hidden sm:block">
          <ActionsPanel
            selectedPlayer={selectedPlayerA || selectedPlayerB}
            selectedTeam={selectedPlayerA ? "A" : selectedPlayerB ? "B" : null}
            isGoalkeeper={getSelectedPlayer()?.isGoalkeeper || false}
            onBack={handleClearSelection}
            onActionSelect={() => {}}
            events={events}
          />
        </div>

        {/* Panel Derecho - Equipo Visitante */}
        <div className="min-h-0 min-w-0">
          <PlayerNumbersPanel
            team="B"
            players={PLAYERS_B}
            selectedPlayer={selectedPlayerB}
            onPlayerSelect={(number) => handlePlayerSelect("B", number)}
            teamName="Equipo B"
          />
        </div>
      </div>

      {/* Panel Central en móvil */}
      {(selectedPlayerA !== null || selectedPlayerB !== null) && (
        <div className="sm:hidden p-2 bg-slate-900 border-t border-slate-800 max-h-96 overflow-y-auto">
          <ActionsPanel
            selectedPlayer={selectedPlayerA || selectedPlayerB}
            selectedTeam={selectedPlayerA ? "A" : selectedPlayerB ? "B" : null}
            isGoalkeeper={getSelectedPlayer()?.isGoalkeeper || false}
            onBack={handleClearSelection}
            onActionSelect={() => {}}
            events={events}
          />
        </div>
      )}
    </div>
  )
}

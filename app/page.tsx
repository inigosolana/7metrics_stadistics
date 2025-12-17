"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Pause,
  Play,
  ArrowLeft,
  Users,
  Activity,
  History,
  Trophy,
  Settings,
  Edit3,
  Target,
  Shield,
  AlertCircle,
  Maximize2,
} from "lucide-react"
import { HistoryPanel } from "@/components/history-panel"

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

type WizardState = "IDLE" | "ACTION_SELECTION" | "DETAILS"
type AppState = "SETUP" | "MATCH"

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

// --- COMPONENTES AUXILIARES (DEFINIDOS FUERA) ---

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
  <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2 flex items-center justify-between shadow-md shrink-0 z-30 relative h-16 sm:h-20 box-border">
    {/* Equipo Local */}
    <div className="flex flex-col items-start min-w-[100px] sm:min-w-[150px]">
      <span className="text-[10px] sm:text-xs text-blue-400 font-bold tracking-wider mb-1">LOCAL</span>
      <div className="flex items-baseline gap-2 sm:gap-3">
        <span className="text-2xl sm:text-3xl font-bold text-white leading-none tabular-nums">{localScore}</span>
        <span className="text-xs sm:text-sm text-slate-400 truncate max-w-[80px] sm:max-w-[120px]">{teamAName}</span>
      </div>
    </div>

    {/* Cronómetro Central */}
    <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 top-1">
      <div className="bg-black/40 px-4 sm:px-6 py-1 rounded-b-xl border-b border-x border-slate-800 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
        <span className="font-mono text-3xl sm:text-4xl font-bold text-green-400 tracking-widest tabular-nums">
          {formatTime(time)}
        </span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsRunning(!isRunning)}
        className={`mt-1 h-6 text-[10px] sm:text-xs uppercase tracking-widest font-bold ${isRunning ? "text-red-400 hover:text-red-300 hover:bg-red-950/30" : "text-green-400 hover:text-green-300 hover:bg-green-950/30"}`}
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

    {/* Equipo Visitante */}
    <div className="flex flex-col items-end min-w-[100px] sm:min-w-[150px]">
      <span className="text-[10px] sm:text-xs text-amber-400 font-bold tracking-wider mb-1">VISITANTE</span>
      <div className="flex items-baseline gap-2 sm:gap-3 flex-row-reverse">
        <span className="text-2xl sm:text-3xl font-bold text-white leading-none tabular-nums">{visitorScore}</span>
        <span className="text-xs sm:text-sm text-slate-400 truncate max-w-[80px] sm:max-w-[120px]">{teamBName}</span>
      </div>
    </div>
  </div>
)

const PlayerGrid = ({ team, players, selectedPlayerA, selectedPlayerB, handlePlayerSelect, teamName }: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 h-full flex flex-col min-h-0">
    <div
      className={`text-xs font-bold mb-2 uppercase tracking-wide flex items-center gap-2 px-1 shrink-0 ${team === "A" ? "text-blue-400" : "text-amber-400"}`}
    >
      <Trophy className="w-3 h-3" /> {teamName}
    </div>
    <div className="grid grid-cols-4 gap-2 overflow-y-auto pb-2 pr-1 custom-scrollbar flex-1 content-start min-h-0">
      {players.map((player: Player) => {
        const isSelected = (team === "A" ? selectedPlayerA : selectedPlayerB) === player.number
        return (
          <Button
            key={player.number}
            variant="outline"
            className={`h-12 sm:h-14 flex flex-col justify-center border-slate-700 relative transition-all duration-75 active:scale-95 ${
              isSelected
                ? team === "A"
                  ? "bg-blue-600 border-blue-500 text-white ring-2 ring-blue-400/30"
                  : "bg-amber-600 border-amber-500 text-white ring-2 ring-amber-400/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
            onClick={() => handlePlayerSelect(team, player.number)}
          >
            <span className="text-lg font-bold leading-none">#{player.number}</span>
            {player.isGoalkeeper && (
              <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-700 font-mono">
                GK
              </span>
            )}
          </Button>
        )
      })}
    </div>
  </div>
)

const ActionWizard = ({
  wizardState,
  activePlayer,
  isGoalkeeper,
  handleBack,
  currentAction,
  handleActionSelect,
  selectedDefenseType,
  setSelectedDefenseType,
  selectedLossType,
  setSelectedLossType,
  selectedCourtZone,
  setSelectedCourtZone,
  selectedGoalZone,
  setSelectedGoalZone,
  selectedContext,
  toggleContext,
  confirmEvent,
}: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 h-full flex flex-col relative overflow-hidden min-h-0">
    {wizardState === "IDLE" && (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-40">
        <Users className="w-20 h-20 text-slate-500 stroke-1" />
        <p className="text-slate-400 font-medium">Selecciona un jugador para registrar una acción</p>
      </div>
    )}

    {wizardState === "ACTION_SELECTION" && (
      <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-150 min-h-0">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleBack} className="text-slate-400 hover:text-white -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
          </Button>
          <div className="text-right">
            <span className="text-xs text-slate-500 block uppercase">Jugador Seleccionado</span>
            <span className="font-bold text-white text-lg">
              #{activePlayer?.player}{" "}
              {isGoalkeeper && <span className="text-xs text-slate-400 font-normal ml-1">(Portero)</span>}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 flex-1 content-start overflow-y-auto pb-4 min-h-0">
          {!isGoalkeeper ? (
            <>
              <Button
                className="h-20 text-xl font-black bg-green-600 hover:bg-green-500 text-white shadow-lg col-span-2"
                onClick={() => handleActionSelect("GOL")}
              >
                GOL
              </Button>
              <Button
                className="h-16 text-base font-bold bg-green-700 hover:bg-green-600 text-white col-span-2"
                onClick={() => handleActionSelect("GOL CAMPO A CAMPO")}
              >
                GOL CAMPO A CAMPO
              </Button>
              <Button
                className="h-16 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white"
                onClick={() => handleActionSelect("PARADA")}
              >
                PARADA
              </Button>
              <Button
                className="h-16 text-lg font-bold bg-yellow-600 hover:bg-yellow-500 text-white"
                onClick={() => handleActionSelect("FUERA")}
              >
                FUERA
              </Button>
              <Button
                className="h-14 font-semibold bg-slate-800 border border-slate-700"
                onClick={() => handleActionSelect("POSTE")}
              >
                POSTE
              </Button>
              <Button
                className="h-14 font-semibold bg-slate-800 border border-slate-700"
                onClick={() => handleActionSelect("BLOCADO")}
              >
                BLOCADO
              </Button>
              <Button
                className="h-14 font-semibold bg-red-600 hover:bg-red-500 text-white col-span-2"
                onClick={() => handleActionSelect("PÉRDIDA")}
              >
                PÉRDIDA / ERROR / FALTA ATAQUE
              </Button>
              <Button
                className="h-14 font-semibold bg-slate-700 hover:bg-slate-600"
                onClick={() => handleActionSelect("FALTA")}
              >
                FALTA (Defensiva)
              </Button>
              <Button
                className="h-14 font-semibold bg-purple-600 hover:bg-purple-500"
                onClick={() => handleActionSelect("7 METROS")}
              >
                7 METROS PROVOCADO
              </Button>
              <Button
                className="h-14 font-semibold bg-slate-700 hover:bg-slate-600 col-span-2"
                onClick={() => handleActionSelect("ASISTENCIA")}
              >
                ASISTENCIA
              </Button>
            </>
          ) : (
            <>
              <Button
                className="h-24 text-2xl font-black bg-blue-600 hover:bg-blue-500 col-span-2"
                onClick={() => handleActionSelect("PARADA")}
              >
                PARADA
              </Button>
              <Button
                className="h-24 text-2xl font-black bg-red-600 hover:bg-red-500 col-span-2"
                onClick={() => handleActionSelect("GOL ENCAJADO")}
              >
                GOL ENCAJADO
              </Button>
              <Button
                className="h-16 text-base font-bold bg-green-700 hover:bg-green-600 text-white col-span-2"
                onClick={() => handleActionSelect("GOL CAMPO A CAMPO")}
              >
                GOL CAMPO A CAMPO
              </Button>
              <Button
                className="h-16 text-lg font-bold bg-green-600 hover:bg-green-500 col-span-2"
                onClick={() => handleActionSelect("ASISTENCIA")}
              >
                ASISTENCIA (Pase)
              </Button>
            </>
          )}
        </div>
      </div>
    )}

    {wizardState === "DETAILS" && (
      <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-4 duration-200 min-h-0">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2 text-slate-400">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-green-400 font-bold tracking-wider">{currentAction}</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pb-20 custom-scrollbar pr-1 min-h-0">
          {/* DEFENSA RIVAL (SIEMPRE VISIBLE) */}
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" /> Defensa Rival / Situación
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEFENSE_TYPES.map((def) => (
                <Button
                  key={def}
                  size="sm"
                  variant={selectedDefenseType === def ? "default" : "outline"}
                  className={`text-xs ${selectedDefenseType === def ? "bg-indigo-600 text-white" : "bg-slate-900 border-slate-700 text-slate-400"}`}
                  onClick={() => setSelectedDefenseType(def)}
                >
                  {def}
                </Button>
              ))}
            </div>
          </div>

          {currentAction === "PÉRDIDA" && (
            <div className="bg-red-950/20 p-3 rounded-lg border border-red-900/50">
              <div className="text-[10px] font-bold text-red-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Tipo de Error
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LOSS_TYPES.map((loss) => (
                  <Button
                    key={loss}
                    size="sm"
                    variant={selectedLossType === loss ? "default" : "outline"}
                    className={`text-xs h-auto py-2 ${selectedLossType === loss ? "bg-red-600 text-white" : "bg-slate-900 border-slate-700 text-slate-400"}`}
                    onClick={() => setSelectedLossType(loss)}
                  >
                    {loss}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Zona de Acción</div>
            <div className="grid grid-cols-3 gap-2">
              {COURT_ZONES.map((z) => (
                <Button
                  key={z}
                  size="sm"
                  variant={selectedCourtZone === z ? "default" : "outline"}
                  className={`h-10 text-[10px] leading-tight break-words whitespace-normal ${selectedCourtZone === z ? "bg-blue-600 text-white" : "bg-slate-900 border-slate-700 text-slate-400"}`}
                  onClick={() => setSelectedCourtZone(z)}
                >
                  {z}
                </Button>
              ))}
            </div>
          </div>

          {["GOL", "PARADA", "FUERA", "POSTE", "BLOCADO", "GOL ENCAJADO"].includes(currentAction || "") && (
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                Dirección Lanzamiento
              </div>
              <div className="aspect-square max-w-[200px] mx-auto grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((z) => (
                  <Button
                    key={z}
                    variant="ghost"
                    className={`h-full w-full text-lg font-bold rounded-sm transition-all ${selectedGoalZone === z ? "bg-green-500 text-white" : "bg-slate-900/50 text-slate-600 hover:bg-slate-700 hover:text-slate-300"}`}
                    onClick={() => setSelectedGoalZone(z)}
                  >
                    {z}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Situación de Juego</div>
            <div className="flex flex-wrap gap-2">
              {GAME_SITUATIONS.map((ctx) => (
                <Button
                  key={ctx}
                  size="sm"
                  variant={selectedContext.includes(ctx) ? "default" : "outline"}
                  className={`text-xs ${selectedContext.includes(ctx) ? "bg-orange-600 hover:bg-orange-500 border-orange-500" : "bg-slate-900 border-slate-700"}`}
                  onClick={() => toggleContext(ctx)}
                >
                  {ctx}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <Button
            size="lg"
            className="w-full h-12 bg-green-600 hover:bg-green-500 text-white shadow-xl font-bold tracking-widest text-lg"
            onClick={() => confirmEvent()}
          >
            CONFIRMAR
          </Button>
        </div>
      </div>
    )}
  </div>
)

const PorteriaResponsive = ({ events }: { events: Event[] }) => {
  // --- LÓGICA DE FILTRADO ACTUALIZADA ---
  // Filtramos SOLO acciones que representan un TIRO CONTRA LA PORTERÍA LOCAL.
  const shots = events.filter((e) => {
    // 1. Debe tener zona de portería
    if (!e.goalZone) return false

    // 2. Si es Equipo B (Visitante), nos vale todo lo que sea tiro
    if (e.team === "B") {
      return ["GOL", "PARADA", "FUERA", "POSTE", "BLOCADO"].includes(e.action)
    }

    // 3. Si es Equipo A (Local), SOLO acciones del PORTERO defendiendo
    if (e.team === "A") {
      return ["PARADA", "GOL ENCAJADO"].includes(e.action)
    }

    // Cualquier otra cosa (ej. Gol de Jugador A en ataque) se ignora
    return false
  })

  // Cálculos sobre los tiros FILTRADOS
  const total = shots.length

  // Goles encajados: (Gol de B) O (Gol Encajado registrado por A)
  const goalsTotal = shots.filter(
    (s) => (s.team === "B" && s.action === "GOL") || (s.team === "A" && s.action === "GOL ENCAJADO"),
  ).length

  // Paradas: (Parada de A) O (Parada registrada sobre B)
  const savesTotal = shots.filter((s) => s.action === "PARADA" || s.action === "BLOCADO").length

  // Tiros fuera/poste
  const missTotal = shots.filter((s) => s.action === "FUERA" || s.action === "POSTE").length

  // Cálculo de Porcentaje: (Paradas / (Paradas + Goles)) * 100
  // Excluimos "Fuera" y "Poste" del denominador de efectividad pura del portero si se quiere % de acierto bajo palos,
  // PERO habitualmente % Paradas es Paradas / Tiros a Puerta (Goles + Paradas).
  const shotsOnTarget = goalsTotal + savesTotal
  const percentageTotal = shotsOnTarget > 0 ? Math.round((savesTotal / shotsOnTarget) * 100) : 0

  const getZoneStats = (zone: number) => {
    const zoneShots = shots.filter((s) => s.goalZone === zone)
    const count = zoneShots.length

    const zGoals = zoneShots.filter(
      (s) => (s.team === "B" && s.action === "GOL") || (s.team === "A" && s.action === "GOL ENCAJADO"),
    ).length

    const zSaves = zoneShots.filter((s) => s.action === "PARADA" || s.action === "BLOCADO").length

    // Porcentaje de zona
    const zOnTarget = zGoals + zSaves
    const zonePercentage = zOnTarget > 0 ? Math.round((zSaves / zOnTarget) * 100) : 0

    return { count, goals: zGoals, saves: zSaves, zonePercentage }
  }

  const zones = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between text-[10px] text-slate-400 mb-1 px-1 shrink-0">
        <span>
          Tiros: <b className="text-white">{total}</b>
        </span>
        <span>
          Goles: <b className="text-red-400">{goalsTotal}</b>
        </span>
        <span>
          % Paradas:{" "}
          <b className={`text-lg ${percentageTotal > 35 ? "text-green-400" : "text-amber-400"}`}>{percentageTotal}%</b>
        </span>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-800 min-h-0">
        {zones.map((z) => {
          const stats = getZoneStats(z)
          // Intensidad visual basada en cantidad total de tiros
          const intensity = total > 0 ? stats.count / total : 0
          const bgOpacity = intensity > 0 ? Math.min(intensity * 0.8 + 0.1, 0.9) : 0

          return (
            <div
              key={z}
              className="relative rounded border border-slate-700/50 flex flex-col items-center justify-center overflow-hidden"
              style={{ backgroundColor: `rgba(59, 130, 246, ${bgOpacity})` }}
            >
              <span className="absolute top-0.5 right-1 text-[8px] text-slate-500 font-mono opacity-50">Z{z}</span>

              <div className="text-center z-10">
                <span
                  className={`text-xl sm:text-2xl font-bold drop-shadow-md ${stats.zonePercentage > 50 ? "text-green-300" : "text-white"}`}
                >
                  {stats.count > 0 ? `${stats.zonePercentage}%` : "-"}
                </span>
                {stats.count > 0 && (
                  <div className="text-[8px] font-bold mt-[-2px] text-slate-300 drop-shadow-sm flex gap-1 justify-center">
                    <span className="text-blue-200">{stats.saves}P</span>
                    <span>/</span>
                    <span className="text-red-300">{stats.goals}G</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- COMPONENTE PRINCIPAL ---

export default function EventPad() {
  const [appState, setAppState] = useState<AppState>("SETUP")

  const [teamAName, setTeamAName] = useState("Equipo Local")
  const [teamBName, setTeamBName] = useState("Equipo Visitante")
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>(
    Array.from({ length: 16 }, (_, i) => ({ number: i + 1, name: `Jugador ${i + 1}`, isGoalkeeper: i === 0 })),
  )
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>(
    Array.from({ length: 16 }, (_, i) => ({ number: i + 1, name: `Jugador ${i + 1}`, isGoalkeeper: i === 0 })),
  )

  const [editingPlayer, setEditingPlayer] = useState<{ team: "A" | "B"; index: number } | null>(null)
  const [tempPlayerName, setTempPlayerName] = useState("")
  const [tempPlayerNumber, setTempPlayerNumber] = useState("")
  const [tempPlayerPosition, setTempPlayerPosition] = useState<"field" | "goalkeeper">("field")

  const [selectedPlayerA, setSelectedPlayerA] = useState<number | null>(null)
  const [selectedPlayerB, setSelectedPlayerB] = useState<number | null>(null)
  const [localScore, setLocalScore] = useState(0)
  const [visitorScore, setVisitorScore] = useState(0)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [events, setEvents] = useState<Event[]>([])

  const [wizardState, setWizardState] = useState<WizardState>("IDLE")
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [selectedCourtZone, setSelectedCourtZone] = useState<string | null>(null)
  const [selectedGoalZone, setSelectedGoalZone] = useState<number | null>(null)
  const [selectedContext, setSelectedContext] = useState<string[]>([])
  const [selectedLossType, setSelectedLossType] = useState<string | null>(null)
  const [selectedDefenseType, setSelectedDefenseType] = useState<string | null>(null)

  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState("action")

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getActiveTeamAndPlayer = () => {
    if (selectedPlayerA !== null) return { team: "A" as const, player: selectedPlayerA }
    if (selectedPlayerB !== null) return { team: "B" as const, player: selectedPlayerB }
    return null
  }

  const isGoalkeeper = () => {
    const activePlayer = getActiveTeamAndPlayer()
    if (!activePlayer) return false
    const players = activePlayer.team === "A" ? teamAPlayers : teamBPlayers
    return players.find((p) => p.number === activePlayer.player)?.isGoalkeeper || false
  }

  const handleEditPlayer = (team: "A" | "B", index: number) => {
    const player = team === "A" ? teamAPlayers[index] : teamBPlayers[index]
    setEditingPlayer({ team, index })
    setTempPlayerName(player.name)
    setTempPlayerNumber(player.number.toString())
    setTempPlayerPosition(player.isGoalkeeper ? "goalkeeper" : "field")
  }

  const handleSavePlayer = () => {
    if (!editingPlayer) return
    const { team, index } = editingPlayer
    const updatedPlayer: Player = {
      number: Number.parseInt(tempPlayerNumber) || index + 1,
      name: tempPlayerName || `Jugador ${index + 1}`,
      isGoalkeeper: tempPlayerPosition === "goalkeeper",
    }
    if (team === "A") {
      const newPlayers = [...teamAPlayers]
      newPlayers[index] = updatedPlayer
      setTeamAPlayers(newPlayers)
    } else {
      const newPlayers = [...teamBPlayers]
      newPlayers[index] = updatedPlayer
      setTeamBPlayers(newPlayers)
    }
    setEditingPlayer(null)
  }

  const handlePlayerSelect = (team: "A" | "B", playerNumber: number) => {
    if (team === "A") {
      setSelectedPlayerA(playerNumber)
      setSelectedPlayerB(null)
    } else {
      setSelectedPlayerB(playerNumber)
      setSelectedPlayerA(null)
    }
    setWizardState("ACTION_SELECTION")
    resetWizardData()
    if (isMobile) setActiveTab("action")
  }

  const resetWizardData = () => {
    setCurrentAction(null)
    setSelectedCourtZone(null)
    setSelectedGoalZone(null)
    setSelectedContext([])
    setSelectedLossType(null)
    setSelectedDefenseType(null)
  }

  const handleBack = () => {
    if (wizardState === "DETAILS") {
      setWizardState("ACTION_SELECTION")
      resetWizardData()
    } else if (wizardState === "ACTION_SELECTION") {
      setWizardState("IDLE")
      setSelectedPlayerA(null)
      setSelectedPlayerB(null)
      resetWizardData()
    }
  }

  const handleActionSelect = (action: string) => {
    setCurrentAction(action)
    const actionsWithDetails = [
      "GOL",
      "GOL CAMPO A CAMPO",
      "PARADA",
      "GOL ENCAJADO",
      "FUERA",
      "POSTE",
      "BLOCADO",
      "PÉRDIDA",
    ]
    if (actionsWithDetails.includes(action)) setWizardState("DETAILS")
    else confirmEvent(action)
  }

  const confirmEvent = (actionOverride?: string) => {
    const activePlayer = getActiveTeamAndPlayer()
    if (!activePlayer) return
    const finalAction = actionOverride || currentAction
    if (!finalAction) return

    const event: Event = {
      id: Date.now().toString(),
      timestamp: time,
      player: activePlayer.player,
      team: activePlayer.team,
      action: finalAction,
      courtZone: selectedCourtZone || undefined,
      goalZone: selectedGoalZone || undefined,
      specificAction: selectedLossType || undefined,
      defenseType: selectedDefenseType || undefined,
      context: selectedContext.length > 0 ? selectedContext : undefined,
    }

    setEvents((prev) => [...prev, event])
    if (finalAction === "GOL" || finalAction === "GOL CAMPO A CAMPO") {
      if (activePlayer.team === "A") setLocalScore((prev) => prev + 1)
      else setVisitorScore((prev) => prev + 1)
    }
    setWizardState("IDLE")
    setSelectedPlayerA(null)
    setSelectedPlayerB(null)
    resetWizardData()
  }

  const toggleContext = (ctx: string) => {
    const situationTypes = GAME_SITUATIONS.map((s) => s)
    if (situationTypes.includes(ctx)) {
      const cleanContext = selectedContext.filter((c) => !situationTypes.includes(c))
      setSelectedContext([...cleanContext, ctx])
    } else {
      setSelectedContext((prev) => (prev.includes(ctx) ? prev.filter((c) => c !== ctx) : [...prev, ctx]))
    }
  }

  const handleUndo = () => {
    if (events.length === 0) return
    const lastEvent = events[events.length - 1]
    if (lastEvent.action === "GOL" || lastEvent.action === "GOL CAMPO A CAMPO") {
      if (lastEvent.team === "A") setLocalScore((prev) => Math.max(0, prev - 1))
      else setVisitorScore((prev) => Math.max(0, prev - 1))
    }
    setEvents((prev) => prev.slice(0, -1))
  }

  const exportData = () => {
    const csv = [
      [
        "Tiempo",
        "Equipo",
        "Jugador",
        "Acción Principal",
        "Detalle Error",
        "Defensa Rival",
        "Zona Pista",
        "Zona Portería",
        "Contexto",
      ].join(","),
      ...events.map((e) =>
        [
          formatTime(e.timestamp),
          e.team === "A" ? teamAName : teamBName,
          `#${e.player}`,
          e.action,
          e.specificAction || "",
          e.defenseType || "",
          e.courtZone || "",
          e.goalZone || "",
          e.context?.join("+") || "",
        ].join(","),
      ),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `partido-${Date.now()}.csv`
    a.click()
  }

  if (appState === "SETUP") {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2 py-6">
            <Settings className="w-16 h-16 mx-auto text-blue-400" />
            <h1 className="text-3xl font-bold">Configuración del Partido</h1>
            <p className="text-slate-400">Configura los equipos antes de comenzar</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <label className="block text-sm font-bold text-blue-400 mb-2">Equipo Local</label>
              <input
                type="text"
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                placeholder="Nombre del equipo"
              />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <label className="block text-sm font-bold text-amber-400 mb-2">Equipo Visitante</label>
              <input
                type="text"
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                placeholder="Nombre del equipo"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-bold text-blue-400 mb-3">Jugadores {teamAName}</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {teamAPlayers.map((player, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded p-2 flex items-center gap-2">
                    <span className="text-blue-400 font-bold w-8">#{player.number}</span>
                    <span className="flex-1 text-sm">{player.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleEditPlayer("A", idx)}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-bold text-amber-400 mb-3">Jugadores {teamBName}</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {teamBPlayers.map((player, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded p-2 flex items-center gap-2">
                    <span className="text-amber-400 font-bold w-8">#{player.number}</span>
                    <span className="flex-1 text-sm">{player.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleEditPlayer("B", idx)}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {editingPlayer && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 w-96 space-y-4">
                <h3 className="font-bold text-lg">Editar Jugador</h3>
                <input
                  type="number"
                  value={tempPlayerNumber}
                  onChange={(e) => setTempPlayerNumber(e.target.value)}
                  className="w-full bg-slate-950 border-slate-700 p-2 rounded"
                  placeholder="Número"
                />
                <input
                  type="text"
                  value={tempPlayerName}
                  onChange={(e) => setTempPlayerName(e.target.value)}
                  className="w-full bg-slate-950 border-slate-700 p-2 rounded"
                  placeholder="Nombre"
                />
                <select
                  value={tempPlayerPosition}
                  onChange={(e) => setTempPlayerPosition(e.target.value as any)}
                  className="w-full bg-slate-950 border-slate-700 p-2 rounded"
                >
                  <option value="field">Campo</option>
                  <option value="goalkeeper">Portero</option>
                </select>
                <Button className="w-full bg-green-600" onClick={handleSavePlayer}>
                  Guardar
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-center pt-6">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-12 py-6 text-xl"
              onClick={() => setAppState("MATCH")}
            >
              <Play className="w-6 h-6 mr-2" />
              INICIAR PARTIDO
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
        <HeaderScoreboard
          localScore={localScore}
          visitorScore={visitorScore}
          teamAName={teamAName}
          teamBName={teamBName}
          time={time}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          formatTime={formatTime}
        />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto bg-slate-900 relative min-h-0">
            <TabsContent value="players" className="h-full m-0 p-2 space-y-2">
              <div className="grid grid-rows-2 gap-2 h-full">
                <PlayerGrid
                  team="A"
                  players={teamAPlayers}
                  selectedPlayerA={selectedPlayerA}
                  selectedPlayerB={selectedPlayerB}
                  handlePlayerSelect={handlePlayerSelect}
                  teamName={teamAName}
                />
                <PlayerGrid
                  team="B"
                  players={teamBPlayers}
                  selectedPlayerA={selectedPlayerA}
                  selectedPlayerB={selectedPlayerB}
                  handlePlayerSelect={handlePlayerSelect}
                  teamName={teamBName}
                />
              </div>
            </TabsContent>
            <TabsContent value="action" className="h-full m-0 p-2">
              <ActionWizard
                wizardState={wizardState}
                activePlayer={getActiveTeamAndPlayer()}
                isGoalkeeper={isGoalkeeper()}
                handleBack={handleBack}
                currentAction={currentAction}
                handleActionSelect={handleActionSelect}
                selectedDefenseType={selectedDefenseType}
                setSelectedDefenseType={setSelectedDefenseType}
                selectedLossType={selectedLossType}
                setSelectedLossType={setSelectedLossType}
                selectedCourtZone={selectedCourtZone}
                setSelectedCourtZone={setSelectedCourtZone}
                selectedGoalZone={selectedGoalZone}
                setSelectedGoalZone={setSelectedGoalZone}
                selectedContext={selectedContext}
                toggleContext={toggleContext}
                confirmEvent={confirmEvent}
              />
            </TabsContent>
            <TabsContent value="history" className="h-full m-0 p-2">
              <HistoryPanel
                events={events}
                teamAName={teamAName}
                teamBName={teamBName}
                onUndo={handleUndo}
                onExport={exportData}
                formatTime={formatTime}
              />
            </TabsContent>
            <TabsContent value="stats" className="h-full m-0 p-2 flex flex-col">
              <PorteriaResponsive events={events} />
            </TabsContent>
          </div>
          <TabsList className="shrink-0 h-16 bg-slate-900 border-t border-slate-800 grid grid-cols-4 rounded-none p-0 z-20">
            <TabsTrigger
              value="players"
              className="flex flex-col gap-1 h-full rounded-none data-[state=active]:bg-slate-800 border-r border-slate-800/50"
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px]">Equipos</span>
            </TabsTrigger>
            <TabsTrigger
              value="action"
              className="flex flex-col gap-1 h-full rounded-none data-[state=active]:bg-slate-800 border-r border-slate-800/50"
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px]">Acción</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex flex-col gap-1 h-full rounded-none data-[state=active]:bg-slate-800 border-r border-slate-800/50"
            >
              <History className="w-5 h-5" />
              <span className="text-[10px]">Datos</span>
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex flex-col gap-1 h-full rounded-none data-[state=active]:bg-slate-800"
            >
              <Target className="w-5 h-5" />
              <span className="text-[10px]">Rival</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden box-border">
      <HeaderScoreboard
        localScore={localScore}
        visitorScore={visitorScore}
        teamAName={teamAName}
        teamBName={teamBName}
        time={time}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        formatTime={formatTime}
      />

      <div className="flex-1 overflow-hidden p-2 sm:p-4 w-full h-full min-h-0">
        <div className="grid grid-cols-[minmax(250px,25%)_1fr_minmax(250px,25%)] gap-2 sm:gap-4 h-full w-full max-w-[1920px] mx-auto min-h-0">
          <div className="flex flex-col gap-2 sm:gap-4 h-full overflow-hidden min-h-0">
            <div className="h-[40%] lg:h-[45%] overflow-hidden shrink-0">
              <PlayerGrid
                team="A"
                players={teamAPlayers}
                selectedPlayerA={selectedPlayerA}
                selectedPlayerB={selectedPlayerB}
                handlePlayerSelect={handlePlayerSelect}
                teamName={teamAName}
              />
            </div>
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden relative min-h-0">
              <div className="bg-slate-950 border-b border-slate-800 p-2 text-xs font-bold text-center text-blue-400 uppercase tracking-wider flex justify-between items-center shrink-0">
                <span className="flex items-center gap-2 truncate">
                  <Shield className="w-3 h-3" /> PORTERÍA LOCAL
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white">
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] h-[90vh] bg-slate-950 border-slate-800 p-0 flex flex-col">
                    <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800 shrink-0">
                      <DialogTitle className="text-white">Análisis Detallado: Portería Local</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 p-4 overflow-hidden min-h-0 flex flex-col">
                      <PorteriaResponsive events={events} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex-1 overflow-hidden p-2 flex flex-col min-h-0">
                <PorteriaResponsive events={events} />
                <div className="text-[9px] text-center text-slate-600 mt-1 shrink-0">Tiros recibidos (% Paradas)</div>
              </div>
            </div>
          </div>

          <div className="h-full overflow-hidden shadow-2xl shadow-black/50 rounded-lg bg-slate-900/50 min-h-0">
            <ActionWizard
              wizardState={wizardState}
              activePlayer={getActiveTeamAndPlayer()}
              isGoalkeeper={isGoalkeeper()}
              handleBack={handleBack}
              currentAction={currentAction}
              handleActionSelect={handleActionSelect}
              selectedDefenseType={selectedDefenseType}
              setSelectedDefenseType={setSelectedDefenseType}
              selectedLossType={selectedLossType}
              setSelectedLossType={setSelectedLossType}
              selectedCourtZone={selectedCourtZone}
              setSelectedCourtZone={setSelectedCourtZone}
              selectedGoalZone={selectedGoalZone}
              setSelectedGoalZone={setSelectedGoalZone}
              selectedContext={selectedContext}
              toggleContext={toggleContext}
              confirmEvent={confirmEvent}
            />
          </div>

          <div className="flex flex-col gap-2 sm:gap-4 h-full overflow-hidden min-h-0">
            <div className="h-[40%] lg:h-[45%] overflow-hidden shrink-0">
              <PlayerGrid
                team="B"
                players={teamBPlayers}
                selectedPlayerA={selectedPlayerA}
                selectedPlayerB={selectedPlayerB}
                handlePlayerSelect={handlePlayerSelect}
                teamName={teamBName}
              />
            </div>
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden min-h-0">
              <div className="bg-slate-950 border-b border-slate-800 p-2 text-xs font-bold text-center text-amber-400 uppercase tracking-wider shrink-0">
                <History className="w-3 h-3 inline-block mr-2" /> Historial
              </div>
              <div className="flex-1 overflow-hidden min-h-0">
                <HistoryPanel
                  events={events}
                  teamAName={teamAName}
                  teamBName={teamBName}
                  onUndo={handleUndo}
                  onExport={exportData}
                  formatTime={formatTime}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

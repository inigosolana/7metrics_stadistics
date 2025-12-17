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

// --- COMPONENTES AUXILIARES ---

// 1. HEADER MARCADOR
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
  <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center justify-between shadow-md shrink-0 z-30 relative h-20 box-border">
    {/* Equipo Izquierda (Ahora VISITANTE en layout visual, pero mantengo lógica A/B) */}
    {/* Nota: En el layout de abajo pondremos Visitante a la izquierda. Aquí ajusto el orden visual */}
    <div className="flex flex-col items-start min-w-[150px]">
      <span className="text-xs text-amber-400 font-bold tracking-wider mb-1">VISITANTE (B)</span>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-white leading-none tabular-nums">{visitorScore}</span>
        <span className="text-sm text-slate-400 truncate max-w-[120px]">{teamBName}</span>
      </div>
    </div>

    {/* Cronómetro Central */}
    <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 top-1">
      <div className="bg-black/40 px-6 py-1 rounded-b-xl border-b border-x border-slate-800 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
        <span className="font-mono text-4xl font-bold text-green-400 tracking-widest tabular-nums">
          {formatTime(time)}
        </span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsRunning(!isRunning)}
        className={`mt-1 h-6 text-xs uppercase tracking-widest font-bold ${isRunning ? "text-red-400 hover:text-red-300 hover:bg-red-950/30" : "text-green-400 hover:text-green-300 hover:bg-green-950/30"}`}
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

    {/* Equipo Derecha (Ahora LOCAL) */}
    <div className="flex flex-col items-end min-w-[150px]">
      <span className="text-xs text-blue-400 font-bold tracking-wider mb-1">LOCAL (A)</span>
      <div className="flex items-baseline gap-3 flex-row-reverse">
        <span className="text-3xl font-bold text-white leading-none tabular-nums">{localScore}</span>
        <span className="text-sm text-slate-400 truncate max-w-[120px]">{teamAName}</span>
      </div>
    </div>
  </div>
)

// 2. GRID DE JUGADORES
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

// 3. NUEVO COMPONENTE: TABLA DE ESTADÍSTICAS (CENTRAL SUPERIOR)
const StatsTable = ({ events, teamAName, teamBName }: { events: Event[], teamAName: string, teamBName: string }) => {
    // Cálculos simples basados en eventos
    const getStats = (team: "A" | "B") => {
        return {
            goals: events.filter(e => e.team === team && (e.action === "GOL" || e.action === "GOL CAMPO A CAMPO")).length,
            saves: events.filter(e => e.team === team && e.action === "PARADA").length, // Nota: Parada se asigna al portero del equipo que defiende. Si el evento se registra al portero (ej: Team A Portero hace parada), es +1 para Team A.
            turnovers: events.filter(e => e.team === team && e.action === "PÉRDIDA").length,
            missed: events.filter(e => e.team === team && (e.action === "FUERA" || e.action === "POSTE")).length,
            // Ejemplo de métrica simulada o calculable si añades Exclusiones al evento
            exclusions: 0 
        }
    }

    const statsA = getStats("A");
    const statsB = getStats("B");

    // NOTA VISUAL: El usuario pidió Visitante (B) a la Izquierda en el layout general.
    // Vamos a mantener la tabla consistente con el layout: Izquierda = B, Derecha = A.

    return (
        <div className="bg-slate-200 text-slate-900 rounded-lg overflow-hidden flex flex-col h-full shadow-lg text-sm border border-slate-400">
            <div className="bg-green-600 text-white text-center py-2 font-black uppercase tracking-widest text-xs">
                Estadísticas en Tiempo Real
            </div>
            
            {/* Header Equipos */}
            <div className="flex border-b border-slate-300 bg-slate-100 font-bold text-xs py-2">
                <div className="flex-1 text-center text-amber-700">{teamBName} (Vis)</div>
                <div className="flex-1 text-center text-blue-700">{teamAName} (Loc)</div>
            </div>

            {/* Score Row */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-300 bg-white">
                <span className="text-2xl font-black text-amber-600">{statsB.goals}</span>
                <span className="text-[10px] font-bold uppercase text-slate-500">Goles</span>
                <span className="text-2xl font-black text-blue-600">{statsA.goals}</span>
            </div>

            {/* Stats Rows */}
            <div className="flex-1 flex flex-col justify-center">
                 {/* Paradas */}
                 <div className="flex items-center text-xs py-1.5 border-b border-slate-300/50 hover:bg-slate-50">
                    <div className="flex-1 text-center font-bold">{statsB.saves}</div>
                    <div className="w-24 text-center text-slate-500 uppercase text-[9px]">Paradas</div>
                    <div className="flex-1 text-center font-bold">{statsA.saves}</div>
                </div>
                {/* Pérdidas */}
                <div className="flex items-center text-xs py-1.5 border-b border-slate-300/50 hover:bg-slate-50">
                    <div className="flex-1 text-center font-bold">{statsB.turnovers}</div>
                    <div className="w-24 text-center text-slate-500 uppercase text-[9px]">Pérdidas</div>
                    <div className="flex-1 text-center font-bold">{statsA.turnovers}</div>
                </div>
                {/* Fallos/Fuera */}
                <div className="flex items-center text-xs py-1.5 border-b border-slate-300/50 hover:bg-slate-50">
                    <div className="flex-1 text-center font-bold">{statsB.missed}</div>
                    <div className="w-24 text-center text-slate-500 uppercase text-[9px]">Tiros Fuera</div>
                    <div className="flex-1 text-center font-bold">{statsA.missed}</div>
                </div>
                 {/* Exclusiones (Placeholder ya que no está en el tipo Evento original pero estaba en la foto) */}
                 <div className="flex items-center text-xs py-1.5 hover:bg-slate-50">
                    <div className="flex-1 text-center font-bold text-slate-400">-</div>
                    <div className="w-24 text-center text-slate-500 uppercase text-[9px]">Exclusiones</div>
                    <div className="flex-1 text-center font-bold text-slate-400">-</div>
                </div>
            </div>

            {/* Botones estilo foto */}
            <div className="flex p-2 gap-2 mt-auto bg-slate-100 border-t border-slate-300">
                <div className="flex-1 bg-green-600 text-white text-[10px] font-bold py-2 rounded text-center shadow cursor-pointer hover:bg-green-500">
                    REGISTRAR<br/>EVENTO
                </div>
                <div className="flex-1 bg-amber-500 text-white text-[10px] font-bold py-2 rounded text-center shadow cursor-pointer hover:bg-amber-400">
                    INFORME<br/>EJECUTIVO
                </div>
            </div>
        </div>
    )
}

// 4. PORTERÍA RESPONSIVE
const PorteriaResponsive = ({ events }: { events: Event[] }) => {
  const shots = events.filter((e) => {
    if (!e.goalZone) return false
    // Mostramos todos los tiros a portería (de ambos equipos)
    return ["GOL", "PARADA", "GOL ENCAJADO", "BLOCADO"].includes(e.action)
  })

  // Agrupar por zona
  const getZoneStats = (zone: number) => {
    const zoneShots = shots.filter((s) => s.goalZone === zone)
    const count = zoneShots.length
    const goals = zoneShots.filter((s) => s.action.includes("GOL")).length
    const saves = zoneShots.filter((s) => s.action === "PARADA" || s.action === "BLOCADO").length
    // Porcentaje de efectividad del lanzador (Goles / Tiros Totales)
    const goalPct = count > 0 ? Math.round((goals / count) * 100) : 0
    return { count, goals, saves, goalPct }
  }

  const zones = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="w-full h-full flex flex-col bg-slate-800/80 rounded-lg p-2 border border-slate-700">
      <div className="text-[10px] text-slate-400 mb-2 text-center font-bold uppercase tracking-widest">
        Mapa de Calor de Tiros
      </div>
      <div className="flex-1 grid grid-cols-3 gap-1 min-h-0">
        {zones.map((z) => {
          const stats = getZoneStats(z)
          // Opacidad basada en volumen de tiros
          const intensity = shots.length > 0 ? Math.min((stats.count / shots.length) * 3, 1) : 0
          
          return (
            <div
              key={z}
              className="relative rounded border border-slate-600/50 flex flex-col items-center justify-center"
              style={{ backgroundColor: `rgba(59, 130, 246, ${intensity * 0.6})` }}
            >
              <span className="absolute top-1 left-1 text-[8px] text-slate-500">#{z}</span>
              <div className="text-center z-10">
                <span className="text-xl font-bold text-white">{stats.goalPct}%</span>
                <div className="text-[8px] text-slate-300">
                    {stats.goals}G / {stats.saves}P
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 5. WIZARD DE ACCIÓN
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
  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 h-full flex flex-col relative overflow-hidden shadow-2xl">
    
    {/* SELECCIÓN DE ACCIÓN */}
    {wizardState === "ACTION_SELECTION" && (
      <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-150 min-h-0">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleBack} className="text-slate-400 hover:text-white -ml-2 hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
          </Button>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Jugador</span>
            <span className="font-black text-white text-xl italic">
              #{activePlayer?.player}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 flex-1 content-start overflow-y-auto pb-4 custom-scrollbar">
           {!isGoalkeeper ? (
             <>
               <Button className="h-20 text-xl font-black bg-green-600 hover:bg-green-500 text-white shadow-lg col-span-2 border-b-4 border-green-800 active:translate-y-1 active:border-0" onClick={() => handleActionSelect("GOL")}>GOL</Button>
               <Button className="h-16 text-lg font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg border-b-4 border-blue-800 active:translate-y-1 active:border-0" onClick={() => handleActionSelect("PARADA")}>PARADA (Rival)</Button>
               <Button className="h-16 text-lg font-black bg-amber-600 hover:bg-amber-500 text-white shadow-lg border-b-4 border-amber-800 active:translate-y-1 active:border-0" onClick={() => handleActionSelect("FUERA")}>FUERA</Button>
               <Button className="h-14 font-bold bg-red-600 hover:bg-red-500 text-white col-span-2 border-b-4 border-red-800" onClick={() => handleActionSelect("PÉRDIDA")}>PÉRDIDA / ERROR</Button>
             </>
           ) : (
             <Button className="h-24 text-2xl font-black bg-blue-600 hover:bg-blue-500 text-white col-span-2" onClick={() => handleActionSelect("PARADA")}>PARADA</Button>
           )}
        </div>
      </div>
    )}

    {/* DETALLES DE LA ACCIÓN */}
    {wizardState === "DETAILS" && (
      <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-4 duration-200 min-h-0">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-700 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2 text-slate-400 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-green-400 font-black tracking-wider text-xl italic">{currentAction}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pb-20 custom-scrollbar pr-2">
          
          {/* ZONA DE PISTA */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Zona Lanzamiento</div>
            <div className="grid grid-cols-3 gap-1">
              {COURT_ZONES.map((z) => (
                <Button
                  key={z}
                  size="sm"
                  className={`h-8 text-[8px] font-bold leading-tight border transition-all ${
                    selectedCourtZone === z 
                    ? "bg-blue-600 text-white border-blue-400" 
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                  onClick={() => setSelectedCourtZone(z)}
                >
                  {z}
                </Button>
              ))}
            </div>
          </div>

          {/* PORTERÍA (VISUAL) PARA SELECCIÓN */}
          {["GOL", "PARADA", "FUERA", "POSTE", "BLOCADO", "GOL ENCAJADO"].includes(currentAction || "") && (
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest text-center">
                Zona Portería
              </div>
              <div className="aspect-square max-w-[140px] mx-auto grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 shadow-inner">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((z) => (
                  <Button
                    key={z}
                    variant="ghost"
                    className={`h-full w-full text-lg font-black rounded transition-all ${
                      selectedGoalZone === z 
                      ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.6)] scale-110 z-10" 
                      : "bg-slate-800 text-slate-600 hover:bg-slate-700 hover:text-slate-300"
                    }`}
                    onClick={() => setSelectedGoalZone(z)}
                  >
                    {z}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent">
          <Button
            size="lg"
            className="w-full h-12 bg-green-600 hover:bg-green-500 text-white shadow-2xl font-black tracking-widest text-lg italic uppercase border-t border-green-400/30"
            onClick={() => confirmEvent()}
          >
            CONFIRMAR
          </Button>
        </div>
      </div>
    )}
  </div>
)

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
    // Si selecciono local, deselecciono visitante y viceversa
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

    setEvents((prev) => [event, ...prev]) // Añadir al principio para feed
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
    // Implementación simple
    setSelectedContext((prev) => (prev.includes(ctx) ? prev.filter((c) => c !== ctx) : [...prev, ctx]))
  }

  const handleUndo = () => {
    if (events.length === 0) return
    const firstEvent = events[0] // Como añadimos al ppio, el último es el 0
    if (firstEvent.action === "GOL") {
      if (firstEvent.team === "A") setLocalScore((prev) => Math.max(0, prev - 1))
      else setVisitorScore((prev) => Math.max(0, prev - 1))
    }
    setEvents((prev) => prev.slice(1))
  }

  const exportData = () => {
    alert("Exportar CSV simulado")
  }

  // --- RENDERIZADO PRINCIPAL ---

  if (appState === "SETUP") {
    // (Código de setup igual que antes, resumido para brevedad en esta respuesta específica)
    // Asumimos que el usuario lo tiene. Si lo necesitas completo dimelo.
    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 flex items-center justify-center">
             <div className="max-w-2xl w-full text-center space-y-6">
                <h1 className="text-3xl font-bold">Configuración</h1>
                <p>Configura los equipos (Simplificado para esta vista)</p>
                <Button size="lg" onClick={() => setAppState("MATCH")} className="bg-green-600">INICIAR</Button>
             </div>
        </div>
    )
  }

  // LAYOUT DEL PARTIDO (MATCH)
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden box-border font-sans">
      
      {/* HEADER */}
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
        <div className="grid grid-cols-[30%_1fr_30%] gap-4 h-full w-full max-w-[1920px] mx-auto min-h-0">
          
          {/* === COLUMNA 1: IZQUIERDA (VISITANTE + LIVE FEED) === */}
          <div className="flex flex-col gap-4 h-full overflow-hidden min-h-0 relative">
            
            {/* MITAD SUPERIOR: Grid Visitante (O Wizard si Visitante seleccionado) */}
            <div className="h-1/2 min-h-0 flex flex-col relative">
                {selectedPlayerB ? (
                     <div className="h-full animate-in slide-in-from-left-4 duration-300">
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
                ) : (
                    <PlayerGrid
                        team="B" // Equipo B (Visitante)
                        players={teamBPlayers}
                        selectedPlayerA={selectedPlayerA}
                        selectedPlayerB={selectedPlayerB}
                        handlePlayerSelect={handlePlayerSelect}
                        teamName={teamBName}
                    />
                )}
            </div>

            {/* MITAD INFERIOR: Live Feed (Historial) */}
            <div className="h-1/2 min-h-0 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-400">Live Feed</span>
                    <History className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 overflow-hidden">
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

          {/* === COLUMNA 2: CENTRO (STATS TABLE + PORTERÍA) === */}
          <div className="flex flex-col gap-4 h-full overflow-hidden min-h-0">
            
            {/* PARTE SUPERIOR: Tabla de Estadísticas (Foto) */}
            <div className="h-1/2 min-h-0">
                <StatsTable events={events} teamAName={teamAName} teamBName={teamBName} />
            </div>

            {/* PARTE INFERIOR: Portería */}
            <div className="h-1/2 min-h-0 relative">
                 <PorteriaResponsive events={events} />
                 
                 {/* Botón flotante para expandir portería si se quiere ver grande */}
                 <div className="absolute top-2 right-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white bg-black/20 rounded-full">
                          <Maximize2 className="w-3 h-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 p-6 h-[80vh]">
                          <PorteriaResponsive events={events} />
                      </DialogContent>
                    </Dialog>
                 </div>
            </div>

          </div>

          {/* === COLUMNA 3: DERECHA (LOCAL) === */}
          <div className="flex flex-col gap-4 h-full overflow-hidden min-h-0 relative">
             {selectedPlayerA ? (
                     <div className="h-full animate-in slide-in-from-right-4 duration-300">
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
                ) : (
                    <PlayerGrid
                        team="A" // Equipo A (Local)
                        players={teamAPlayers}
                        selectedPlayerA={selectedPlayerA}
                        selectedPlayerB={selectedPlayerB}
                        handlePlayerSelect={handlePlayerSelect}
                        teamName={teamAName}
                    />
                )}
          </div>

        </div>
      </div>
    </div>
  )
}

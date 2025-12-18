"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pause,
  Play,
  ArrowLeft,
  Trophy,
  History,
  Settings,
  Edit3,
  Target,
  Shield,
  Maximize2,
  Filter,
  CheckCircle2,
  Trash2,
  Plus,
  Undo2,
  Download,
} from "lucide-react"

// --- TIPOS DE DATOS ---

type Player = {
  number: number
  name: string
  isGoalkeeper: boolean
  position?: "Portero" | "Extremo Izq" | "Extremo Der" | "Lateral Izq" | "Lateral Der" | "Central" | "Pivote"
  hand?: "Diestro" | "Zurdo"
}

type DefenseType = "6:0" | "5:1" | "3:2:1" | "4:2" | "Mixta" | "Presión" | "Otro"

type Event = {
  id: string
  timestamp: number
  timeFormatted: string
  player: number
  team: "A" | "B"
  action: string
  courtZone?: string
  goalZone?: number
  defenseAtMoment?: DefenseType
  context?: string[]
}

type WizardState = "IDLE" | "ACTION_SELECTION" | "DETAILS"
type AppState = "SETUP" | "MATCH"

// --- CONSTANTES ---

const COURT_ZONES = ["Extremo Izq", "Lateral Izq", "Central", "Lateral Der", "Extremo Der", "Pivote", "9m"]
const GOAL_ZONES = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const DEFENSE_TYPES: DefenseType[] = ["6:0", "5:1", "3:2:1", "4:2", "Mixta", "Presión", "Otro"]
const CONTEXTS = ["Igualdad", "Superioridad", "Inferioridad", "Contraataque"]
const POSITIONS = ["Portero", "Extremo Izq", "Extremo Der", "Lateral Izq", "Lateral Der", "Central", "Pivote"]
const HANDS = ["Diestro", "Zurdo"]

// --- COMPONENTES AUXILIARES ---

// 1. LIVE FEED / HISTORIAL (Ahora integrado para asegurar visibilidad de botones)
const LiveFeedPanel = ({ events, onUndo, onExport }: { events: Event[]; onUndo: () => void; onExport: () => void }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      {/* Cabecera con Botones Visibles */}
      <div className="bg-slate-950/80 px-3 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
          <History className="w-3 h-3" /> Live Feed
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            className="h-6 w-6 text-slate-400 hover:text-red-400 hover:bg-slate-800"
            title="Deshacer último"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onExport}
            className="h-6 w-6 text-slate-400 hover:text-green-400 hover:bg-slate-800"
            title="Exportar CSV"
          >
            <Download className="w-4 h-4" />
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
                key={e.id}
                className={`flex items-center gap-2 px-3 py-2 border-b border-slate-800/50 text-xs ${i === 0 ? "bg-slate-800/30" : ""}`}
              >
                <span className="font-mono text-slate-500 text-[10px] w-8">{e.timeFormatted}</span>
                <div className={`w-1 h-8 rounded-full ${e.team === "A" ? "bg-blue-500" : "bg-amber-500"}`}></div>
                <div className="flex-1">
                  <div className="font-bold text-slate-200">
                    {e.action} <span className="font-normal text-slate-400">#{e.player}</span>
                  </div>
                  {e.context && e.context.length > 0 && (
                    <div className="text-[9px] text-slate-500 mt-0.5">{e.context.join(", ")}</div>
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

// 2. HEADER MARCADOR
const HeaderScoreboard = ({
  localScore,
  visitorScore,
  teamAName,
  teamBName,
  time,
  isRunning,
  setIsRunning,
  formatTime,
  defenseA,
  defenseB,
}: any) => (
  <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center justify-between shadow-md shrink-0 z-30 relative h-20 box-border">
    {/* Equipo Local (A) - Izquierda */}
    <div className="flex flex-col items-start min-w-[150px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-blue-400 font-bold tracking-wider">LOCAL (A)</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-white leading-none tabular-nums">{localScore}</span>
        <span className="text-sm text-slate-400 truncate max-w-[160px]">{teamAName}</span>
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
        className={`mt-1 h-6 text-xs uppercase tracking-widest font-bold ${isRunning ? "text-red-400 hover:bg-red-950/30" : "text-green-400 hover:bg-green-950/30"}`}
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

    {/* Equipo Visitante (B) - Derecha */}
    <div className="flex flex-col items-end min-w-[150px]">
      <div className="flex items-center gap-2 mb-1 flex-row-reverse">
        <span className="text-xs text-amber-400 font-bold tracking-wider">VISITANTE (B)</span>
      </div>
      <div className="flex items-baseline gap-3 flex-row-reverse">
        <span className="text-3xl font-bold text-white leading-none tabular-nums">{visitorScore}</span>
        <span className="text-sm text-slate-400 truncate max-w-[160px]">{teamBName}</span>
      </div>
    </div>
  </div>
)

// 3. GRID JUGADORES
const PlayerGrid = ({ team, players, selectedPlayerA, selectedPlayerB, handlePlayerSelect, teamName }: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 h-full flex flex-col min-h-0 shadow-sm">
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
            className={`h-12 sm:h-14 flex flex-col justify-center border-slate-700 relative transition-all duration-75 active:scale-95 ${isSelected ? (team === "A" ? "bg-blue-600 border-blue-500 text-white" : "bg-amber-600 border-amber-500 text-white") : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"}`}
            onClick={() => handlePlayerSelect(team, player.number)}
          >
            <span className="text-lg font-bold leading-none">#{player.number}</span>
            {player.isGoalkeeper && (
              <span className="absolute -top-1 -right-1 text-[8px] bg-slate-950 text-slate-400 px-1 rounded border border-slate-700">
                GK
              </span>
            )}
          </Button>
        )
      })}
    </div>
  </div>
)

// 4. TABLA ESTADÍSTICAS (SIN BOTONES ABAJO)
const StatsTable = ({ events, teamAName, teamBName }: { events: Event[]; teamAName: string; teamBName: string }) => {
  const stats = useMemo(() => {
    const calculate = (team: "A" | "B") => ({
      goals: events.filter((e) => e.team === team && e.action.startsWith("GOL")).length,
      shots: events.filter(
        (e) =>
          e.team === team &&
          (e.action.startsWith("GOL") || e.action === "PARADA" || e.action === "FUERA" || e.action === "POSTE"),
      ).length,
      saves: events.filter((e) => e.team === team && e.action === "PARADA").length,
      turnovers: events.filter((e) => e.team === team && e.action === "PÉRDIDA").length,
      possessions: events.filter((e) => e.team === team && e.action === "POSSESSION").length, // Añadido contador de posesiones
      goals7m: events.filter((e) => e.team === team && e.action === "GOL 7M").length,
      goalsSup: events.filter(
        (e) => e.team === team && e.action.startsWith("GOL") && e.context?.includes("Superioridad"),
      ).length,
      goalsInf: events.filter(
        (e) => e.team === team && e.action.startsWith("GOL") && e.context?.includes("Inferioridad"),
      ).length,
      goalsEq: events.filter(
        (e) =>
          e.team === team &&
          e.action.startsWith("GOL") &&
          (e.context?.includes("Igualdad") || !e.context || e.context.length === 0),
      ).length,
    })
    return { A: calculate("A"), B: calculate("B") }
  }, [events])

  const effA = stats.A.shots > 0 ? Math.round((stats.A.goals / stats.A.shots) * 100) : 0
  const effB = stats.B.shots > 0 ? Math.round((stats.B.goals / stats.B.shots) * 100) : 0

  const StatRow = ({ label, valA, valB, highlight = false }: any) => (
    <div
      className={`flex items-center text-xs py-2 border-b border-slate-300/40 hover:bg-slate-50 ${highlight ? "bg-slate-100 font-bold" : ""}`}
    >
      <div className={`flex-1 text-center font-bold ${highlight ? "text-blue-700" : "text-slate-700"}`}>{valA}</div>
      <div className="w-36 text-center text-slate-500 uppercase text-sm font-black tracking-wider">{label}</div>
      <div className={`flex-1 text-center font-bold ${highlight ? "text-amber-700" : "text-slate-700"}`}>{valB}</div>
    </div>
  )

  return (
    <div className="bg-white text-slate-900 rounded-lg overflow-hidden flex flex-col h-full shadow-lg text-sm border border-slate-300">
      <div className="bg-green-600 text-white text-center py-2 font-bold uppercase tracking-widest text-[11px]">
        Estadísticas en Tiempo Real
      </div>

      <div className="flex border-b border-slate-300 bg-slate-100 font-bold text-xs py-2">
        <div className="flex-1 text-center text-blue-700 truncate px-1">{teamAName}</div>
        <div className="flex-1 text-center text-amber-700 truncate px-1">{teamBName}</div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-50/50">
        <StatRow label="Efectividad Tiro" valA={`${effA}%`} valB={`${effB}%`} highlight />
        <StatRow label="Paradas" valA={stats.A.saves} valB={stats.B.saves} />
        <StatRow label="Pérdidas" valA={stats.A.turnovers} valB={stats.B.turnovers} />
        <StatRow label="Posesiones" valA={stats.A.possessions} valB={stats.B.possessions} />
        <StatRow label="Goles 7m" valA={`${stats.A.goals7m}`} valB={`${stats.B.goals7m}`} />
        <div className="my-1 border-t border-slate-200"></div>
        <StatRow label="Goles Superioridad" valA={stats.A.goalsSup} valB={stats.B.goalsSup} />
        <StatRow label="Goles Inferioridad" valA={stats.A.goalsInf} valB={stats.B.goalsInf} />
        <StatRow label="Goles Igualdad" valA={stats.A.goalsEq} valB={stats.B.goalsEq} />
      </div>

      {/* BOTONES ELIMINADOS DE AQUÍ SEGÚN PETICIÓN */}
    </div>
  )
}

// 5. PORTERÍA AVANZADA
const PorteriaAdvanced = ({ events }: { events: Event[] }) => {
  const [filter, setFilter] = useState<"ALL" | "WING" | "7M">("ALL")

  const relevantShots = useMemo(() => {
    return events.filter((e) => {
      if (e.team !== "B") return false // Solo Visitante
      if (!e.goalZone) return false
      const isShot = ["GOL", "GOL 7M", "PARADA", "BLOCADO"].some((act) => e.action.startsWith(act))
      if (!isShot) return false
      if (filter === "WING" && !e.courtZone?.includes("Extremo")) return false
      if (filter === "7M" && !e.action.includes("7M")) return false
      return true
    })
  }, [events, filter])

  const heatmapScale = useMemo(() => {
    const goalsPerZone = GOAL_ZONES.map(
      (z) => relevantShots.filter((s) => s.goalZone === z && s.action.startsWith("GOL")).length,
    )
    const maxGoals = Math.max(...goalsPerZone, 1)
    return { goalsPerZone, maxGoals }
  }, [relevantShots])

  const getHeatmapColor = (zoneIndex: number) => {
    const goals = heatmapScale.goalsPerZone[zoneIndex]
    const intensity = goals / heatmapScale.maxGoals
    if (goals === 0) return "rgba(30, 41, 59, 0.5)"
    return `rgba(220, 38, 38, ${0.3 + intensity * 0.5})`
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-sm">
      <div className="flex p-1 bg-slate-950 border-b border-slate-800 gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter("ALL")}
          className={`flex-1 text-[9px] h-7 font-bold uppercase ${filter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400"}`}
        >
          Todos
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter("WING")}
          className={`flex-1 text-[9px] h-7 font-bold uppercase ${filter === "WING" ? "bg-slate-800 text-white" : "text-slate-400"}`}
        >
          Extremos
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter("7M")}
          className={`flex-1 text-[9px] h-7 font-bold uppercase ${filter === "7M" ? "bg-slate-800 text-white" : "text-slate-400"}`}
        >
          7m
        </Button>
      </div>

      <div className="text-[10px] text-amber-400 py-1 text-center font-bold uppercase tracking-widest shrink-0 flex items-center justify-center gap-2">
        <Target className="w-3 h-3" /> Tiros Visitantes {filter !== "ALL" && `(${filter})`}
      </div>

      <div className="flex-1 grid grid-cols-3 gap-0.5 p-1 min-h-0 relative">
        <div className="absolute inset-y-1 left-0 w-1 bg-slate-600 rounded-l pointer-events-none"></div>
        <div className="absolute inset-y-1 right-0 w-1 bg-slate-600 rounded-r pointer-events-none"></div>
        <div className="absolute inset-x-1 top-0 h-1 bg-slate-600 rounded-t pointer-events-none"></div>

        {GOAL_ZONES.map((z, index) => {
          const shotsInZone = relevantShots.filter((s) => s.goalZone === z)
          return (
            <div
              key={z}
              className="relative rounded-sm border border-white/10 flex flex-wrap content-center justify-center items-center gap-0.5 p-0.5 overflow-hidden transition-colors duration-300"
              style={{ backgroundColor: getHeatmapColor(index) }}
            >
              <span className="absolute top-0.5 left-0.5 text-[7px] text-slate-500/50 pointer-events-none">{z}</span>

              {shotsInZone.slice(0, 9).map((shot) => {
                const isGoal = shot.action.startsWith("GOL")
                return (
                  <div
                    key={shot.id}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border ${isGoal ? "bg-green-500 text-black border-green-300 shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "bg-red-500 text-white border-red-300"} `}
                    title={`${shot.action} - Jugador ${shot.player}`}
                  >
                    {shot.player}
                  </div>
                )
              })}
              {shotsInZone.length > 9 && (
                <span className="text-[8px] font-bold text-white">+{shotsInZone.length - 9}</span>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-center gap-4 pb-1 text-[8px] text-slate-400 shrink-0 bg-slate-950/50">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div> Gol (Vis)
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div> Fallo/Parada
        </div>
      </div>
    </div>
  )
}

// 6. WIZARD ACCIÓN
const ActionWizard = ({
  wizardState,
  activePlayer,
  isGoalkeeper,
  handleBack,
  currentAction,
  handleActionSelect,
  selectedContext,
  toggleContext,
  confirmEvent,
  selectedCourtZone,
  setSelectedCourtZone,
  selectedGoalZone,
  setSelectedGoalZone,
  selectedDefense,
  setSelectedDefense,
}: any) => (
  <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 h-full flex flex-col relative overflow-hidden shadow-2xl min-h-0">
    <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700 shrink-0 min-h-[40px]">
      <Button variant="ghost" onClick={handleBack} className="text-slate-400 hover:text-white p-2 -ml-2">
        <ArrowLeft className="w-6 h-6" /> <span className="sr-only">Atrás</span>
      </Button>

      <div className="flex-1 text-right">
        {wizardState === "ACTION_SELECTION" && (
          <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-2">Selecciona Acción</span>
        )}
        {wizardState === "DETAILS" && (
          <span className="text-sm text-green-400 font-black uppercase italic tracking-wider">{currentAction}</span>
        )}
      </div>
      <div className="flex flex-col items-end ml-2 border-l border-slate-700 pl-2">
        <span className="text-[9px] text-slate-500 uppercase font-bold">Jugador</span>
        <span className="font-black text-white text-lg leading-none">#{activePlayer?.player}</span>
      </div>
    </div>

    {wizardState === "ACTION_SELECTION" && (
      <div className="flex-1 grid grid-cols-2 gap-2 content-start overflow-y-auto custom-scrollbar p-1 animate-in fade-in zoom-in-95">
        {!isGoalkeeper ? (
          <>
            <Button
              className="h-16 text-xl font-black bg-green-600 hover:bg-green-500 col-span-2 border-b-4 border-green-800 active:border-0 active:translate-y-1 transition-all"
              onClick={() => handleActionSelect("GOL")}
            >
              GOL
            </Button>
            <Button
              className="h-12 text-sm font-bold bg-green-700 hover:bg-green-600 border-b-4 border-green-900 active:border-0 active:translate-y-1 transition-all"
              onClick={() => handleActionSelect("GOL 7M")}
            >
              GOL 7m
            </Button>
            <Button
              className="h-12 text-sm font-bold bg-red-700 hover:bg-red-600 border-b-4 border-red-900 active:border-0 active:translate-y-1 transition-all"
              onClick={() => handleActionSelect("FALLO 7M")}
            >
              FALLO 7m
            </Button>
            <Button
              className="h-14 text-base font-black bg-blue-600 hover:bg-blue-500 border-b-4 border-blue-800 active:border-0 active:translate-y-1 transition-all"
              onClick={() => handleActionSelect("PARADA")}
            >
              PARADA (Rival)
            </Button>
            <Button
              className="h-14 text-base font-black bg-amber-600 hover:bg-amber-500 border-b-4 border-amber-800 active:border-0 active:translate-y-1 transition-all"
              onClick={() => handleActionSelect("FUERA")}
            >
              FUERA / POSTE
            </Button>
            <Button
              className="h-12 text-sm font-bold bg-red-600 hover:bg-red-500 col-span-2 border-b-4 border-red-800 active:border-0 active:translate-y-1 transition-all"
              onClick={() => handleActionSelect("PÉRDIDA")}
            >
              PÉRDIDA / ERROR
            </Button>
            <Button
              variant="outline"
              className="h-10 text-xs border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 col-span-2 bg-transparent"
              onClick={() => handleActionSelect("ASISTENCIA")}
            >
              Asistencia / Otro
            </Button>
          </>
        ) : (
          <Button
            className="h-24 text-3xl font-black bg-blue-600 hover:bg-blue-500 col-span-2 border-b-4 border-blue-800"
            onClick={() => handleActionSelect("PARADA")}
          >
            PARADA
          </Button>
        )}
      </div>
    )}

    {wizardState === "DETAILS" && (
      <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-10 overflow-hidden pb-14">
        <div className="flex-1 overflow-y-auto space-y-3 p-1 custom-scrollbar">
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-3 h-3" /> Defensa Rival (Momento)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEFENSE_TYPES.map((dt) => (
                <Button
                  key={dt}
                  size="sm"
                  variant="outline"
                  className={`h-7 text-[9px] uppercase font-bold px-2 transition-all ${selectedDefense === dt ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"}`}
                  onClick={() => setSelectedDefense(dt)}
                >
                  {dt}
                </Button>
              ))}
            </div>
          </div>

          {currentAction.startsWith("GOL") && (
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50">
              <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                <Filter className="w-3 h-3" /> Contexto Táctico
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["Igualdad", "Superioridad"].map((ctx) => {
                  const isActive = selectedContext.includes(ctx)
                  return (
                    <Button
                      key={ctx}
                      size="sm"
                      variant="outline"
                      className={`h-8 text-[10px] uppercase font-bold px-2 transition-all ${isActive ? "bg-slate-100 text-slate-900 border-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"}`}
                      onClick={() => toggleContext(ctx)}
                    >
                      {ctx}
                    </Button>
                  )
                })}
                {["Inferioridad", "Contraataque"].map((ctx) => {
                  const isActive = selectedContext.includes(ctx)
                  return (
                    <Button
                      key={ctx}
                      size="sm"
                      variant="outline"
                      className={`h-8 text-[10px] uppercase font-bold px-2 transition-all ${isActive ? "bg-slate-100 text-slate-900 border-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"}`}
                      onClick={() => toggleContext(ctx)}
                    >
                      {ctx}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {!currentAction.includes("7M") && ["GOL", "PARADA", "FUERA", "PÉRDIDA"].includes(currentAction) && (
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50">
              <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Zona Origen</div>
              <div className="grid grid-cols-3 gap-1">
                {COURT_ZONES.map((z) => (
                  <Button
                    key={z}
                    size="sm"
                    className={`h-7 text-[8px] font-bold leading-tight border transition-all ${selectedCourtZone === z ? "bg-blue-600 text-white border-blue-400 shadow-sm" : "bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700"}`}
                    onClick={() => setSelectedCourtZone(z)}
                  >
                    {z}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {(currentAction.startsWith("GOL") || ["PARADA", "FUERA", "FALLO 7M"].includes(currentAction)) && (
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50 flex flex-col items-center">
              <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                Zona Definición
              </div>
              <div className="aspect-square w-full max-w-[120px] grid grid-cols-3 gap-0.5 bg-slate-800 p-0.5 rounded border border-slate-700 shadow-inner">
                {GOAL_ZONES.map((z) => (
                  <Button
                    key={z}
                    variant="ghost"
                    className={`h-full w-full text-base font-black rounded-sm transition-all p-0 ${selectedGoalZone === z ? (currentAction.startsWith("GOL") ? "bg-green-500 text-black shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]" : "bg-red-500 text-white") : "bg-slate-700/50 text-slate-500 hover:bg-slate-600 hover:text-slate-200"}`}
                    onClick={() => setSelectedGoalZone(z)}
                  >
                    {z}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
          <Button
            size="lg"
            className="w-full h-11 bg-green-600 hover:bg-green-500 text-white shadow-xl font-black tracking-[0.15em] text-base uppercase border-t border-green-400/20 transition-transform active:scale-[0.98]"
            onClick={confirmEvent}
          >
            CONFIRMAR <CheckCircle2 className="w-5 h-5 ml-2 animate-pulse" />
          </Button>
        </div>
      </div>
    )}
  </div>
)

// --- MAIN COMPONENT ---
export default function MatchView() {
  const [appState, setAppState] = useState<AppState>("SETUP")

  const [teamAName, setTeamAName] = useState("Local A")
  const [teamBName, setTeamBName] = useState("Visitante B")
  const [defenseA, setDefenseA] = useState<DefenseType>("6:0")
  const [defenseB, setDefenseB] = useState<DefenseType>("6:0")
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>(
    Array.from({ length: 16 }, (_, i) => ({
      number: i + 1,
      name: `Jugador A${i + 1}`,
      isGoalkeeper: i === 0 || i === 12,
      position: undefined,
      hand: undefined,
    })),
  )
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>(
    Array.from({ length: 16 }, (_, i) => ({
      number: i + 1,
      name: `Jugador B${i + 1}`,
      isGoalkeeper: i === 0 || i === 12,
      position: undefined,
      hand: undefined,
    })),
  )

  const [localScore, setLocalScore] = useState(0)
  const [visitorScore, setVisitorScore] = useState(0)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [events, setEvents] = useState<Event[]>([])

  const [initialPossession, setInitialPossession] = useState<"A" | "B" | null>(null)
  const [currentPossession, setCurrentPossession] = useState<"A" | "B" | null>(null)
  const [possessionCountA, setPossessionCountA] = useState(0)
  const [possessionCountB, setPossessionCountB] = useState(0)

  const [selectedPlayerA, setSelectedPlayerA] = useState<number | null>(null)
  const [selectedPlayerB, setSelectedPlayerB] = useState<number | null>(null)
  const [wizardState, setWizardState] = useState<WizardState>("IDLE")
  const [currentAction, setCurrentAction] = useState<string | null>(null)

  const [selectedCourtZone, setSelectedCourtZone] = useState<string | null>(null)
  const [selectedGoalZone, setSelectedGoalZone] = useState<number | null>(null)
  const [selectedContext, setSelectedContext] = useState<string[]>([])
  const [selectedDefense, setSelectedDefense] = useState<DefenseType | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) interval = setInterval(() => setTime((prev) => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")
    const secs = (seconds % 60).toString().padStart(2, "0")
    return `${mins}:${secs}`
  }

  const getActivePlayerInfo = () => {
    if (selectedPlayerA)
      return {
        team: "A" as const,
        player: selectedPlayerA,
        isGK: teamAPlayers.find((p) => p.number === selectedPlayerA)?.isGoalkeeper,
      }
    if (selectedPlayerB)
      return {
        team: "B" as const,
        player: selectedPlayerB,
        isGK: teamBPlayers.find((p) => p.number === selectedPlayerB)?.isGoalkeeper,
      }
    return null
  }

  const handlePlayerSelect = (team: "A" | "B", number: number) => {
    if (team === "A") {
      setSelectedPlayerA(number)
      setSelectedPlayerB(null)
    } else {
      setSelectedPlayerB(number)
      setSelectedPlayerA(null)
    }
    setWizardState("ACTION_SELECTION")
    const activeTeam = team
    const defaultRivalDefense = activeTeam === "A" ? defenseB : defenseA
    resetWizard(defaultRivalDefense)
  }

  const handleActionSelect = (action: string) => {
    setCurrentAction(action)
    if (action.includes("GOL") || action.includes("PARADA") || action === "FUERA" || action === "PÉRDIDA") {
      setWizardState("DETAILS")
    } else {
      confirmEvent(action)
    }
  }

  const toggleContext = (ctx: string) => {
    setSelectedContext((prev) => (prev.includes(ctx) ? prev.filter((c) => c !== ctx) : [...prev, ctx]))
  }

  const handlePossessionChange = (action: string, team: "A" | "B") => {
    // Only change possession if the event is significant
    const significantActions = ["GOL", "PÉRDIDA", "PARADA", "INTERCEPTADA", "BALÓN ROBADO", "POSSESSION"] // Added more possession-changing actions

    if (!significantActions.includes(action)) {
      return
    }

    let nextPossessionTeam: "A" | "B" | null = null

    if (action === "GOL") {
      nextPossessionTeam = team // The team that scored keeps/gets possession
    } else if (action === "PÉRDIDA" || action === "INTERCEPTADA" || action === "BALÓN ROBADO") {
      nextPossessionTeam = team === "A" ? "B" : "A" // Possession changes to the other team
    } else if (action === "PARADA") {
      nextPossessionTeam = team === "A" ? "B" : "A" // Goalkeeper save results in possession for the other team
    } else if (action === "POSSESSION") {
      // Explicit possession change event - can be used for kick-offs etc.
      nextPossessionTeam = team // The team indicated in the event gets possession
    }

    if (nextPossessionTeam && nextPossessionTeam !== currentPossession) {
      setCurrentPossession(nextPossessionTeam)
      if (nextPossessionTeam === "A") setPossessionCountA((prev) => prev + 1)
      else setPossessionCountB((prev) => prev + 1)
    }
  }

  const confirmEvent = (fastAction?: string) => {
    const info = getActivePlayerInfo()
    const action = fastAction || currentAction
    if (!info || !action) return

    handlePossessionChange(action, info.team)

    const newEvent: Event = {
      id: Date.now().toString(),
      timestamp: time,
      timeFormatted: formatTime(time),
      player: info.player,
      team: info.team,
      action: action,
      courtZone: selectedCourtZone || undefined,
      goalZone: selectedGoalZone || undefined,
      context: selectedContext.length > 0 ? selectedContext : undefined,
      defenseAtMoment: selectedDefense || (info.team === "A" ? defenseB : defenseA),
    }

    setEvents((prev) => [newEvent, ...prev])
    if (action.startsWith("GOL")) {
      info.team === "A" ? setLocalScore((s) => s + 1) : setVisitorScore((s) => s + 1)
    }

    resetUI()
  }

  const resetWizard = (defaultDef?: DefenseType) => {
    setCurrentAction(null)
    setSelectedCourtZone(null)
    setSelectedGoalZone(null)
    setSelectedContext([])
    if (defaultDef) setSelectedDefense(defaultDef)
  }
  const resetUI = () => {
    setWizardState("IDLE")
    setSelectedPlayerA(null)
    setSelectedPlayerB(null)
    resetWizard()
  }
  const handleBack = () => {
    wizardState === "DETAILS" ? setWizardState("ACTION_SELECTION") : resetUI()
  }
  const handleUndo = () => {
    if (events.length === 0) return
    const last = events[0]
    // Undo should also revert possession changes
    if (["GOL", "PÉRDIDA", "PARADA", "INTERCEPTADA", "BALÓN ROBADO", "POSSESSION"].includes(last.action)) {
      // This is a simplification. A more robust undo would track the previous possession state.
      // For now, we'll just remove the event and not try to precisely revert possession.
      // A full implementation would require storing past possession states.
    }
    if (last.action.startsWith("GOL")) last.team === "A" ? setLocalScore((s) => s - 1) : setVisitorScore((s) => s - 1)
    setEvents((prev) => prev.slice(1))
  }

  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Time,Team,Player,Action,Defense,Context\n" +
      events
        .map((e) => `${e.timeFormatted},${e.team},${e.player},${e.action},${e.defenseAtMoment},${e.context?.join("|")}`)
        .join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "partido_handball.csv")
    document.body.appendChild(link)
    link.click()
  }

  // --- SETUP COLUMN ---
  if (appState === "SETUP") {
    const SetupTeamColumn = ({ team, name, setName, defense, setDefense, players, setPlayers, color }: any) => {
      const [editingId, setEditingId] = useState<number | null>(null)
      const [editData, setEditData] = useState<Player>({
        number: 0,
        name: "",
        isGoalkeeper: false,
        position: undefined,
        hand: undefined,
      })

      const startEdit = (player: Player) => {
        setEditingId(player.number)
        setEditData(player)
      }
      const saveEdit = () => {
        setPlayers(players.map((p: Player) => (p.number === editingId ? editData : p)))
        setEditingId(null)
      }

      const deletePlayer = (number: number) => {
        setPlayers(players.filter((p: Player) => p.number !== number))
      }

      const addPlayer = () => {
        if (players.length >= 16) return
        const maxNum = players.length > 0 ? Math.max(...players.map((p: Player) => p.number)) : 0
        const newP = {
          number: maxNum + 1,
          name: "Nuevo Jugador",
          isGoalkeeper: false,
          position: undefined,
          hand: undefined,
        }
        setPlayers([...players, newP])
      }

      return (
        <div
          className={`flex-1 bg-slate-900/50 p-4 rounded-xl border ${color === "blue" ? "border-blue-900/50" : "border-amber-900/50"} flex flex-col gap-4`}
        >
          <div>
            <Label className="text-xs text-slate-400">Nombre Equipo</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950 border-slate-800 font-bold"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Defensa Inicial</Label>
            <Select value={defense} onValueChange={setDefense}>
              <SelectTrigger className="bg-slate-950 border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {DEFENSE_TYPES.map((dt) => (
                  <SelectItem key={dt} value={dt} className="text-slate-200 focus:bg-slate-800">
                    {dt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-slate-800 pt-2">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-slate-400">Jugadores ({players.length})</Label>
            </div>

            <div className="space-y-1">
              {players.map((p: Player) => (
                <Dialog
                  key={p.number}
                  open={editingId === p.number}
                  onOpenChange={(open) => !open && setEditingId(null)}
                >
                  <DialogTrigger asChild>
                    <div
                      className={`flex items-center justify-between p-2 rounded bg-slate-800/50 hover:bg-slate-800 border ${color === "blue" ? "hover:border-blue-500/50" : "hover:border-amber-500/50"} border-transparent transition-all group`}
                    >
                      <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => startEdit(p)}>
                        <span
                          className={`font-bold w-6 text-center ${color === "blue" ? "text-blue-400" : "text-amber-400"}`}
                        >
                          {p.number}
                        </span>
                        <span className="text-sm truncate">{p.name}</span>
                        {p.isGoalkeeper && <Shield className="w-3 h-3 text-slate-500 ml-1" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-600 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            deletePlayer(p.number)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Edit3
                          className="w-3 h-3 text-slate-600 group-hover:text-slate-300 cursor-pointer"
                          onClick={() => startEdit(p)}
                        />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <DialogHeader>
                      <DialogTitle>Editar Jugador {p.number}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Número</Label>
                        <Input
                          type="number"
                          value={editData.number}
                          onChange={(e) => setEditData({ ...editData, number: Number.parseInt(e.target.value) || 0 })}
                          className="col-span-3 bg-slate-900 border-slate-800"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Nombre</Label>
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="col-span-3 bg-slate-900 border-slate-800"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Es Portero</Label>
                        <div className="col-span-3 flex items-center space-x-2">
                          <Switch
                            id="gk-mode"
                            checked={editData.isGoalkeeper}
                            onCheckedChange={(c) => setEditData({ ...editData, isGoalkeeper: c })}
                          />
                          <Label htmlFor="gk-mode">{editData.isGoalkeeper ? "Sí" : "No"}</Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Posición</Label>
                        <Select
                          value={editData.position || ""}
                          onValueChange={(val) => setEditData({ ...editData, position: val as any })}
                        >
                          <SelectTrigger className="col-span-3 bg-slate-900 border-slate-800">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800">
                            {POSITIONS.map((pos) => (
                              <SelectItem key={pos} value={pos} className="text-slate-200">
                                {pos}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Mano</Label>
                        <Select
                          value={editData.hand || ""}
                          onValueChange={(val) => setEditData({ ...editData, hand: val as any })}
                        >
                          <SelectTrigger className="col-span-3 bg-slate-900 border-slate-800">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800">
                            {HANDS.map((hand) => (
                              <SelectItem key={hand} value={hand} className="text-slate-200">
                                {hand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={saveEdit} className="bg-green-600 hover:bg-green-500">
                        Guardar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={addPlayer}
              className="w-full mt-3 border-dashed border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" /> Añadir Jugador
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6 text-center uppercase tracking-widest flex items-center justify-center gap-2">
          <Settings className="w-6 h-6" /> Configuración de Partido
        </h1>
        <div className="flex-1 flex gap-6 min-h-0">
          <SetupTeamColumn
            team="A"
            name={teamAName}
            setName={setTeamAName}
            defense={defenseA}
            setDefense={setDefenseA}
            players={teamAPlayers}
            setPlayers={setTeamAPlayers}
            color="blue"
          />
          <SetupTeamColumn
            team="B"
            name={teamBName}
            setName={setTeamBName}
            defense={defenseB}
            setDefense={setDefenseB}
            players={teamBPlayers}
            setPlayers={setTeamBPlayers}
            color="amber"
          />
        </div>

        <div className="mt-6 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-5 h-5" /> Sorteo Inicial - Primera Posesión
          </h2>
          <RadioGroup value={initialPossession || ""} onValueChange={(val) => setInitialPossession(val as "A" | "B")}>
            <div className="flex gap-4 items-center">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="possession-a" />
                <Label htmlFor="possession-a" className="text-base font-semibold cursor-pointer text-blue-400">
                  {teamAName} (Local)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B" id="possession-b" />
                <Label htmlFor="possession-b" className="text-base font-semibold cursor-pointer text-amber-400">
                  {teamBName} (Visitante)
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <Button
          size="lg"
          onClick={() => {
            if (initialPossession) {
              setCurrentPossession(initialPossession)
              if (initialPossession === "A") setPossessionCountA(1)
              else setPossessionCountB(1)
              setAppState("MATCH")
            }
          }}
          disabled={!initialPossession}
          className="mt-6 w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 font-black tracking-widest text-xl py-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
        >
          COMENZAR PARTIDO
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <HeaderScoreboard
        localScore={localScore}
        visitorScore={visitorScore}
        teamAName={teamAName}
        teamBName={teamBName}
        time={time}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        formatTime={formatTime}
        defenseA={defenseA}
        defenseB={defenseB}
      />

      <div className="flex-1 p-3 w-full h-full min-h-0 overflow-hidden relative">
        <div className="grid grid-cols-1 sm:grid-cols-[45%_1fr] lg:grid-cols-[28%_1fr_28%] gap-3 h-full w-full max-w-[1920px] mx-auto min-h-0 relative z-10">
          <div className="flex flex-col gap-3 h-full min-h-0 relative">
            {selectedPlayerA ? (
              <div className="h-full animate-in slide-in-from-right-4 duration-200">
                <ActionWizard
                  wizardState={wizardState}
                  activePlayer={getActivePlayerInfo()}
                  isGoalkeeper={getActivePlayerInfo()?.isGK}
                  handleBack={handleBack}
                  currentAction={currentAction}
                  handleActionSelect={handleActionSelect}
                  selectedContext={selectedContext}
                  toggleContext={toggleContext}
                  confirmEvent={() => confirmEvent()}
                  selectedCourtZone={selectedCourtZone}
                  setSelectedCourtZone={setSelectedCourtZone}
                  selectedGoalZone={selectedGoalZone}
                  setSelectedGoalZone={setSelectedGoalZone}
                  selectedDefense={selectedDefense}
                  setSelectedDefense={setSelectedDefense}
                />
              </div>
            ) : (
              <PlayerGrid
                team="A"
                players={teamAPlayers}
                selectedPlayerA={selectedPlayerA}
                selectedPlayerB={selectedPlayerB}
                handlePlayerSelect={handlePlayerSelect}
                teamName={teamAName}
              />
            )}
          </div>

          <div className="flex flex-col gap-3 h-full min-h-0">
            <div className="h-[65%] min-h-0 shrink-0">
              <StatsTable events={events} teamAName={teamAName} teamBName={teamBName} />
            </div>
            <div className="h-[35%] min-h-0 relative shrink-0">
              <PorteriaAdvanced events={events} />
              <div className="absolute bottom-2 right-2 opacity-60 hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 h-full min-h-0 relative">
            {selectedPlayerB ? (
              <div className="h-full animate-in slide-in-from-left-4 duration-200">
                <ActionWizard
                  wizardState={wizardState}
                  activePlayer={getActivePlayerInfo()}
                  isGoalkeeper={getActivePlayerInfo()?.isGK}
                  handleBack={handleBack}
                  currentAction={currentAction}
                  handleActionSelect={handleActionSelect}
                  selectedContext={selectedContext}
                  toggleContext={toggleContext}
                  confirmEvent={() => confirmEvent()}
                  selectedCourtZone={selectedCourtZone}
                  setSelectedCourtZone={setSelectedCourtZone}
                  selectedGoalZone={selectedGoalZone}
                  setSelectedGoalZone={setSelectedGoalZone}
                  selectedDefense={selectedDefense}
                  setSelectedDefense={setSelectedDefense}
                />
              </div>
            ) : (
              <PlayerGrid
                team="B"
                players={teamBPlayers}
                selectedPlayerA={selectedPlayerA}
                selectedPlayerB={selectedPlayerB}
                handlePlayerSelect={handlePlayerSelect}
                teamName={teamBName}
              />
            )}
            <div className="hidden lg:block">
              <LiveFeedPanel events={events} onUndo={handleUndo} onExport={exportData} />
            </div>
          </div>
        </div>

        {/* Mobile Live Feed */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-2 h-[30%] z-20">
          <LiveFeedPanel events={events} onUndo={handleUndo} onExport={exportData} />
        </div>
      </div>
    </div>
  )
}

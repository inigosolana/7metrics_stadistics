"use client"

import { useState, useEffect } from "react"
import { MatchSetup } from "@/components/match-setup"
import { HeaderScoreboard } from "@/components/header-scoreboard"
import { PlayerGrid } from "@/components/player-grid"
import { PorteriaAdvanced, PorteriaLocalSaves } from "@/components/porteria-advanced"
import { LiveFeedPanel } from "@/components/live-feed-panel"
import { StatsTable } from "@/components/stats-table"
import { ActionWizard, WizardState } from "@/components/action-wizard"
import { useMatch } from "@/lib/hooks/useMatch"
import { usePlayers } from "@/lib/hooks/usePlayers"
import { useCreateEvent, useUndoLastEvent, useEventsByMatch } from "@/lib/hooks/useEvents"
import { DefenseType, CourtZone, CreateEventRequest } from "@/lib/types/api-types"

export default function MatchView() {

  // --- STATE: MATCH ID & TIME ---
  const [matchId, setMatchId] = useState<string | null>(null)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  // Persistencia básica de Match ID y tiempo
  useEffect(() => {
    const storedId = localStorage.getItem("currentMatchId")
    if (storedId) setMatchId(storedId)
  }, [])

  useEffect(() => {
    if (matchId) localStorage.setItem("currentMatchId", matchId)
  }, [matchId])

  // --- API HOOKS ---
  const { data: match, isLoading: isLoadingMatch } = useMatch(matchId)
  const { data: playersA } = usePlayers(matchId, "A")
  const { data: playersB } = usePlayers(matchId, "B")
  const { data: events = [] } = useEventsByMatch(matchId)

  const createEvent = useCreateEvent(matchId!)
  const undoLastEvent = useUndoLastEvent(matchId!)

  // Wizard & Selection State
  const [selectedPlayerA, setSelectedPlayerA] = useState<number | null>(null)
  const [selectedPlayerB, setSelectedPlayerB] = useState<number | null>(null)
  const [wizardState, setWizardState] = useState<WizardState>("IDLE")
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [selectedCourtZone, setSelectedCourtZone] = useState<CourtZone | null>(null)
  const [selectedGoalZone, setSelectedGoalZone] = useState<number | null>(null)
  const [selectedContext, setSelectedContext] = useState<string[]>([])
  const [selectedDefense, setSelectedDefense] = useState<DefenseType | null>(null)

  // Estos deberían ser Enums o tipos estrictos, uso string para simplificar integración rápida
  const [selectedTurnoverType, setSelectedTurnoverType] = useState<string | null>(null)
  const [selectedRecoveryType, setSelectedRecoveryType] = useState<string | null>(null)
  const [selectedGoalkeeper, setSelectedGoalkeeper] = useState<number | null>(null)

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => setTime((t) => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  // --- HELPERS ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const getActivePlayerInfo = (): { team: "A" | "B"; player: number; isGK?: boolean } | null => {
    if (selectedPlayerA !== null) {
      const p = playersA?.find(p => p.number === selectedPlayerA)
      return { team: "A", player: selectedPlayerA, isGK: p?.is_goalkeeper }
    }
    if (selectedPlayerB !== null) {
      const p = playersB?.find(p => p.number === selectedPlayerB)
      return { team: "B", player: selectedPlayerB, isGK: p?.is_goalkeeper }
    }
    return null
  }

  const activeInfo = getActivePlayerInfo()

  // --- HANDLERS ---
  const handleMatchStarted = (id: string, initialPossession: string) => {
    setMatchId(id)
    setTime(0)
    setIsRunning(true) // Autostart timer when match created
  }

  const handlePlayerSelect = (team: "A" | "B", number: number) => {
    if (team === "A") {
      setSelectedPlayerA(selectedPlayerA === number ? null : number)
      setSelectedPlayerB(null)
    } else {
      setSelectedPlayerB(selectedPlayerB === number ? null : number)
      setSelectedPlayerA(null)
    }

    // Si seleccionamos y no estamos en wizard, vamos a selección de acción
    if ((team === "A" && selectedPlayerA !== number) || (team === "B" && selectedPlayerB !== number)) {
      setWizardState("ACTION_SELECTION")
      resetSelectionState()
    } else {
      setWizardState("IDLE")
    }
  }

  const resetSelectionState = () => {
    setCurrentAction(null)
    setSelectedCourtZone(null)
    setSelectedGoalZone(null)
    setSelectedContext([])
    setSelectedDefense(null)
    setSelectedTurnoverType(null)
    setSelectedRecoveryType(null)
    setSelectedGoalkeeper(null)
  }

  const resetUI = () => {
    setSelectedPlayerA(null)
    setSelectedPlayerB(null)
    setWizardState("IDLE")
    resetSelectionState()
  }

  const handleActionSelect = (action: string) => {
    setCurrentAction(action)
    setWizardState("DETAILS")

    // Pre-seleccionar defensa actual si la tenemos en el match state
    // Por simplicidad, tomamos la por defecto del match
    if (activeInfo) {
      const rivalDefense = activeInfo.team === "A" ? match?.defense_b : match?.defense_a
      if (rivalDefense) setSelectedDefense(rivalDefense)
    }
  }

  const handleConfirmEvent = (fastAction?: string) => {
    const info = activeInfo
    const action = fastAction || currentAction
    if (!info || !action || !matchId) return

    // Validations (similares al original)
    if ((action.startsWith("GOL") || action === "PARADA" || action === "FALLO 7M" || action === "FUERA" || action === "POSTE") && !selectedGoalZone && !action.includes("CAMPO A CAMPO")) {
      alert("Selecciona la zona de la portería")
      return
    }

    // Build Payload
    const payload: CreateEventRequest = {
      match_id: matchId,
      timestamp: time,
      time_formatted: formatTime(time),
      player: info.player,
      team: info.team,
      action: action as any, // Cast por string vs enum estricto
      court_zone: selectedCourtZone || undefined,
      goal_zone: selectedGoalZone || undefined,
      defense_at_moment: selectedDefense || undefined,
      context: selectedContext.length > 0 ? selectedContext : undefined,
      rival_goalkeeper: selectedGoalkeeper || undefined,
    }

    // Mutate API
    createEvent.mutate(payload, {
      onSuccess: () => {
        resetUI()
      }
    })
  }

  const handleUndo = () => {
    undoLastEvent.mutate(undefined, {
      onSuccess: () => {
        // La lista se autoinvalida via hook
      }
    })
  }

  const handleExport = () => {
    // TODO: Implementar llamada a API export endpoints cuando esté listo
    // statisticsApi.exportCsv(matchId)
    alert("Exportación CSV desde API pendiente de endpoint específico que devuelva blob.")
  }

  // --- RENDER ---

  if (!matchId) {
    return <MatchSetup onMatchStarted={handleMatchStarted} />
  }

  if (isLoadingMatch) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">Cargando partido...</div>
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30">

      {/* HEADER */}
      <HeaderScoreboard
        localScore={match?.local_score || 0}
        visitorScore={match?.visitor_score || 0}
        teamAName={match?.team_a_name || "Local"}
        teamBName={match?.team_b_name || "Visitante"}
        time={time}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        onExport={handleExport}
        formatTime={formatTime}
      />

      {/* MAIN LAYOUT */}
      <div className="flex-1 overflow-hidden p-2 sm:p-3 grid grid-cols-12 gap-2 sm:gap-3 min-h-0">

        {/* COLUMN 1: Player Grids (Left) */}
        <div className="col-span-3 lg:col-span-2 xl:col-span-2 flex flex-col gap-2 min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden">
            <PlayerGrid
              team="A"
              teamName={match?.team_a_name || "Local"}
              players={playersA || []}
              selectedPlayerA={selectedPlayerA}
              selectedPlayerB={selectedPlayerB}
              handlePlayerSelect={handlePlayerSelect}
            />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <PlayerGrid
              team="B"
              teamName={match?.team_b_name || "Visitante"}
              players={playersB || []}
              selectedPlayerA={selectedPlayerA}
              selectedPlayerB={selectedPlayerB}
              handlePlayerSelect={handlePlayerSelect}
            />
          </div>
        </div>

        {/* COLUMN 2: Court / Wizard / Stats (Center) */}
        <div className="col-span-6 lg:col-span-7 xl:col-span-7 flex flex-col gap-2 min-h-0">
          {/* Top Area: Stats & Visualization */}
          <div className="flex-[3] grid grid-cols-12 gap-3 min-h-0">
            <div className="col-span-7 h-full min-h-0 overflow-hidden">
              <StatsTable
                events={events}
                teamAName={match?.team_a_name || "A"}
                teamBName={match?.team_b_name || "B"}
                teamAPlayers={playersA || []}
                teamBPlayers={playersB || []}
              />
            </div>
            <div className="col-span-5 flex flex-col gap-2 h-full min-h-0">
              <div className="flex-1 min-h-0">
                <PorteriaAdvanced events={events} />
              </div>
              <div className="h-1/3 min-h-0">
                <PorteriaLocalSaves events={events} />
              </div>
            </div>
          </div>

          {/* Bottom Area: Action Wizard */}
          <div className="flex-[2] min-h-0">
            <ActionWizard
              wizardState={wizardState}
              activePlayer={activeInfo}
              isGoalkeeper={activeInfo?.isGK || false}
              handleBack={() => setWizardState("IDLE")}
              currentAction={currentAction}
              handleActionSelect={handleActionSelect}
              selectedContext={selectedContext}
              toggleContext={(ctx) => {
                if (selectedContext.includes(ctx)) setSelectedContext(selectedContext.filter(c => c !== ctx))
                else setSelectedContext([...selectedContext, ctx])
              }}
              confirmEvent={() => handleConfirmEvent()}
              selectedCourtZone={selectedCourtZone}
              setSelectedCourtZone={setSelectedCourtZone}
              selectedGoalZone={selectedGoalZone}
              setSelectedGoalZone={setSelectedGoalZone}
              selectedDefense={selectedDefense}
              setSelectedDefense={setSelectedDefense}
              selectedTurnoverType={selectedTurnoverType}
              setSelectedTurnoverType={setSelectedTurnoverType}
              selectedRecoveryType={selectedRecoveryType}
              setSelectedRecoveryType={setSelectedRecoveryType}
              rivalGoalkeepers={activeInfo ? (activeInfo.team === "A" ? (playersB?.filter(p => p.is_goalkeeper) || []) : (playersA?.filter(p => p.is_goalkeeper) || [])) : []}
              selectedGoalkeeper={selectedGoalkeeper}
              setSelectedGoalkeeper={setSelectedGoalkeeper}
            />
          </div>
        </div>

        {/* COLUMN 3: Live Feed (Right) */}
        <div className="col-span-3 lg:col-span-3 xl:col-span-3 min-h-0">
          <LiveFeedPanel
            events={events}
            onUndo={handleUndo}
            onExport={handleExport}
          />
        </div>

      </div>
    </div>
  )
}

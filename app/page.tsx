"use client"

import { useState, useEffect } from "react"
import { MatchSetup } from "@/components/match-setup"
import { HeaderScoreboard } from "@/components/header-scoreboard"
import { PlayerGrid } from "@/components/player-grid"
import { GoalAdvanced } from "@/components/goal-advanced"
import { LiveFeedPanel } from "@/components/live-feed-panel"
import { StatsTable } from "@/components/stats-table"
import { ActionWizard, WizardState } from "@/components/action-wizard"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useMatch } from "@/lib/hooks/useMatch"
import { usePlayers } from "@/lib/hooks/usePlayers"
import { useCreateEvent, useUndoLastEvent, useEventsByMatch, useDeleteEvent, useUpdateEvent } from "@/lib/hooks/useEvents"
import { statisticsApi } from "@/lib/api/statistics"
import { DefenseType, CourtZone, CreateEventRequest, UpdateEventRequest, Player, Event } from "@/lib/types/api-types"
import { EventEditDialog } from "@/components/event-edit-dialog"

export default function MatchView() {

  // --- STATE: MATCH ID & TIME ---
  const [matchId, setMatchId] = useState<string | null>(null)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isNightMode, setIsNightMode] = useState(false)

  // Persistencia básica de Match ID y tiempo
  useEffect(() => {
    const storedId = localStorage.getItem("currentMatchId")
    if (storedId) setMatchId(storedId)
  }, [])

  useEffect(() => {
    if (matchId) localStorage.setItem("currentMatchId", matchId)
  }, [matchId])

  // Porteros Activos en Campo (Persistentes)
  const [activeGoalkeeperA, setActiveGoalkeeperA] = useState<number | null>(null)
  const [activeGoalkeeperB, setActiveGoalkeeperB] = useState<number | null>(null)

  // Persistencia de Porteros Activos
  useEffect(() => {
    const storedGkA = localStorage.getItem(`activeGkA_${matchId}`)
    const storedGkB = localStorage.getItem(`activeGkB_${matchId}`)
    if (storedGkA) setActiveGoalkeeperA(Number.parseInt(storedGkA))
    if (storedGkB) setActiveGoalkeeperB(Number.parseInt(storedGkB))
  }, [matchId])

  useEffect(() => {
    if (matchId && activeGoalkeeperA !== null) localStorage.setItem(`activeGkA_${matchId}`, activeGoalkeeperA.toString())
  }, [matchId, activeGoalkeeperA])

  useEffect(() => {
    if (matchId && activeGoalkeeperB !== null) localStorage.setItem(`activeGkB_${matchId}`, activeGoalkeeperB.toString())
  }, [matchId, activeGoalkeeperB])

  // --- API HOOKS ---
  const { data: match, isLoading: isLoadingMatch } = useMatch(matchId)
  const { data: playersA } = usePlayers(matchId, "A")
  const { data: playersB } = usePlayers(matchId, "B")
  const { data: events = [] } = useEventsByMatch(matchId)

  const createEvent = useCreateEvent(matchId!)
  const undoLastEvent = useUndoLastEvent(matchId!)
  const deleteEvent = useDeleteEvent(matchId!)
  const updateEvent = useUpdateEvent(matchId!)

  // Edit dialog state
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

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

  const getActivePlayerInfo = (): { team: "A" | "B"; player: number; isGK?: boolean; name?: string } | null => {
    if (selectedPlayerA !== null) {
      const p = playersA?.find(p => p.number === selectedPlayerA)
      return { team: "A", player: selectedPlayerA, isGK: p?.is_goalkeeper, name: p?.name }
    }
    if (selectedPlayerB !== null) {
      const p = playersB?.find(p => p.number === selectedPlayerB)
      return { team: "B", player: selectedPlayerB, isGK: p?.is_goalkeeper, name: p?.name }
    }
    return null
  }

  const activeInfo = getActivePlayerInfo()

  let rivalGoalkeepersList: Player[] = []
  let activeRivalGk: number | null = null
  if (activeInfo) {
    if (activeInfo.team === "A") {
      rivalGoalkeepersList = playersB?.filter(p => p.is_goalkeeper) || []
      activeRivalGk = activeGoalkeeperB
    } else {
      rivalGoalkeepersList = playersA?.filter(p => p.is_goalkeeper) || []
      activeRivalGk = activeGoalkeeperA
    }
  }

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

      // Auto-seleccionar portero rival si hay uno marcado como activo
      if (team === "A") {
        setSelectedGoalkeeper(activeGoalkeeperB)
      } else {
        setSelectedGoalkeeper(activeGoalkeeperA)
      }
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

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent.mutate(eventId)
  }

  const handleSaveEditEvent = (eventId: string, data: UpdateEventRequest) => {
    updateEvent.mutate({ eventId, data }, {
      onSuccess: () => setEditingEvent(null),
    })
  }

  const handleResetMatch = () => {
    localStorage.removeItem("currentMatchId")
    if (matchId) {
      localStorage.removeItem(`activeGkA_${matchId}`)
      localStorage.removeItem(`activeGkB_${matchId}`)
    }
    setMatchId(null)
    setTime(0)
    setIsRunning(false)
    resetUI()
  }

  const handleExport = async () => {
    if (!matchId) return;
    try {
      const blob = await statisticsApi.exportCsv(matchId);
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `estadisticas_partido_${matchId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Error al exportar el CSV. Asegúrate de que el servidor esté disponible.");
    }
  }

  // --- RENDER ---

  if (!matchId) {
    return <MatchSetup onMatchStarted={handleMatchStarted} />
  }

  if (isLoadingMatch) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">Cargando partido...</div>
  }

  return (
    <div className={`flex flex-col h-screen w-full overflow-hidden font-sans selection:bg-blue-500/30 transition-all duration-700 ${isNightMode ? 'bg-[#000000] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>

      {/* HEADER */}
      <HeaderScoreboard
        localScore={match?.local_score || 0}
        visitorScore={match?.visitor_score || 0}
        teamAName={match?.team_a_name || "Local"}
        teamBName={match?.team_b_name || "Visitante"}
        time={time}
        isRunning={isRunning}
        isNightMode={isNightMode}
        onToggleTheme={() => setIsNightMode(!isNightMode)}
        setIsRunning={setIsRunning}
        onExport={handleExport}
        onReset={handleResetMatch}
        formatTime={formatTime}
      />

      {/* MAIN LAYOUT */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 min-h-0">

        {/* COLUMN 1: Player Grids (Left) */}
        <div className="order-2 lg:order-1 col-span-1 lg:col-span-3 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 min-h-[360px] lg:min-h-0">
          <div className="min-h-[200px] lg:flex-1 lg:min-h-0 overflow-hidden">
            <PlayerGrid
              team="A"
              teamName={match?.team_a_name || "Local"}
              players={playersA || []}
              selectedPlayerA={selectedPlayerA}
              selectedPlayerB={selectedPlayerB}
              handlePlayerSelect={handlePlayerSelect}
              activeGoalkeeper={activeGoalkeeperA}
              setActiveGoalkeeper={setActiveGoalkeeperA}
              events={events}
              isNightMode={isNightMode}
            />
          </div>
          <div className="min-h-[200px] lg:flex-1 lg:min-h-0 overflow-hidden">
            <PlayerGrid
              team="B"
              teamName={match?.team_b_name || "Visitante"}
              players={playersB || []}
              selectedPlayerA={selectedPlayerA}
              selectedPlayerB={selectedPlayerB}
              handlePlayerSelect={handlePlayerSelect}
              activeGoalkeeper={activeGoalkeeperB}
              setActiveGoalkeeper={setActiveGoalkeeperB}
              events={events}
              isNightMode={isNightMode}
            />
          </div>
        </div>

        {/* COLUMN 2: Court / Wizard / Stats (Center) */}
        <div className="order-1 lg:order-2 col-span-1 lg:col-span-7 xl:col-span-8 flex flex-col gap-2 min-h-0">
          {/* Top Area: Stats & Visualization */}
          <div className="flex-grow-0 flex flex-col md:flex-row gap-2 sm:gap-3 items-stretch min-h-0">
            <div className="w-full md:w-[58%] shrink-0 min-h-0 flex flex-col">
              <StatsTable
                events={events}
                teamAName={match?.team_a_name || "A"}
                teamBName={match?.team_b_name || "B"}
                teamAPlayers={playersA || []}
                teamBPlayers={playersB || []}
                isNightMode={isNightMode}
              />
            </div>
            <div className="w-full md:flex-1 min-w-0 min-h-0 flex flex-col">
              <GoalAdvanced events={events} isNightMode={isNightMode} />
            </div>
          </div>

          {/* Bottom Area: idle placeholder */}
          <div className="flex-[2] min-h-0">
            <ActionWizard
              wizardState="IDLE"
              activePlayer={null}
              isGoalkeeper={false}
              handleBack={() => {}}
              currentAction={null}
              handleActionSelect={() => {}}
              selectedContext={[]}
              toggleContext={() => {}}
              confirmEvent={() => {}}
              selectedCourtZone={null}
              setSelectedCourtZone={() => {}}
              selectedGoalZone={null}
              setSelectedGoalZone={() => {}}
              selectedDefense={null}
              setSelectedDefense={() => {}}
              selectedTurnoverType={null}
              setSelectedTurnoverType={() => {}}
              selectedRecoveryType={null}
              setSelectedRecoveryType={() => {}}
              rivalGoalkeepers={[]}
              selectedGoalkeeper={null}
              setSelectedGoalkeeper={() => {}}
              activeRivalGoalkeeper={null}
              onSetActiveRivalGK={() => {}}
              isNightMode={isNightMode}
            />
          </div>

          {/* Action Sheet — se abre al seleccionar jugador */}
          <Sheet open={wizardState !== "IDLE"} onOpenChange={(open) => { if (!open) resetUI() }}>
            <SheetContent
              side="bottom"
              showCloseButton={false}
              className={`rounded-t-2xl p-0 border-t max-h-[85dvh] flex flex-col ${isNightMode ? "bg-slate-950 border-white/10" : "bg-white border-slate-200"}`}
            >
              <ActionWizard
                wizardState={wizardState}
                activePlayer={activeInfo}
                isGoalkeeper={activeInfo?.isGK || false}
                handleBack={() => {
                  if (wizardState === "DETAILS") {
                    setWizardState("ACTION_SELECTION")
                    resetSelectionState()
                  } else {
                    resetUI()
                  }
                }}
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
                rivalGoalkeepers={rivalGoalkeepersList}
                selectedGoalkeeper={selectedGoalkeeper}
                setSelectedGoalkeeper={setSelectedGoalkeeper}
                activeRivalGoalkeeper={activeRivalGk}
                onSetActiveRivalGK={(n) => {
                  if (activeInfo?.team === "A") setActiveGoalkeeperB(n)
                  else setActiveGoalkeeperA(n)
                }}
                isNightMode={isNightMode}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* COLUMN 3: Registro en vivo (Right) */}
        <div className="order-3 col-span-1 lg:col-span-2 xl:col-span-2 h-[320px] sm:h-[360px] lg:h-auto lg:min-h-0 min-w-0 overflow-hidden">
          <LiveFeedPanel
            events={events}
            onUndo={handleUndo}
            onExport={handleExport}
            isNightMode={isNightMode}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={(event) => setEditingEvent(event)}
            isDeletingEvent={deleteEvent.isPending}
          />
        </div>

      </div>

      {/* Event Edit Dialog */}
      <EventEditDialog
        event={editingEvent}
        open={editingEvent !== null}
        onClose={() => setEditingEvent(null)}
        onSave={handleSaveEditEvent}
        isSaving={updateEvent.isPending}
        isNightMode={isNightMode}
      />
    </div>
  )
}

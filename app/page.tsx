"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, Trophy, Shield, Play, Edit2, 
  CheckCircle2, Save, XCircle, Timer, 
  ChevronRight, History, Settings2, Users
} from "lucide-react"

// --- 1. DEFINICIÓN DE TIPOS (EXTENDIDO) ---
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
  situation?: string
  isSuccess: boolean
}

type GameState = "setup" | "playing"

// --- 2. CONSTANTES (TODAS LAS OPCIONES DEL BALONMANO) ---
const COURT_ZONES = [
  "Extremo Izq", "Lateral Izq", "Central", 
  "Lateral Der", "Extremo Der", "Pivote (6m)", 
  "Línea 9m Izq", "Línea 9m Centro", "Línea 9m Der",
]

const LOSS_TYPES = [
  "Error Pase", "Error Recepción", "Pasos", 
  "Pisando", "Falta en Ataque", "Dribling", "Mal Saque"
]

const DEFENSE_TYPES = [
  "6:0", "5:1", "3:2:1", "4:2", "Mixta", "Presión Toda", "Otro"
]

const GAME_SITUATIONS = [
  "Igualdad (6x6)", "Superioridad (6x5)", "Ataque 7x6", 
  "Inferioridad (5x6)", "Contraataque", "Segunda Oleada"
]

const GOAL_ZONES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// --- 3. COMPONENTE: CONFIGURACIÓN DE EQUIPOS (EXPANDIDO) ---
const TeamSetup = ({ team, players, setPlayers, teamName }: any) => {
  return (
    <div className={`flex flex-col h-full p-5 rounded-2xl border-2 shadow-2xl ${
      team === "A" 
        ? "border-blue-500 bg-slate-900/40" 
        : "border-amber-500 bg-slate-900/40"
    }`}>
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="text-2xl font-black italic flex items-center gap-3 tracking-tighter uppercase">
          <Users className={team === "A" ? "text-blue-400" : "text-amber-400"} />
          {teamName}
        </h3>
        <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold">
          {players.length} JUGADORES
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {players.map((player: Player, index: number) => (
          <div key={index} className="group flex gap-3 items-center bg-slate-800/50 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-all">
            <div className="w-20">
              <label className="text-[9px] text-slate-500 font-black block mb-1 ml-1 uppercase">Dorsal</label>
              <Input
                type="number"
                value={player.number}
                onChange={(e) => {
                  const newPlayers = [...players];
                  newPlayers[index].number = parseInt(e.target.value) || 0;
                  setPlayers(newPlayers);
                }}
                className="h-10 bg-slate-950 border-slate-700 text-center font-black text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-[9px] text-slate-500 font-black block mb-1 ml-1 uppercase">Nombre Completo</label>
              <Input
                value={player.name}
                onChange={(e) => {
                  const newPlayers = [...players];
                  newPlayers[index].name = e.target.value;
                  setPlayers(newPlayers);
                }}
                className="h-10 bg-slate-950 border-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del jugador..."
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="text-[9px] text-slate-500 font-black mb-1 uppercase text-center">Pos</label>
              <Button
                variant={player.isGoalkeeper ? "default" : "outline"}
                size="sm"
                className={`h-10 px-4 font-bold transition-all ${
                  player.isGoalkeeper 
                    ? "bg-green-600 hover:bg-green-700 border-none shadow-[0_0_10px_rgba(22,163,74,0.4)]" 
                    : "opacity-40 grayscale hover:grayscale-0"
                }`}
                onClick={() => {
                  const newPlayers = [...players];
                  newPlayers[index].isGoalkeeper = !newPlayers[index].isGoalkeeper;
                  setPlayers(newPlayers);
                }}
              >
                GK
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- 4. COMPONENTE: PANEL DE JUGADORES Y ACCIONES (EL CORAZÓN) ---
const PlayerNumbersPanel = ({
  team,
  players,
  selectedPlayer,
  onPlayerSelect,
  teamName,
  onActionComplete,
  events
}: any) => {
  const [step, setStep] = useState<"actions" | "details" | "losses">("actions")
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [details, setDetails] = useState({ 
    defense: "", courtZone: "", goalZone: 0, situation: "" 
  })

  const selectedPlayerData = players.find((p: Player) => p.number === selectedPlayer);
  
  // Calcular goles actuales del jugador
  const playerGoals = events.filter((e: any) => 
    e.player === selectedPlayer && e.team === team && e.action === "GOL"
  ).length;

  const handleReset = () => {
    setStep("actions")
    setCurrentAction(null)
    setDetails({ defense: "", courtZone: "", goalZone: 0, situation: "" })
    onPlayerSelect(null)
  }

  const handleActionInitiate = (action: string) => {
    setCurrentAction(action)
    if (action === "PÉRDIDA") {
      setStep("losses")
    } else {
      setStep("details")
    }
  }

  return (
    <div className={`bg-gradient-to-br ${
      team === "A" ? "from-blue-700 to-blue-900" : "from-amber-700 to-amber-900"
    } border-2 ${
      team === "A" ? "border-blue-400/50" : "border-amber-400/50"
    } rounded-2xl p-3 h-full flex flex-col shadow-2xl overflow-hidden relative transition-all`}>
      
      {/* HEADER DEL PANEL */}
      <div className="flex justify-between items-center mb-3 shrink-0 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${team === "A" ? "bg-blue-300" : "bg-amber-300"}`} />
          <span className="text-[11px] font-black text-white/90 uppercase tracking-widest">{teamName}</span>
        </div>
        {selectedPlayer && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-[10px] bg-white/10 text-white hover:bg-red-500/50">
            <XCircle className="w-3 h-3 mr-1" /> CANCELAR
          </Button>
        )}
      </div>

      {!selectedPlayer ? (
        /* VISTA: CUADRÍCULA DE SELECCIÓN */
        <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto custom-scrollbar flex-1 content-start">
          {players.map((player: Player) => (
            <Button
              key={player.number}
              onClick={() => onPlayerSelect(player.number)}
              className={`h-16 flex flex-col justify-center items-center font-black rounded-xl transition-all active:scale-90 shadow-lg border-b-4 border-black/40 ${
                team === "A" ? "bg-blue-500 hover:bg-blue-400" : "bg-amber-500 hover:bg-amber-400"
              }`}
            >
              <span className="text-2xl leading-none italic">{player.number}</span>
              <span className="text-[7px] font-bold opacity-70 uppercase truncate w-full px-1">{player.name}</span>
            </Button>
          ))}
        </div>
      ) : (
        /* VISTA: MODO ACCIÓN (DORSAL PEQUEÑO ARRIBA) */
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/10 mb-3 shrink-0">
            <div className="bg-white text-slate-900 w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-black italic shadow-inner">
              {selectedPlayer}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-black text-white truncate block uppercase leading-none mb-1">
                {selectedPlayerData?.name}
              </span>
              <div className="flex gap-2 items-center">
                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded text-white font-bold italic uppercase">
                  {selectedPlayerData?.isGoalkeeper ? "Portero" : "Campo"}
                </span>
                <span className="text-[9px] text-green-300 font-bold uppercase tracking-tighter">
                  {playerGoals} GOLES HOY
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {step === "actions" ? (
              <div className="grid grid-cols-2 gap-3 pb-2">
                {!selectedPlayerData?.isGoalkeeper ? (
                  <>
                    <Button className="h-24 bg-green-600 hover:bg-green-500 font-black text-3xl col-span-2 shadow-xl border-b-4 border-green-900" 
                      onClick={() => handleActionInitiate("GOL")}>GOL</Button>
                    <Button className="h-16 bg-blue-600 hover:bg-blue-500 font-black text-lg border-b-4 border-blue-900" 
                      onClick={() => handleActionInitiate("PARADA")}>PARADA</Button>
                    <Button className="h-16 bg-orange-600 hover:bg-orange-500 font-black text-lg border-b-4 border-orange-900" 
                      onClick={() => handleActionInitiate("FUERA")}>FUERA</Button>
                    <Button className="h-12 bg-slate-700 hover:bg-slate-600 font-bold col-span-2 text-xs" 
                      onClick={() => handleActionInitiate("TIRO")}>OTRO TIRO</Button>
                    <Button className="h-12 bg-red-600 hover:bg-red-500 font-bold col-span-2 text-xs border-b-4 border-red-900" 
                      onClick={() => handleActionInitiate("PÉRDIDA")}>PÉRDIDA / ERROR</Button>
                  </>
                ) : (
                  <>
                    <Button className="h-24 bg-blue-600 hover:bg-blue-500 font-black text-3xl col-span-2 border-b-4 border-blue-900" 
                      onClick={() => handleActionInitiate("PARADA")}>PARADA GK</Button>
                    <Button className="h-24 bg-red-600 hover:bg-red-500 font-black text-3xl col-span-2 border-b-4 border-red-900" 
                      onClick={() => handleActionInitiate("GOL ENCAJADO")}>GOL ENCAJADO</Button>
                  </>
                )}
              </div>
            ) : step === "losses" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                  <span className="text-red-400 font-black text-sm uppercase">TIPO DE PÉRDIDA</span>
                  <Button variant="ghost" size="xs" onClick={() => setStep("actions")} className="text-[10px] text-white/50">VOLVER</Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {LOSS_TYPES.map(type => (
                    <Button key={type} className="h-10 bg-black/40 hover:bg-red-600 text-xs font-bold justify-start px-4" 
                      onClick={() => { onActionComplete("PÉRDIDA", { specificAction: type }); handleReset(); }}>
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Registrando</span>
                    <span className="text-green-400 font-black text-xl italic leading-none">{currentAction}</span>
                  </div>
                  <Button variant="ghost" size="xs" onClick={() => setStep("actions")} className="text-[10px] underline">ATRÁS</Button>
                </div>
                
                <section>
                  <label className="text-[10px] font-black text-white/50 uppercase block mb-2 tracking-widest">Defensa Rival</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DEFENSE_TYPES.map(d => (
                      <Button key={d} size="xs" variant={details.defense === d ? "default" : "outline"} 
                        className={`h-9 text-[10px] font-bold border-white/10 ${details.defense === d ? "bg-white text-black font-black" : "text-white/70"}`} 
                        onClick={() => setDetails({...details, defense: d})}>{d}</Button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-[10px] font-black text-white/50 uppercase block mb-2 tracking-widest">Situación de Juego</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {GAME_SITUATIONS.map(s => (
                      <Button key={s} size="xs" variant={details.situation === s ? "default" : "outline"} 
                        className={`h-9 text-[9px] font-bold border-white/10 ${details.situation === s ? "bg-white text-black" : "text-white/70"}`} 
                        onClick={() => setDetails({...details, situation: s})}>{s}</Button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-[10px] font-black text-white/50 uppercase block mb-2 tracking-widest">Zona de Lanzamiento</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {COURT_ZONES.map(z => (
                      <Button key={z} size="xs" variant={details.courtZone === z ? "default" : "outline"} 
                        className={`h-9 text-[8px] font-black leading-tight border-white/10 ${details.courtZone === z ? "bg-white text-black" : "text-white/70"}`} 
                        onClick={() => setDetails({...details, courtZone: z})}>{z}</Button>
                    ))}
                  </div>
                </section>

                <section className="bg-black/30 p-4 rounded-2xl border border-white/5">
                  <label className="text-[10px] font-black text-white/50 uppercase block mb-3 text-center tracking-tighter">Impacto en Portería</label>
                  <div className="grid grid-cols-3 gap-2 aspect-square max-w-[160px] mx-auto">
                    {GOAL_ZONES.map(z => (
                      <Button key={z} variant={details.goalZone === z ? "default" : "ghost"} 
                        className={`h-full text-xl font-black border border-white/5 ${details.goalZone === z ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "text-white/30"}`} 
                        onClick={() => setDetails({...details, goalZone: z})}>{z}</Button>
                    ))}
                  </div>
                </section>

                <div className="absolute bottom-4 left-4 right-4 z-50">
                  <Button className="w-full bg-green-500 hover:bg-green-400 font-black h-14 text-lg shadow-2xl border-t border-white/20" 
                    disabled={!details.defense || !details.courtZone || !details.goalZone} 
                    onClick={() => { onActionComplete(currentAction, details); handleReset(); }}>
                    CONFIRMAR DATOS
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// --- 5. PÁGINA PRINCIPAL (LÓGICA DE ESTADO) ---
export default function HandballTracker() {
  const [gameState, setGameState] = useState<GameState>("setup")
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [score, setScore] = useState({ local: 0, visitor: 0 })
  
  const [playersA, setPlayersA] = useState<Player[]>(Array.from({ length: 14 }, (_, i) => ({ 
    number: i + 1, name: `Jugador ${i + 1}`, isGoalkeeper: i === 0 
  })))
  const [playersB, setPlayersB] = useState<Player[]>(Array.from({ length: 14 }, (_, i) => ({ 
    number: i + 1, name: `Oponente ${i + 1}`, isGoalkeeper: i === 0 
  })))
  
  const [selectedA, setSelectedA] = useState<number | null>(null)
  const [selectedB, setSelectedB] = useState<number | null>(null)

  // CRONÓMETRO
  useEffect(() => {
    let interval: any = null
    if (isRunning) { interval = setInterval(() => setTime((t) => t + 1), 1000) }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }

  const handleActionRecord = (team: "A" | "B", playerNum: number, action: string, extra: any) => {
    if (action === "GOL") {
      setScore(prev => team === "A" ? { ...prev, local: prev.local + 1 } : { ...prev, visitor: prev.visitor + 1 })
    }
    const newEvent: Event = {
      id: Math.random().toString(36).substring(7),
      timestamp: time,
      player: playerNum,
      team,
      action,
      isSuccess: action === "GOL" || (action === "PARADA" && team === "B"), // Ejemplo lógica
      ...extra
    }
    setEvents([newEvent, ...events])
  }

  // --- PANTALLA: CONFIGURACIÓN INICIAL ---
  if (gameState === "setup") {
    return (
      <div className="h-screen bg-[#020617] text-slate-100 flex flex-col p-4 sm:p-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 shrink-0">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-blue-500 leading-none">HB-ANALYTICS PRO</h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Software de Análisis Técnico de Balonmano</p>
          </div>
          <Button size="lg" className="bg-green-600 hover:bg-green-500 px-10 h-16 gap-3 font-black text-xl italic shadow-[0_0_30px_rgba(22,163,74,0.3)] transition-all hover:scale-105" 
            onClick={() => setGameState("playing")}>
            <Play className="w-6 h-6 fill-current" /> EMPEZAR PARTIDO
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
          <TeamSetup team="A" players={playersA} setPlayers={setPlayersA} teamName="Plantilla Local" />
          <TeamSetup team="B" players={playersB} setPlayers={setPlayersB} teamName="Plantilla Visitante" />
        </div>
      </div>
    )
  }

  // --- PANTALLA: PAD DE ACCIONES ---
  return (
    <div className="flex flex-col h-screen w-full bg-[#020617] text-white overflow-hidden font-sans">
      
      {/* SCOREBOARD DE ALTA COMPETICIÓN */}
      <div className="bg-slate-900/90 border-b-2 border-white/5 px-6 py-3 flex items-center justify-between shrink-0 shadow-2xl relative z-50">
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-blue-400 tracking-widest uppercase">LOCAL</span>
            <span className="text-5xl font-black tabular-nums italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{score.local}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setGameState("setup")} className="h-10 border-white/10 bg-white/5 hover:bg-white/10 font-bold px-4">
            <Settings2 className="w-4 h-4 mr-2" /> EDITAR
          </Button>
        </div>

        <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
          <div className="bg-black/80 px-6 py-2 rounded-xl border-2 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <span className="font-mono text-4xl font-black text-green-400 tabular-nums tracking-widest leading-none">
              {formatTime(time)}
            </span>
          </div>
          <Button size="sm" variant="ghost" className={`mt-2 font-black italic tracking-tighter ${isRunning ? 'text-red-400' : 'text-green-400'}`} 
            onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? "PAUSAR CRONO" : "REANUDAR CRONO"}
          </Button>
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-amber-400 tracking-widest uppercase">VISITANTE</span>
            <span className="text-5xl font-black tabular-nums italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{score.visitor}</span>
          </div>
        </div>
      </div>

      {/* ZONA DE TRABAJO PRINCIPAL */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 min-h-0 overflow-hidden">
        <PlayerNumbersPanel
          team="A"
          players={playersA}
          selectedPlayer={selectedA}
          onPlayerSelect={(n: any) => { setSelectedA(n); setSelectedB(null); }}
          teamName="L-LOCAL"
          events={events}
          onActionComplete={(act: any, det: any) => handleActionRecord("A", selectedA!, act, det)}
        />
        <PlayerNumbersPanel
          team="B"
          players={playersB}
          selectedPlayer={selectedB}
          onPlayerSelect={(n: any) => { setSelectedB(n); setSelectedA(null); }}
          teamName="V-VISITANTE"
          events={events}
          onActionComplete={(act: any, det: any) => handleActionRecord("B", selectedB!, act, det)}
        />
      </div>

      {/* BARRA DE ESTADO / ÚLTIMAS ACCIONES */}
      <div className="h-12 bg-black/90 border-t border-white/10 flex items-center gap-6 px-6 overflow-x-auto whitespace-nowrap shrink-0 scrollbar-hide">
        <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase italic">
          <History className="w-3 h-3" /> LIVE FEED
        </div>
        <div className="flex gap-6">
          {events.slice(0, 8).map(e => (
            <div key={e.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
              <span className="text-[10px] text-green-500 font-mono font-bold">[{formatTime(e.timestamp)}]</span>
              <span className={`text-[11px] font-black ${e.team === 'A' ? 'text-blue-400' : 'text-amber-400'}`}>
                #{e.player} {e.action}
              </span>
              {e.courtZone && <span className="text-[9px] text-slate-500 italic">({e.courtZone})</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

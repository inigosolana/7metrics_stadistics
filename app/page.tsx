"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Trophy, Play, Edit2, XCircle, Activity, History, Shield, ArrowLeft, Maximize2, Users, Settings2
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// --- 1. CONSTANTES COMPLETAS (BALONMANO PROFESIONAL) ---
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

// --- 2. DEFINICIÓN DE TIPOS ---
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
}

// --- 3. COMPONENTE: PORTERÍA LOCAL ESTÁTICA ---
const PorteriaStats = ({ events }: { events: Event[] }) => {
  const getZoneStats = (zone: number) => {
    // Filtramos tiros recibidos por el Equipo A (Local)
    const shots = events.filter(e => e.goalZone === zone && (
      (e.team === "B" && ["GOL", "PARADA", "FUERA", "POSTE"].includes(e.action)) ||
      (e.team === "A" && ["PARADA", "GOL ENCAJADO"].includes(e.action))
    ));
    
    const goals = shots.filter(e => e.action === "GOL" || e.action === "GOL ENCAJADO").length;
    const saves = shots.filter(e => e.action === "PARADA").length;
    const total = goals + saves;
    const percent = total > 0 ? Math.round((saves / total) * 100) : 0;
    
    return { total, percent, saves, goals };
  };

  return (
    <div className="grid grid-cols-3 gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700 h-full w-full">
      {GOAL_ZONES.map(z => {
        const stats = getZoneStats(z);
        return (
          <div key={z} className="relative flex flex-col items-center justify-center border border-slate-700/50 rounded bg-slate-900/80 overflow-hidden">
            <span className="absolute top-0.5 right-1 text-[7px] text-slate-600 font-mono">Z{z}</span>
            <span className={`text-xl font-black ${stats.percent > 35 ? 'text-green-400' : 'text-white'}`}>
              {stats.total > 0 ? `${stats.percent}%` : "-"}
            </span>
            {stats.total > 0 && (
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">
                {stats.saves}P / {stats.goals}G
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- 4. COMPONENTE PRINCIPAL ---
export default function HandballTracker() {
  const [gameState, setGameState] = useState<"setup" | "playing">("setup")
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [score, setScore] = useState({ local: 0, visitor: 0 })
  
  // Plantillas
  const [playersA, setPlayersA] = useState<Player[]>(Array.from({ length: 14 }, (_, i) => ({ number: i + 1, name: `Jugador ${i + 1}`, isGoalkeeper: i === 0 })))
  const [playersB, setPlayersB] = useState<Player[]>(Array.from({ length: 14 }, (_, i) => ({ number: i + 1, name: `Oponente ${i + 1}`, isGoalkeeper: i === 0 })))
  
  // Estado del Wizard de Acción
  const [selectedPlayer, setSelectedPlayer] = useState<{ team: "A" | "B", number: number } | null>(null)
  const [wizardStep, setWizardStep] = useState<"actions" | "details" | "losses">("actions")
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [details, setDetails] = useState({ defense: "", courtZone: "", goalZone: 0, situation: "" })

  // Lógica del Cronómetro
  useEffect(() => {
    let interval: any = null
    if (isRunning) interval = setInterval(() => setTime((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const handleActionRecord = (specificAction?: string) => {
    if (!selectedPlayer || !currentAction) return
    
    if (currentAction === "GOL") {
      setScore(prev => selectedPlayer.team === "A" ? { ...prev, local: prev.local + 1 } : { ...prev, visitor: prev.visitor + 1 })
    }

    const newEvent: Event = {
      id: Math.random().toString(36).substring(7),
      timestamp: time,
      player: selectedPlayer.number,
      team: selectedPlayer.team,
      action: currentAction,
      specificAction: specificAction,
      ...details
    }

    setEvents([newEvent, ...events])
    // Resetear estados
    setSelectedPlayer(null)
    setWizardStep("actions")
    setCurrentAction(null)
    setDetails({ defense: "", courtZone: "", goalZone: 0, situation: "" })
  }

  // --- RENDER: SETUP (CON CORRECCIÓN DE ZOOM) ---
  if (gameState === "setup") {
    return (
      <div className="h-screen w-full bg-[#020617] text-slate-100 flex flex-col p-4 md:p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-blue-500 leading-none">HB-ANALYTICS PRO</h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Configuración de Plantilla</p>
          </div>
          <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white px-10 h-14 gap-3 font-black text-xl italic shadow-lg" onClick={() => setGameState("playing")}>
            <Play className="w-5 h-5 fill-current" /> EMPEZAR PARTIDO
          </Button>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
          {[ { t: "A", p: playersA, s: setPlayersA, n: "Local (A)", c: "border-blue-500 bg-blue-950/20" },
             { t: "B", p: playersB, s: setPlayersB, n: "Visitante (B)", c: "border-amber-500 bg-amber-950/20" } 
          ].map((team) => (
            <div key={team.t} className={`flex flex-col rounded-2xl border-2 ${team.c} p-5 min-h-0 shadow-2xl`}>
              <h3 className="text-2xl font-black mb-4 flex items-center gap-2 uppercase italic tracking-tighter">
                <Users size={24} className={team.t === 'A' ? "text-blue-400" : "text-amber-400"} /> {team.n}
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {team.p.map((player, idx) => (
                  <div key={idx} className="flex gap-3 items-center bg-slate-900/80 p-3 rounded-xl border border-white/5">
                    <div className="w-16">
                      <label className="text-[9px] text-slate-500 font-black block mb-1 ml-1 uppercase">Dorsal</label>
                      <Input type="number" value={player.number} onChange={e => {
                        const n = [...team.p]; n[idx].number = parseInt(e.target.value) || 0; team.s(n);
                      }} className="h-10 bg-black border-slate-700 text-center font-black text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] text-slate-500 font-black block mb-1 ml-1 uppercase">Nombre</label>
                      <Input value={player.name} onChange={e => {
                        const n = [...team.p]; n[idx].name = e.target.value; team.s(n);
                      }} className="h-10 bg-black border-slate-700 text-white font-medium" />
                    </div>
                    <Button variant={player.isGoalkeeper ? "default" : "outline"} className={`mt-4 h-10 px-4 font-bold ${player.isGoalkeeper ? "bg-green-600 text-white" : "border-slate-700 text-slate-400"}`} onClick={() => {
                      const n = [...team.p]; n[idx].isGoalkeeper = !n[idx].isGoalkeeper; team.s(n);
                    }}>GK</Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- RENDER: MODO PARTIDO ---
  return (
    <div className="flex flex-col h-screen w-full bg-[#020617] text-white overflow-hidden font-sans">
      
      {/* 1. SCOREBOARD SUPERIOR */}
      <div className="bg-slate-900/90 border-b-2 border-white/5 p-4 flex items-center justify-between shrink-0 shadow-2xl z-50">
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">LOCAL</span>
          <span className="text-5xl font-black italic tabular-nums">{score.local}</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-black/80 px-8 py-2 rounded-xl border-2 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <span className="font-mono text-4xl font-black text-green-400 tabular-nums tracking-widest leading-none">
              {formatTime(time)}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="xs" variant="ghost" className="h-6 text-[10px] text-slate-500 hover:text-white" onClick={() => setGameState("setup")}>EDITAR EQUIPOS</Button>
            <Button size="xs" className={`h-6 text-[10px] font-black tracking-widest px-4 ${isRunning ? 'bg-red-500' : 'bg-green-600'}`} onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? "PAUSAR" : "INICIAR"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">VISITANTE</span>
          <span className="text-5xl font-black italic tabular-nums">{score.visitor}</span>
        </div>
      </div>

      <div className="flex-1 flex gap-2 p-2 overflow-hidden min-h-0">
        
        {/* 2. PANEL IZQUIERDO: JUGADORES A + PORTERÍA LOCAL */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div className={`flex-1 rounded-2xl border-2 border-blue-500/30 bg-blue-950/10 p-4 flex flex-col min-h-0 overflow-hidden ${selectedPlayer?.team === 'B' ? 'opacity-20 pointer-events-none' : ''}`}>
            <h2 className="font-black text-blue-400 text-xs mb-3 flex items-center gap-2 uppercase italic tracking-tighter">
              <Trophy size={14}/> Plantilla Local (A)
            </h2>
            <div className="grid grid-cols-4 gap-2 overflow-y-auto custom-scrollbar flex-1 content-start">
              {playersA.map(p => (
                <Button key={p.number} onClick={() => {setSelectedPlayer({team:'A', number:p.number}); setWizardStep('actions')}} 
                  className={`h-16 flex flex-col font-black rounded-xl border-b-4 shadow-lg ${
                    selectedPlayer?.number === p.number && selectedPlayer.team === 'A' 
                    ? 'bg-white text-blue-800 border-blue-900' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-900'
                  }`}>
                  <span className="text-2xl leading-none italic">{p.number}</span>
                  <span className="text-[8px] font-bold opacity-70 truncate w-full px-1">{p.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* PORTERÍA LOCAL ESTÁTICA */}
          <div className="h-[35%] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-inner">
            <div className="bg-slate-800 p-2 flex justify-between items-center border-b border-slate-700 shrink-0">
              <span className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-tighter italic">
                <Shield size={14}/> Estadísticas Portería Local
              </span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white transition-colors">
                    <Maximize2 size={16}/>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-950 border-slate-800 max-w-4xl aspect-video p-6 flex flex-col">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl text-white font-black italic uppercase tracking-tighter flex items-center gap-4">
                      <Target className="text-blue-500" size={32}/> Análisis de Impacto en Portería
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 min-h-0"><PorteriaStats events={events}/></div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex-1 p-2"><PorteriaStats events={events}/></div>
          </div>
        </div>

        {/* 3. PANEL CENTRAL: ACCIONES O ESTADÍSTICAS */}
        <div className="w-full md:w-[420px] flex flex-col gap-2 min-h-0">
          {selectedPlayer ? (
            /* WIZARD DE ACCIÓN DINÁMICO */
            <div className={`flex-1 flex flex-col rounded-2xl border-2 p-5 shadow-2xl relative overflow-hidden transition-all duration-300 ${
              selectedPlayer.team === 'A' ? 'bg-blue-950/90 border-blue-500 shadow-blue-500/20' : 'bg-amber-950/90 border-amber-500 shadow-amber-500/20'
            }`}>
              <Button variant="ghost" size="sm" className="absolute top-3 right-3 text-white/40 hover:text-white" onClick={() => setSelectedPlayer(null)}>
                <XCircle size={24}/>
              </Button>

              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/10 mb-6 shrink-0">
                <div className="bg-white text-slate-900 w-12 h-12 rounded-lg flex items-center justify-center text-3xl font-black italic leading-none shadow-inner">
                  {selectedPlayer.number}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Registrando</span>
                  <span className="text-green-400 font-black text-2xl italic uppercase tracking-tighter">
                    {currentAction || "Selecciona Acción"}
                  </span>
                </div>
              </div>

              {wizardStep === 'actions' ? (
                /* PASO 1: SELECCIÓN DE ACCIÓN */
                <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto content-start pb-4 custom-scrollbar">
                  <Button className="h-24 bg-green-600 hover:bg-green-500 text-white font-black text-3xl col-span-2 shadow-xl border-b-4 border-green-900 transition-transform active:scale-95" 
                    onClick={() => {setCurrentAction('GOL'); setWizardStep('details')}}>GOL</Button>
                  <Button className="h-16 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg border-b-4 border-blue-900" 
                    onClick={() => {setCurrentAction('PARADA'); setWizardStep('details')}}>PARADA</Button>
                  <Button className="h-16 bg-amber-600 hover:bg-amber-500 text-white font-black text-lg border-b-4 border-amber-900" 
                    onClick={() => {setCurrentAction('FUERA'); setWizardStep('details')}}>FUERA</Button>
                  <Button className="h-14 bg-red-600 hover:bg-red-500 text-white font-black col-span-2 text-xs border-b-4 border-red-900" 
                    onClick={() => {setCurrentAction('PÉRDIDA'); setWizardStep('losses')}}>PÉRDIDA / ERROR / PASOS</Button>
                  <Button className="h-12 bg-slate-700 hover:bg-slate-600 text-white font-bold col-span-2 text-xs" 
                    onClick={() => {setCurrentAction('FALTA'); setWizardStep('details')}}>FALTA / SANCIÓN</Button>
                </div>
              ) : wizardStep === 'losses' ? (
                /* PASO 2B: TIPOS DE PÉRDIDA */
                <div className="flex-1 flex flex-col min-h-0">
                   <Button variant="ghost" size="xs" className="self-start text-[10px] text-white/40 mb-4 uppercase font-black" onClick={() => setWizardStep('actions')}>
                      <ArrowLeft size={12} className="mr-2"/> Volver a Acciones
                   </Button>
                   <div className="grid grid-cols-1 gap-2 overflow-y-auto custom-scrollbar pr-1 pb-4">
                      {LOSS_TYPES.map(type => (
                        <Button key={type} className="h-12 bg-black/40 hover:bg-red-600 text-white text-xs font-black justify-start px-6 rounded-lg transition-colors"
                          onClick={() => handleActionRecord(type)}>
                          {type.toUpperCase()}
                        </Button>
                      ))}
                   </div>
                </div>
              ) : (
                /* PASO 2A: DETALLES ESTADÍSTICOS */
                <div className="flex-1 flex flex-col min-h-0">
                  <Button variant="ghost" size="xs" className="self-start text-[10px] text-white/40 mb-4 font-black uppercase" onClick={() => setWizardStep('actions')}>
                    <ArrowLeft size={12} className="mr-2"/> Volver
                  </Button>
                  <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar pb-24">
                    <section>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3">Defensa Rival</label>
                      <div className="grid grid-cols-3 gap-2">
                        {DEFENSE_TYPES.map(d => (
                          <Button key={d} size="sm" variant={details.defense === d ? "default" : "outline"} 
                            className={`h-10 text-[10px] font-black border-white/10 ${details.defense === d ? "bg-white text-black" : "text-white/70"}`}
                            onClick={() => setDetails({...details, defense: d})}>{d}</Button>
                        ))}
                      </div>
                    </section>
                    <section>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3">Situación Juego</label>
                      <div className="grid grid-cols-2 gap-2">
                        {GAME_SITUATIONS.map(s => (
                          <Button key={s} size="sm" variant={details.situation === s ? "default" : "outline"} 
                            className={`h-10 text-[9px] font-black border-white/10 ${details.situation === s ? "bg-white text-black" : "text-white/70"}`}
                            onClick={() => setDetails({...details, situation: s})}>{s}</Button>
                        ))}
                      </div>
                    </section>
                    <section className="bg-black/30 p-4 rounded-2xl border border-white/5">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-4 text-center">Zona Portería (1-9)</label>
                      <div className="grid grid-cols-3 gap-2 aspect-square max-w-[150px] mx-auto">
                        {GOAL_ZONES.map(z => (
                          <Button key={z} variant={details.goalZone === z ? "default" : "ghost"} 
                            className={`h-full text-2xl font-black border border-white/5 ${details.goalZone === z ? "bg-green-500 text-white shadow-lg" : "text-white/20"}`}
                            onClick={() => setDetails({...details, goalZone: z})}>{z}</Button>
                        ))}
                      </div>
                    </section>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900 p-2 rounded-xl">
                    <Button className="w-full bg-green-500 hover:bg-green-400 text-white font-black h-14 text-xl italic uppercase shadow-2xl" 
                      disabled={!details.defense || !details.goalZone} onClick={() => handleActionRecord()}>
                      Confirmar Datos
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* PANEL CENTRAL: ESTADÍSTICAS TIEMPO REAL (DISEÑO CAPTURA) */
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
              <div className="bg-green-600 p-4 flex items-center gap-3 justify-center shrink-0 shadow-lg">
                <Activity size={20} className="text-white"/>
                <span className="font-black text-sm text-white uppercase italic tracking-tighter">Estadísticas en Tiempo Real</span>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between text-[11px] font-black text-slate-500 px-3 italic uppercase shrink-0">
                  <span>EQUIPO A</span>
                  <span>MARCADOR TÉCNICO</span>
                  <span>EQUIPO B</span>
                </div>
                
                {[
                  { label: "Paradas", a: events.filter(e=>e.team==='A' && e.action==='PARADA').length, b: events.filter(e=>e.team==='B' && e.action==='PARADA').length },
                  { label: "Pérdidas", a: events.filter(e=>e.team==='A' && e.action==='PÉRDIDA').length, b: events.filter(e=>e.team==='B' && e.action==='PÉRDIDA').length },
                  { label: "Exclusiones (2')", a: 0, b: 0 },
                  { label: "Lanzamientos 7M", a: 0, b: 0 },
                  { label: "Posesiones", a: 0, b: 0 },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center bg-black/40 rounded-xl p-4 border border-white/5 shadow-inner transition-colors hover:bg-black/60">
                    <span className="w-12 text-center font-black text-blue-400 text-2xl italic leading-none">{stat.a}</span>
                    <span className="flex-1 text-center text-[11px] font-black text-slate-400 uppercase tracking-tighter mx-2">{stat.label}</span>
                    <span className="w-12 text-center font-black text-amber-400 text-2xl italic leading-none">{stat.b}</span>
                  </div>
                ))}

                <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-slate-700 shrink-0">
                  <Button className="bg-green-600 hover:bg-green-500 text-white font-black uppercase italic h-14 text-xs shadow-lg">Informe Ejecutivo</Button>
                  <Button className="bg-amber-600 hover:bg-amber-500 text-white font-black uppercase italic h-14 text-xs shadow-lg">Descargar CSV</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. PANEL DERECHO: JUGADORES B (ÁMBAR) */}
        <div className={`flex-1 rounded-2xl border-2 border-amber-500/30 bg-amber-950/10 p-4 flex flex-col min-h-0 overflow-hidden ${selectedPlayer?.team === 'A' ? 'opacity-20 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-end gap-2 mb-3 shrink-0">
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest leading-none italic">Plantilla Visitante (B)</span>
            <Trophy size={14} className="text-amber-400"/>
          </div>
          <div className="grid grid-cols-4 gap-2 overflow-y-auto custom-scrollbar flex-1 content-start">
            {playersB.map(p => (
              <Button key={p.number} onClick={() => {setSelectedPlayer({team:'B', number:p.number}); setWizardStep('actions')}} 
                className={`h-16 flex flex-col font-black rounded-xl border-b-4 shadow-lg ${
                  selectedPlayer?.number === p.number && selectedPlayer.team === 'B' 
                  ? 'bg-white text-amber-800 border-amber-900' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-900'
                }`}>
                <span className="text-2xl leading-none italic">{p.number}</span>
                <span className="text-[8px] font-bold opacity-70 truncate w-full px-1">{p.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. FOOTER: LIVE FEED DINÁMICO */}
      <div className="h-10 bg-black/95 border-t border-white/10 flex items-center gap-6 px-6 overflow-x-auto whitespace-nowrap shrink-0 scrollbar-hide shadow-inner">
        <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase italic">
          <History size={14}/> Live Match Feed:
        </div>
        <div className="flex gap-8 items-center">
          {events.slice(0, 10).map(e => (
            <div key={e.id} className="flex items-center gap-2">
              <span className="text-[10px] text-green-500 font-mono font-bold">[{formatTime(e.timestamp)}]</span>
              <span className={`text-[11px] font-black italic ${e.team === 'A' ? 'text-blue-400' : 'text-amber-400'}`}>
                #{e.player} {e.action} {(e as any).specificAction ? `- ${(e as any).specificAction}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

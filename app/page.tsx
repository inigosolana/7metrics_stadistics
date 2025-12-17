"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Trophy, Play, Edit2, XCircle, Activity, History, Shield, ArrowLeft, Maximize2, Users, Target, Settings2
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// --- 1. CONSTANTES TÉCNICAS (BALONMANO PROFESIONAL) ---
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

type GameState = "setup" | "playing"

// --- 3. COMPONENTE: PORTERÍA LOCAL ESTÁTICA ---
const PorteriaStats = ({ events }: { events: Event[] }) => {
  const getZoneStats = (zone: number) => {
    // Tiros recibidos por el portero Local (A) o lanzados por el equipo B
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
          <div key={z} className="relative flex flex-col items-center justify-center border border-slate-700/50 rounded bg-slate-900/90 overflow-hidden shadow-inner">
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
  const [gameState, setGameState] = useState<GameState>("setup")
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [score, setScore] = useState({ local: 0, visitor: 0 })
  
  // Plantillas configurables antes del partido
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
    if (isRunning) {
      interval = setInterval(() => setTime((t) => t + 1), 1000)
    }
    return () => { if (interval) clearInterval(interval) }
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
    setSelectedPlayer(null)
    setWizardStep("actions")
    setCurrentAction(null)
    setDetails({ defense: "", courtZone: "", goalZone: 0, situation: "" })
  }

  // --- RENDER: SETUP (AJUSTE DE PANTALLA Y ZOOM) ---
  if (gameState === "setup") {
    return (
      <div className="h-screen w-full bg-[#020617] text-slate-100 flex flex-col p-4 md:p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-blue-500 leading-none">HB-ANALYTICS PRO</h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Software de Análisis Técnico de Balonmano</p>
          </div>
          <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white px-10 h-14 gap-3 font-black text-xl italic shadow-lg transition-transform active:scale-95" onClick={() => setGameState("playing")}>
            <Play className="w-5 h-5 fill-current" /> EMPEZAR PARTIDO
          </Button>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 overflow-hidden">
          {[ { t: "A", p: playersA, s: setPlayersA, n: "Plantilla Local (A)", c: "border-blue-500 bg-blue-950/20" },
             { t: "B", p: playersB, s: setPlayersB, n: "Plantilla Visitante (B)", c: "border-amber-500 bg-amber-950/20" } 
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
                      <label className="text-[9px] text-slate-500 font-black block mb-1 ml-1 uppercase">Nombre Completo</label>
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

  // --- RENDER: MODO PARTIDO (DASHBOARD DINÁMICO) ---
  return (
    <div className="flex flex-col h-screen w-full bg-[#020617] text-white overflow-hidden font-sans">
      
      {/* Marcador Superior */}
      <div className="bg-slate-900/95 border-b-2 border-white/5 p-4 flex items-center justify-between shrink-0 shadow-2xl z-50">
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">LOCAL</span>
          <span className="text-5xl font-black italic tabular-nums leading-none">{score.local}</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-black/80 px-8 py-2 rounded-xl border-2 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <span className="font-mono text-4xl font-black text-green-400 tabular-nums tracking-widest leading-none">
              {formatTime(time)}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="xs" variant="ghost" className="h-6 text-[10px] text-slate-500 hover:text-white" onClick={() => setGameState("setup")}>EDITAR EQUIPOS</Button>
            <Button size="xs" className={`h-6 text-[10px] font-black tracking-widest px-4 ${isRunning ? 'bg-red-500' : 'bg-green-600'}`} onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? "PAUSA" : "INICIAR"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">VISITANTE</span>
          <span className="text-5xl font-black italic tabular-nums leading-none">{score.visitor}</span>
        </div>
      </div>

      <div className="flex-1 flex gap-2 p-2 overflow-hidden min-h-0">
        
        {/* PANEL IZQUIERDO: JUGADORES A + PORTERÍA LOCAL */}
        <div className="flex-1 flex flex-col gap-2 min-h-0 h-full">
          <div className={`flex-1 rounded-2xl border-2 border-blue-500/30 bg-blue-950/10 p-4 flex flex-col min-h-0 overflow-hidden transition-opacity ${selectedPlayer?.team === 'B' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            <h2 className="font-black text-blue-400 text-xs mb-3 flex items-center gap-2 uppercase italic tracking-tighter shrink-0">
              <Trophy size={14}/> L-LOCAL
            </h2>
            {/* Si hay jugador seleccionado, la cuadrícula desaparece y muestra el dorsal pequeño arriba */}
            {selectedPlayer?.team === 'A' ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl border border-white/20 mb-4 shrink-0">
                  <div className="bg-white text-blue-900 w-12 h-12 rounded-lg flex items-center justify-center text-3xl font-black italic shadow-inner">{selectedPlayer.number}</div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-white/40 font-black uppercase mb-1">Dorsal Seleccionado</span>
                    <span className="text-blue-400 font-black text-lg uppercase italic">{playersA.find(p => p.number === selectedPlayer.number)?.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPlayer(null)} className="ml-auto text-white/50 hover:text-white"><XCircle/></Button>
                </div>
                <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto content-start pb-4">
                  <Button className="h-20 bg-green-600 text-white font-black text-2xl col-span-2 border-b-4 border-green-800" onClick={() => {setCurrentAction('GOL'); setWizardStep('details')}}>GOL</Button>
                  <Button className="h-16 bg-blue-600 text-white font-black text-lg border-b-4 border-blue-800" onClick={() => {setCurrentAction('PARADA'); setWizardStep('details')}}>PARADA</Button>
                  <Button className="h-16 bg-orange-600 text-white font-black text-lg border-b-4 border-orange-800" onClick={() => {setCurrentAction('FUERA'); setWizardStep('details')}}>FUERA</Button>
                  <Button className="h-14 bg-red-600 text-white font-black col-span-2 text-xs border-b-4 border-red-800" onClick={() => {setCurrentAction('PÉRDIDA'); setWizardStep('losses')}}>PÉRDIDA / ERROR</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 overflow-y-auto custom-scrollbar flex-1 content-start">
                {playersA.map(p => (
                  <Button key={p.number} onClick={() => setSelectedPlayer({team:'A', number:p.number})} 
                    className="h-16 flex flex-col font-black rounded-xl border-b-4 bg-blue-600 hover:bg-blue-500 text-white border-blue-900">
                    <span className="text-2xl leading-none italic">{p.number}</span>
                    <span className="text-[8px] font-bold opacity-80 truncate w-full px-1 leading-tight">{p.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          {/* PORTERÍA LOCAL ESTÁTICA Y AMPLIABLE */}
          <div className="h-[40%] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-inner shrink-0">
            <div className="bg-slate-800 p-2 flex justify-between items-center border-b border-slate-700 shrink-0">
              <span className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-tighter italic">
                <Shield size={14}/> PORTERÍA LOCAL
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
                      <Target className="text-blue-500" size={32}/> ANÁLISIS IMPACTO PORTERÍA LOCAL
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 min-h-0"><PorteriaStats events={events}/></div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex-1 p-2"><PorteriaStats events={events}/></div>
          </div>
        </div>

        {/* PANEL CENTRAL: ESTADÍSTICAS O DETALLES DE ACCIÓN */}
        <div className="w-full md:w-[420px] flex flex-col gap-2 min-h-0 h-full">
          {selectedPlayer && wizardStep !== 'actions' ? (
            /* WIZARD DE DETALLES (ZONAS Y DEFENSA) */
            <div className={`flex-1 flex flex-col rounded-2xl border-2 p-5 shadow-2xl relative overflow-hidden ${selectedPlayer.team === 'A' ? 'bg-blue-950 border-blue-500' : 'bg-amber-950 border-amber-500'}`}>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/10 mb-6 shrink-0">
                <div className="bg-white text-slate-900 w-12 h-12 rounded-lg flex items-center justify-center text-3xl font-black italic shadow-inner">{selectedPlayer.number}</div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-white/40 font-black uppercase mb-1">Registrando</span>
                  <span className="text-green-400 font-black text-2xl italic uppercase tracking-tighter">{currentAction}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar pb-24">
                {wizardStep === 'losses' ? (
                  <div className="grid grid-cols-1 gap-2">
                    {LOSS_TYPES.map(type => (
                      <Button key={type} className="h-12 bg-black/40 hover:bg-red-600 text-white text-xs font-black justify-start px-6 rounded-lg" onClick={() => handleActionRecord(type)}>
                        {type.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <>
                    <section>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3">Defensa Rival</label>
                      <div className="grid grid-cols-3 gap-2">
                        {DEFENSE_TYPES.map(d => (
                          <Button key={d} size="sm" variant={details.defense === d ? "default" : "outline"} 
                            // CORRECCIÓN: Texto negro (slate-900) cuando el fondo es blanco (seleccionado)
                            className={`h-10 text-[10px] font-black border-white/10 ${details.defense === d ? "bg-white text-slate-900" : "text-white/70"}`}
                            onClick={() => setDetails({...details, defense: d})}>{d}</Button>
                        ))}
                      </div>
                    </section>
                    <section>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3">Zona Lanzamiento</label>
                      <div className="grid grid-cols-3 gap-2">
                        {COURT_ZONES.map(z => (
                          <Button key={z} size="sm" variant={details.courtZone === z ? "default" : "outline"} 
                            className={`h-10 text-[8px] font-black leading-tight border-white/10 ${details.courtZone === z ? "bg-white text-slate-900" : "text-white/70"}`}
                            onClick={() => setDetails({...details, courtZone: z})}>{z}</Button>
                        ))}
                      </div>
                    </section>
                    <section className="bg-black/40 p-4 rounded-2xl border border-white/5">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-4 text-center">Zona Portería (1-9)</label>
                      <div className="grid grid-cols-3 gap-2 aspect-square max-w-[150px] mx-auto bg-black/60 p-1 rounded-lg">
                        {GOAL_ZONES.map(z => (
                          <Button key={z} variant={details.goalZone === z ? "default" : "ghost"} 
                            className={`h-full text-2xl font-black border border-white/5 ${details.goalZone === z ? "bg-green-500 text-white shadow-lg" : "text-white/20"}`}
                            onClick={() => setDetails({...details, goalZone: z})}>{z}</Button>
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                <Button className="w-full bg-green-500 hover:bg-green-400 text-white font-black h-14 text-xl italic uppercase shadow-2xl" disabled={!details.defense || !details.goalZone} onClick={() => handleActionRecord()}>Confirmar Datos</Button>
              </div>
            </div>
          ) : (
            /* PANEL ESTADÍSTICAS CENTRAL (DISEÑO CAPTURA) */
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl h-full">
              <div className="bg-green-600 p-4 flex items-center gap-3 justify-center shrink-0 shadow-lg">
                <Activity size={20} className="text-white"/>
                <span className="font-black text-sm text-white uppercase italic tracking-tighter">Estadísticas en Tiempo Real</span>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between text-[11px] font-black text-slate-500 px-3 italic uppercase shrink-0">
                  <span>EQUIPO A</span>
                  <span>MÉTRICAS DEL PARTIDO</span>
                  <span>EQUIPO B</span>
                </div>
                {[
                  { label: "Paradas", a: events.filter(e=>e.team==='A' && e.action==='PARADA').length, b: events.filter(e=>e.team==='B' && e.action==='PARADA').length },
                  { label: "Pérdidas", a: events.filter(e=>e.team==='A' && e.action==='PÉRDIDA').length, b: events.filter(e=>e.team==='B' && e.action==='PÉRDIDA').length },
                  { label: "Lanzamientos 7M", a: 0, b: 0 },
                  { label: "Exclusiones 2'", a: 0, b: 0 },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center bg-black/40 rounded-xl p-4 border border-white/5 shadow-inner hover:bg-black/60 transition-colors">
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

        {/* PANEL DERECHO: JUGADORES B (ÁMBAR) */}
        <div className={`flex-1 rounded-2xl border-2 border-amber-500/30 bg-amber-950/10 p-4 flex flex-col min-h-0 overflow-hidden transition-opacity ${selectedPlayer?.team === 'A' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center justify-end gap-2 mb-3 shrink-0">
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest leading-none italic">Plantilla Visitante (B)</span>
            <Trophy size={14} className="text-amber-400"/>
          </div>
          {selectedPlayer?.team === 'B' ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl border border-white/20 mb-4 shrink-0">
                  <div className="bg-white text-amber-900 w-12 h-12 rounded-lg flex items-center justify-center text-3xl font-black italic shadow-inner">{selectedPlayer.number}</div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-white/40 font-black uppercase mb-1">Dorsal Seleccionado</span>
                    <span className="text-amber-400 font-black text-lg uppercase italic">{playersB.find(p => p.number === selectedPlayer.number)?.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPlayer(null)} className="ml-auto text-white/50 hover:text-white"><XCircle/></Button>
                </div>
                <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto content-start pb-4">
                  <Button className="h-20 bg-green-600 text-white font-black text-3xl col-span-2 border-b-4 border-green-800" onClick={() => {setCurrentAction('GOL'); setWizardStep('details')}}>GOL</Button>
                  <Button className="h-16 bg-blue-600 text-white font-black text-lg border-b-4 border-blue-800" onClick={() => {setCurrentAction('PARADA'); setWizardStep('details')}}>PARADA</Button>
                  <Button className="h-16 bg-orange-600 text-white font-black text-lg border-b-4 border-orange-800" onClick={() => {setCurrentAction('FUERA'); setWizardStep('details')}}>FUERA</Button>
                  <Button className="h-14 bg-red-600 text-white font-black col-span-2 text-xs border-b-4 border-red-800" onClick={() => {setCurrentAction('PÉRDIDA'); setWizardStep('losses')}}>PÉRDIDA / ERROR</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 overflow-y-auto custom-scrollbar flex-1 content-start">
                {playersB.map(p => (
                  <Button key={p.number} onClick={() => setSelectedPlayer({team:'B', number:p.number})} 
                    className="h-16 flex flex-col font-black rounded-xl border-b-4 bg-amber-600 hover:bg-amber-500 text-white border-amber-900">
                    <span className="text-2xl leading-none italic">{p.number}</span>
                    <span className="text-[8px] font-bold opacity-80 truncate w-full px-1 leading-tight">{p.name}</span>
                  </Button>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* FOOTER: LIVE FEED */}
      <div className="h-10 bg-black/95 border-t border-white/10 flex items-center gap-6 px-6 overflow-x-auto whitespace-nowrap shrink-0 scrollbar-hide shadow-inner">
        <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase italic">
          <History size={14}/> LIVE FEED:
        </div>
        <div className="flex gap-8 items-center italic">
          {events.slice(0, 10).map(e => (
            <div key={e.id} className="flex items-center gap-2">
              <span className="text-[10px] text-green-500 font-mono font-bold">[{formatTime(e.timestamp)}]</span>
              <span className={`text-[11px] font-black italic ${e.team === 'A' ? 'text-blue-400' : 'text-amber-400'}`}>
                #{e.player} {e.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

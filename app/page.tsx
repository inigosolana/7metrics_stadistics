"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Trophy, Play, Edit2, XCircle, Activity, History, Shield, ArrowLeft, Target, Users, Settings2
} from "lucide-react"

// --- CONSTANTES ---
const COURT_ZONES = [
  "Extremo Izq", "Lateral Izq", "Central", "Lateral Der", "Extremo Der", 
  "Pivote (6m)", "Línea 9m Izq", "Línea 9m Centro", "Línea 9m Der"
]
const LOSS_TYPES = ["Error Pase", "Error Recepción", "Pasos", "Pisando", "Falta en Ataque"]
const DEFENSE_TYPES = ["6:0", "5:1", "3:2:1", "4:2", "Mixta", "Presión Toda", "Otro"]
const GAME_SITUATIONS = [
  "Igualdad (6x6)", "Superioridad (6x5)", "Ataque 7x6", "Inferioridad (5x6)", "Contraataque", "Segunda Oleada"
]

// --- TIPOS ---
type Player = { number: number; name: string; isGoalkeeper: boolean }
type Event = { 
  id: string; timestamp: number; player: number; team: "A" | "B"; 
  action: string; courtZone?: string; goalZone?: number; defenseType?: string; 
  specificAction?: string; situation?: string 
}

export default function HandballTracker() {
  const [gameState, setGameState] = useState<"setup" | "playing">("setup")
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [score, setScore] = useState({ local: 0, visitor: 0 })
  
  const [playersA, setPlayersA] = useState<Player[]>(
    Array.from({ length: 14 }, (_, i) => ({ number: i + 1, name: `Jugador ${i + 1}`, isGoalkeeper: i === 0 }))
  )
  const [playersB, setPlayersB] = useState<Player[]>(
    Array.from({ length: 14 }, (_, i) => ({ number: i + 1, name: `Oponente ${i + 1}`, isGoalkeeper: i === 0 }))
  )
  
  const [selectedPlayer, setSelectedPlayer] = useState<{ team: "A" | "B", number: number } | null>(null)
  const [wizardStep, setWizardStep] = useState<"actions" | "details">("actions")
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [details, setDetails] = useState({ defense: "", courtZone: "", goalZone: 0, situation: "" })

  // CRONÓMETRO
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

  const handleActionComplete = () => {
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
      ...details
    }

    setEvents([newEvent, ...events])
    setSelectedPlayer(null)
    setWizardStep("actions")
    setDetails({ defense: "", courtZone: "", goalZone: 0, situation: "" })
  }

  // --- INTERFAZ: SETUP ---
  if (gameState === "setup") {
    return (
      <div className="h-screen w-full bg-[#020617] text-white flex flex-col p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-black italic text-blue-500 tracking-tighter leading-none">HB-ANALYTICS PRO</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Software de Análisis Técnico</p>
          </div>
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-500 text-white font-black px-8 h-14 italic text-lg shadow-xl"
            onClick={() => setGameState("playing")}
          >
            <Play className="mr-2 fill-current" /> EMPEZAR PARTIDO
          </Button>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-hidden">
          {[ { t: "A", p: playersA, s: setPlayersA, n: "LOCAL", c: "border-blue-500 bg-blue-950/10" },
             { t: "B", p: playersB, s: setPlayersB, n: "VISITANTE", c: "border-amber-500 bg-amber-950/10" } 
          ].map((team) => (
            <div key={team.t} className={`flex flex-col rounded-xl border-2 ${team.c} p-4 min-h-0`}>
              <h3 className="font-black text-xl mb-4 italic flex items-center gap-2">
                <Users size={20}/> PLANTILLA {team.n}
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {team.p.map((player, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-black/40 p-2 rounded-lg border border-white/5">
                    <div className="w-16">
                      <span className="text-[9px] text-slate-500 font-bold block ml-1 uppercase">Dorsal</span>
                      <Input 
                        type="number" 
                        value={player.number} 
                        onChange={e => {
                          const n = [...team.p]; n[idx].number = parseInt(e.target.value) || 0; team.s(n);
                        }} 
                        className="bg-slate-800 border-none text-white text-center font-bold h-9" 
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] text-slate-500 font-bold block ml-1 uppercase">Nombre</span>
                      <Input 
                        value={player.name} 
                        onChange={e => {
                          const n = [...team.p]; n[idx].name = e.target.value; team.s(n);
                        }} 
                        className="bg-slate-800 border-none text-white h-9" 
                      />
                    </div>
                    <Button 
                      className={`mt-4 h-9 ${player.isGoalkeeper ? "bg-green-600 text-white" : "bg-slate-700 text-slate-400"}`} 
                      onClick={() => {
                        const n = [...team.p]; n[idx].isGoalkeeper = !n[idx].isGoalkeeper; team.s(n);
                      }}
                    >GK</Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- INTERFAZ: PARTIDO ---
  return (
    <div className="flex flex-col h-screen w-full bg-[#020617] text-white overflow-hidden">
      
      {/* Marcador Superior */}
      <div className="bg-slate-900 border-b-2 border-white/5 p-3 flex items-center justify-between shrink-0 shadow-2xl relative">
        <div className="flex flex-col items-start min-w-[100px]">
          <span className="text-[10px] font-black text-blue-400 tracking-tighter">EQUIPO LOCAL</span>
          <span className="text-5xl font-black italic leading-none">{score.local}</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-black px-6 py-2 rounded-xl border border-green-500/30 text-4xl font-mono text-green-400 font-bold tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            {formatTime(time)}
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="xs" variant="ghost" className="h-6 text-[10px] bg-white/5" onClick={() => setGameState("setup")}>EDITAR</Button>
            <Button size="xs" className={`h-6 text-[10px] font-bold ${isRunning ? 'bg-red-500' : 'bg-green-600'}`} onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? "PAUSA" : "INICIO"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-end min-w-[100px]">
          <span className="text-[10px] font-black text-amber-400 tracking-tighter">EQUIPO VISITANTE</span>
          <span className="text-5xl font-black italic leading-none">{score.visitor}</span>
        </div>
      </div>

      <div className="flex-1 flex gap-2 p-2 overflow-hidden min-h-0">
        
        {/* PANEL LOCAL (AZUL) */}
        <div className={`flex-1 rounded-xl border-2 border-blue-500/30 bg-blue-900/10 p-3 flex flex-col min-h-0 ${selectedPlayer?.team === 'B' ? 'opacity-20 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <Trophy size={14} className="text-blue-400"/>
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest leading-none">L-LOCAL</span>
          </div>
          <div className="grid grid-cols-4 gap-2 overflow-y-auto custom-scrollbar flex-1 content-start">
            {playersA.map(p => (
              <Button 
                key={p.number} 
                onClick={() => {setSelectedPlayer({team:'A', number:p.number}); setWizardStep('actions')}} 
                className={`h-14 flex flex-col font-black rounded-lg border-b-4 ${
                  selectedPlayer?.number === p.number && selectedPlayer.team === 'A' 
                  ? 'bg-white text-blue-700 border-blue-900' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-800'
                }`}
              >
                <span className="text-xl leading-none italic">{p.number}</span>
                <span className="text-[7px] font-bold opacity-70 uppercase truncate w-full px-1">{p.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* PANEL CENTRAL: ACCIONES O ESTADÍSTICAS */}
        <div className="w-full md:w-[420px] flex flex-col gap-2 min-h-0 relative">
          
          {selectedPlayer ? (
            /* WIZARD DE ACCIÓN */
            <div className={`flex-1 flex flex-col rounded-xl border-2 p-4 shadow-2xl relative overflow-hidden ${
              selectedPlayer.team === 'A' ? 'bg-blue-950/90 border-blue-500' : 'bg-amber-950/90 border-amber-500'
            }`}>
              <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-white/50 hover:text-white" onClick={() => setSelectedPlayer(null)}>
                <XCircle size={20}/>
              </Button>

              {/* Encabezado del Jugador */}
              <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/10 mb-4 shrink-0">
                <div className="bg-white text-slate-900 w-10 h-10 rounded flex items-center justify-center text-xl font-black italic leading-none">{selectedPlayer.number}</div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Registrando</span>
                  <span className="text-green-400 font-black text-lg italic uppercase">{currentAction || "SELECCIONA ACCIÓN"}</span>
                </div>
              </div>

              {wizardStep === 'actions' ? (
                <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto content-start pb-4">
                  <Button className="h-20 bg-green-600 hover:bg-green-500 text-white font-black text-3xl col-span-2 shadow-lg border-b-4 border-green-800" onClick={() => {setCurrentAction('GOL'); setWizardStep('details')}}>GOL</Button>
                  <Button className="h-16 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg" onClick={() => {setCurrentAction('PARADA'); setWizardStep('details')}}>PARADA</Button>
                  <Button className="h-16 bg-amber-600 hover:bg-amber-500 text-white font-black text-lg" onClick={() => {setCurrentAction('FUERA'); setWizardStep('details')}}>FUERA</Button>
                  <Button className="h-12 bg-red-600 hover:bg-red-500 text-white font-bold col-span-2 text-xs" onClick={() => {setCurrentAction('PÉRDIDA'); setWizardStep('details')}}>PÉRDIDA / ERROR</Button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                   <Button variant="ghost" size="xs" className="self-start text-[10px] text-white/40 mb-2" onClick={() => setWizardStep('actions')}>
                      <ArrowLeft size={10} className="mr-1"/> VOLVER A ACCIONES
                   </Button>
                   <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                      <section>
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-2">Defensa Rival</label>
                        <div className="grid grid-cols-3 gap-1">
                          {DEFENSE_TYPES.map(d => (
                            <Button key={d} size="sm" variant={details.defense === d ? "default" : "outline"} 
                              className={`h-8 text-[9px] border-white/10 ${details.defense === d ? "bg-white text-black font-black" : "text-white"}`}
                              onClick={() => setDetails({...details, defense: d})}>{d}</Button>
                          ))}
                        </div>
                      </section>
                      <section>
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-2">Zona de Campo</label>
                        <div className="grid grid-cols-3 gap-1">
                          {COURT_ZONES.map(z => (
                            <Button key={z} size="sm" variant={details.courtZone === z ? "default" : "outline"} 
                              className={`h-8 text-[8px] border-white/10 ${details.courtZone === z ? "bg-white text-black font-black" : "text-white"}`}
                              onClick={() => setDetails({...details, courtZone: z})}>{z}</Button>
                          ))}
                        </div>
                      </section>
                      <section className="bg-black/30 p-3 rounded-lg border border-white/5">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-3 text-center">Impacto Portería</label>
                        <div className="grid grid-cols-3 gap-1 aspect-square max-w-[130px] mx-auto">
                          {[1,2,3,4,5,6,7,8,9].map(z => (
                            <Button key={z} variant={details.goalZone === z ? "default" : "ghost"} 
                              className={`h-full text-lg font-black border border-white/5 ${details.goalZone === z ? "bg-green-500 text-white" : "text-white/30"}`}
                              onClick={() => setDetails({...details, goalZone: z})}>{z}</Button>
                          ))}
                        </div>
                      </section>
                   </div>
                   <Button className="w-full bg-green-500 hover:bg-green-400 text-white font-black h-12 mt-4 text-sm" 
                    disabled={!details.courtZone || !details.defense} onClick={handleActionComplete}>
                     CONFIRMAR DATOS
                   </Button>
                </div>
              )}
            </div>
          ) : (
            /* PANEL DE ESTADÍSTICAS (CENTRO) */
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl flex flex-col overflow-hidden shadow-2xl">
              <div className="bg-green-600 p-3 flex items-center gap-2 justify-center shrink-0">
                <Activity size={16} className="text-white"/>
                <span className="font-black text-xs text-white uppercase italic leading-none">Estadísticas Tiempo Real</span>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
                <div className="flex justify-between text-[10px] font-black text-slate-500 px-2 italic shrink-0">
                  <span>EQUIPO A</span>
                  <span>MEDIDOR DE RENDIMIENTO</span>
                  <span>EQUIPO B</span>
                </div>
                
                {[
                  { label: "Paradas", a: events.filter(e=>e.team==='A' && e.action==='PARADA').length, b: events.filter(e=>e.team==='B' && e.action==='PARADA').length },
                  { label: "Pérdidas", a: events.filter(e=>e.team==='A' && e.action==='PÉRDIDA').length, b: events.filter(e=>e.team==='B' && e.action==='PÉRDIDA').length },
                  { label: "Goles Superioridad", a: 0, b: 0 },
                  { label: "Exclusiones", a: 0, b: 0 },
                  { label: "Lanzamientos 7M", a: 0, b: 0 }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center bg-black/40 rounded-lg p-3 border border-white/5 shadow-inner">
                    <span className="w-10 text-center font-black text-blue-400 text-xl italic">{stat.a}</span>
                    <span className="flex-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">{stat.label}</span>
                    <span className="w-10 text-center font-black text-amber-400 text-xl italic">{stat.b}</span>
                  </div>
                ))}

                <div className="mt-auto flex gap-2 shrink-0">
                  <Button className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black uppercase italic h-12 text-xs">Informe Ejecutivo</Button>
                  <Button className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase italic h-12 text-xs">Descargar CSV</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PANEL VISITANTE (ÁMBAR) */}
        <div className={`flex-1 rounded-xl border-2 border-amber-500/30 bg-amber-900/10 p-3 flex flex-col min-h-0 ${selectedPlayer?.team === 'A' ? 'opacity-20 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-end gap-2 mb-3 shrink-0">
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest leading-none">V-VISITANTE</span>
            <Trophy size={14} className="text-amber-400"/>
          </div>
          <div className="grid grid-cols-4 gap-2 overflow-y-auto custom-scrollbar flex-1 content-start">
            {playersB.map(p => (
              <Button 
                key={p.number} 
                onClick={() => {setSelectedPlayer({team:'B', number:p.number}); setWizardStep('actions')}} 
                className={`h-14 flex flex-col font-black rounded-lg border-b-4 ${
                  selectedPlayer?.number === p.number && selectedPlayer.team === 'B' 
                  ? 'bg-white text-amber-700 border-amber-900' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-800'
                }`}
              >
                <span className="text-xl leading-none italic">{p.number}</span>
                <span className="text-[7px] font-bold opacity-70 uppercase truncate w-full px-1">{p.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER: LIVE FEED */}
      <div className="h-10 bg-black/90 border-t border-white/10 flex items-center gap-6 px-6 overflow-x-auto whitespace-nowrap shrink-0 scrollbar-hide">
        <div className="flex items-center gap-2 text-slate-600 font-black text-[9px] uppercase italic">
          <History size={12}/> LIVE FEED:
        </div>
        <div className="flex gap-6">
          {events.slice(0, 10).map(e => (
            <div key={e.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
              <span className="text-[10px] text-green-500 font-mono font-bold">[{formatTime(e.timestamp)}]</span>
              <span className={`text-[11px] font-black ${e.team === 'A' ? 'text-blue-400' : 'text-amber-400'}`}>
                #{e.player} {e.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

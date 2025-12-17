"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Trophy, Play, Edit2, XCircle, Activity, History, Shield, ArrowLeft, Maximize2, Users, Target, Save
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// --- 1. CONSTANTES TÉCNICAS COMPLETAS ---
const COURT_ZONES = [
  "Extremo Izq", "Lateral Izq", "Central", 
  "Lateral Der", "Extremo Der", "Pivote (6m)", 
  "Línea 9m Izq", "Línea 9m Centro", "Línea 9m Der",
]

const LOSS_TYPES = ["Error Pase", "Error Recepción", "Pasos", "Pisando", "Falta en Ataque", "Dribling", "Mal Saque"]
const DEFENSE_TYPES = ["6:0", "5:1", "3:2:1", "4:2", "Mixta", "Presión Toda", "Otro"]
const GAME_SITUATIONS = ["Igualdad (6x6)", "Superioridad (6x5)", "Ataque 7x6", "Inferioridad (5x6)", "Contraataque", "Segunda Oleada"]
const GOAL_ZONES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// --- 2. DEFINICIÓN DE TIPOS ---
type Player = { number: number; name: string; isGoalkeeper: boolean }
type Event = {
  id: string; timestamp: number; player: number; team: "A" | "B";
  action: string; specificAction?: string; courtZone?: string;
  goalZone?: number; defenseType?: string; situation?: string;
}

// --- 3. COMPONENTE: PORTERÍA CENTRAL ESTÁTICA ---
const PorteriaCentral = ({ events }: { events: Event[] }) => {
  const getZoneStats = (zone: number) => {
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
            <span className="absolute top-0.5 right-1 text-[7px] text-slate-600 font-mono italic">Z{z}</span>
            <span className={`text-xl font-black italic ${stats.percent > 35 ? 'text-green-400' : 'text-white'}`}>
              {stats.total > 0 ? `${stats.percent}%` : "-"}
            </span>
            {stats.total > 0 && (
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">{stats.saves}P / {stats.goals}G</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- 4. CONTINUACIÓN DEL COMPONENTE PRINCIPAL ---
export default function HandballTracker() {
  const [gameState, setGameState] = useState<"setup" | "playing">("setup")
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [score, setScore] = useState({ local: 0, visitor: 0 })
  
  const [playersA, setPlayersA] = useState<Player[]>(Array.from({ length: 14 }, (_, i) => ({ number: i + 1, name: `Jugador ${i + 1}`, isGoalkeeper: i === 0 })))
  const [playersB, setPlayersB] = useState<Player[]>(Array.from({ length: 14 }, (_, i) => ({ number: i + 1, name: `Oponente ${i + 1}`, isGoalkeeper: i === 0 })))
  
  const [selectedPlayer, setSelectedPlayer] = useState<{ team: "A" | "B", number: number } | null>(null)
  const [wizardStep, setWizardStep] = useState<"actions" | "details" | "losses">("actions")
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [details, setDetails] = useState({ defense: "", courtZone: "", goalZone: 0, situation: "" })

  useEffect(() => {
    let interval: any = null
    if (isRunning) interval = setInterval(() => setTime((t) => t + 1), 1000)
    return () => { if (interval) clearInterval(interval) }
  }, [isRunning])

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60); const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }, [])

  const handleActionRecord = (specificAction?: string) => {
    if (!selectedPlayer || !currentAction) return
    if (currentAction === "GOL") setScore(prev => selectedPlayer.team === "A" ? { ...prev, local: prev.local + 1 } : { ...prev, visitor: prev.visitor + 1 })
    const newEvent: Event = { id: Math.random().toString(36).substring(7), timestamp: time, player: selectedPlayer.number, team: selectedPlayer.team, action: currentAction, specificAction, ...details }
    setEvents(prev => [newEvent, ...prev])
    setSelectedPlayer(null); setWizardStep("actions"); setCurrentAction(null);
    setDetails({ defense: "", courtZone: "", goalZone: 0, situation: "" })
  }

  // --- CONTINUACIÓN RENDER: SETUP ---
  if (gameState === "setup") {
    return (
      <div className="h-screen w-full bg-[#020617] text-slate-100 flex flex-col p-4 md:p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-blue-500 leading-none">HB-ANALYTICS PRO</h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 italic">Software de Análisis Técnico</p>
          </div>
          <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white px-10 h-16 gap-3 font-black text-xl italic shadow-2xl transition-transform active:scale-95" onClick={() => setGameState("playing")}>
            <Play className="w-6 h-6 fill-current" /> EMPEZAR PARTIDO
          </Button>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
          {[ { t: "A", p: playersA, s: setPlayersA, n: "Plantilla Local (A)", c: "border-blue-500 bg-blue-950/20" },
             { t: "B", p: playersB, s: setPlayersB, n: "Plantilla Visitante (B)", c: "border-amber-500 bg-amber-950/20" } 
          ].map((team) => (
            <div key={team.t} className={`flex flex-col rounded-3xl border-2 ${team.c} p-5 min-h-0 shadow-2xl`}>
              <h3 className="text-2xl font-black mb-4 flex items-center gap-3 uppercase italic text-white"><Users size={28}/> {team.n}</h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-3 custom-scrollbar">
                {team.p.map((player, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-slate-900/80 p-3 rounded-xl border border-white/5 shadow-md">
                    <div className="w-20"><label className="text-[9px] text-slate-500 font-black block mb-1 uppercase">Dorsal</label>
                      <Input type="number" value={player.number} onChange={e => { const n = [...team.p]; n[idx].number = parseInt(e.target.value) || 0; team.s(n); }} className="h-10 bg-black border-slate-700 text-center font-black text-white text-lg" />
                    </div>
                    <div className="flex-1"><label className="text-[9px] text-slate-500 font-black block mb-1 uppercase">Nombre</label>
                      <Input value={player.name} onChange={e => { const n = [...team.p]; n[idx].name = e.target.value; team.s(n); }} className="h-10 bg-black border-slate-700 text-white font-medium" />
                    </div>
                    <Button variant={player.isGoalkeeper ? "default" : "outline"} className={`mt-4 h-10 px-5 font-black italic border-2 transition-all ${player.isGoalkeeper ? "bg-green-600 border-green-400 text-white shadow-lg" : "border-slate-700 text-slate-500"}`} onClick={() => { const n = [...team.p]; n[idx].isGoalkeeper = !n[idx].isGoalkeeper; team.s(n); }}>GK</Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- RENDER: PARTIDO ---
  return (
    <div className="flex flex-col h-screen w-full bg-[#020617] text-white overflow-hidden font-sans">
      {/* Marcador Superior */}
      <div className="bg-slate-900/95 border-b-2 border-white/5 p-4 flex items-center justify-between shrink-0 shadow-2xl z-50">
        <div className="flex flex-col items-center min-w-[140px]">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">LOCAL</span>
          <span className="text-6xl font-black italic tabular-nums leading-none text-white">{score.local}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-black/90 px-10 py-3 rounded-2xl border-2 border-green-500/50 shadow-lg">
            <span className="font-mono text-5xl font-black text-green-400 tabular-nums tracking-widest leading-none italic">{formatTime(time)}</span>
          </div>
          <div className="flex gap-4 mt-3">
            <Button size="xs" variant="ghost" className="h-7 text-[10px] text-slate-500 font-black uppercase" onClick={() => setGameState("setup")}>EDITAR</Button>
            <Button size="xs" className={`h-7 text-[10px] font-black tracking-widest px-6 shadow-xl italic ${isRunning ? 'bg-red-500' : 'bg-green-600'}`} onClick={() => setIsRunning(!isRunning)}>{isRunning ? "PAUSA" : "INICIAR"}</Button>
          </div>
        </div>
        <div className="flex flex-col items-center min-w-[140px]">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none mb-1">VISITANTE</span>
          <span className="text-6xl font-black italic tabular-nums leading-none text-white">{score.visitor}</span>
        </div>
      </div>

      <div className="flex-1 flex gap-3 p-3 overflow-hidden min-h-0 relative">
        {/* PANEL IZQUIERDO (LOCAL) */}
        <div className={`flex-1 rounded-3xl border-2 border-blue-500/30 bg-blue-950/10 p-5 flex flex-col min-h-0 overflow-hidden transition-all duration-300 ${selectedPlayer?.team === 'B' ? 'opacity-10 pointer-events-none' : 'opacity-100'}`}>
          <h2 className="font-black text-blue-400 text-xs mb-4 flex items-center gap-3 uppercase italic tracking-tighter shrink-0"><Trophy size={18}/> Plantilla Local</h2>
          {selectedPlayer?.team === 'A' ? (
            <div className="flex-1 flex flex-col animate-in slide-in-from-left-4">
              <div className="flex items-center gap-5 bg-white/5 p-4 rounded-2xl border border-white/10 mb-5 shrink-0 shadow-2xl">
                <div className="bg-white text-blue-900 w-16 h-16 rounded-xl flex items-center justify-center text-4xl font-black italic shadow-inner">{selectedPlayer.number}</div>
                <div className="flex flex-col flex-1 leading-none">
                  <span className="text-[11px] text-white/40 font-black uppercase mb-1 tracking-widest italic">REGISTRANDO</span>
                  <span className="text-blue-400 font-black text-2xl uppercase italic">{playersA.find(p => p.number === selectedPlayer.number)?.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPlayer(null)} className="ml-auto text-white/30 hover:text-white"><XCircle size={32}/></Button>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto content-start pb-6 custom-scrollbar pr-1">
                <Button className="h-28 bg-green-600 hover:bg-green-500 text-white font-black text-4xl col-span-2 border-b-8 border-green-900 shadow-xl" onClick={() => {setCurrentAction('GOL'); setWizardStep('details')}}>GOL</Button>
                <Button className="h-20 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl border-b-4 border-blue-800" onClick={() => {setCurrentAction('PARADA'); setWizardStep('details')}}>PARADA</Button>
                <Button className="h-20 bg-orange-600 hover:bg-orange-500 text-white font-black text-2xl border-b-4 border-orange-800" onClick={() => {setCurrentAction('FUERA'); setWizardStep('details')}}>FUERA</Button>
                <Button className="h-16 bg-red-600 hover:bg-red-500 text-white font-black col-span-2 text-sm border-b-4 border-red-800 uppercase" onClick={() => {setCurrentAction('PÉRDIDA'); setWizardStep('losses')}}>Pérdida / Error / Pasos</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 overflow-y-auto custom-scrollbar flex-1 content-start pr-1">
              {playersA.map(p => (
                <Button key={p.number} onClick={() => setSelectedPlayer({team:'A', number:p.number})} className="h-20 flex flex-col font-black rounded-2xl border-b-4 bg-blue-600 hover:bg-blue-500 text-white border-blue-900 shadow-xl transition-all active:scale-90">
                  <span className="text-3xl leading-none italic italic">{p.number}</span>
                  <span className="text-[9px] font-bold opacity-70 truncate w-full px-1 uppercase tracking-tighter">{p.name}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* PANEL CENTRAL: ESTADÍSTICAS + PORTERÍA */}
        <div className="w-full md:w-[460px] flex flex-col gap-3 min-h-0 h-full relative">
          {selectedPlayer && wizardStep !== 'actions' ? (
            <div className={`flex-1 flex flex-col rounded-3xl border-2 p-6 shadow-2xl relative overflow-hidden transition-all duration-300 ${selectedPlayer.team === 'A' ? 'bg-blue-950/95 border-blue-500 shadow-blue-500/20' : 'bg-amber-950/95 border-amber-500 shadow-amber-500/20'}`}>
              <div className="flex items-center gap-5 bg-black/40 p-4 rounded-2xl border border-white/10 mb-6 shrink-0 shadow-inner">
                <div className="bg-white text-slate-900 w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black italic shadow-inner">{selectedPlayer.number}</div>
                <div className="flex flex-col leading-none flex-1"><span className="text-[10px] text-white/40 font-black uppercase tracking-widest italic mb-1">ANALIZANDO ACCIÓN</span><span className="text-green-400 font-black text-2xl italic uppercase tracking-tighter leading-none">{currentAction}</span></div>
                <Button variant="ghost" size="xs" className="text-white/40 hover:text-white" onClick={() => setWizardStep('actions')}><ArrowLeft size={24}/></Button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-24">
                {wizardStep === 'losses' ? (
                  <div className="grid grid-cols-1 gap-2.5">
                    {LOSS_TYPES.map(type => <Button key={type} className="h-14 bg-black/40 hover:bg-red-600 text-white text-sm font-black justify-start px-8 rounded-xl border border-white/5 active:scale-95 transition-all" onClick={() => handleActionRecord(type)}>{type.toUpperCase()}</Button>)}
                  </div>
                ) : (
                  <>
                    <section><label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3 italic leading-none">Defensa Rival</label>
                      <div className="grid grid-cols-3 gap-2.5">{DEFENSE_TYPES.map(d => <Button key={d} size="sm" variant="outline" className={`h-11 text-[10px] font-black border-white/10 transition-all ${details.defense === d ? "bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.4)]" : "text-white/70 hover:bg-white/10"}`} onClick={() => setDetails({...details, defense: d})}>{d}</Button>)}</div>
                    </section>
                    <section><label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3 italic leading-none">Zona Lanzamiento</label>
                      <div className="grid grid-cols-3 gap-2.5">{COURT_ZONES.map(z => <Button key={z} size="sm" variant="outline" className={`h-11 text-[9px] font-black border-white/10 leading-none transition-all ${details.courtZone === z ? "bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.4)]" : "text-white/70 hover:bg-white/10"}`} onClick={() => setDetails({...details, courtZone: z})}>{z}</Button>)}</div>
                    </section>
                    <section className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
                      <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] block mb-6 text-center italic leading-none">Impacto Portería (1-9)</label>
                      <div className="grid grid-cols-3 gap-3 aspect-square max-w-[180px] mx-auto bg-black/60 p-2 rounded-2xl shadow-2xl">
                        {GOAL_ZONES.map(z => <Button key={z} variant="ghost" className={`h-full text-3xl font-black border border-white/5 transition-all ${details.goalZone === z ? "bg-green-500 text-slate-950 shadow-[0_0_25px_rgba(34,197,94,0.6)] scale-110" : "text-white/20 hover:bg-white/5"}`} onClick={() => setDetails({...details, goalZone: z})}>{z}</Button>)}
                      </div>
                    </section>
                  </>
                )}
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/95 p-3 rounded-2xl border border-white/10 backdrop-blur-xl shadow-3xl">
                <Button className="w-full bg-green-600 hover:bg-green-500 text-white font-black h-16 text-2xl italic uppercase shadow-2xl border-t border-white/20 transition-all active:scale-95" disabled={!details.defense || (wizardStep === 'details' && !details.goalZone)} onClick={() => handleActionRecord()}>CONFIRMAR REGISTRO</Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-3 min-h-0 h-full">
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-3xl flex flex-col overflow-hidden shadow-3xl transition-all duration-700">
                <div className="bg-green-600 p-5 flex items-center gap-4 justify-center shrink-0 shadow-2xl border-b border-green-400/20">
                  <Activity size={24} className="text-white animate-pulse"/><span className="font-black text-lg text-white uppercase italic tracking-tighter">Estadísticas Tiempo Real</span>
                </div>
                <div className="p-6 flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between text-[11px] font-black text-slate-500 px-4 italic uppercase shrink-0 tracking-[0.2em] font-bold leading-none italic"><span className="text-blue-500">EQUIPO A</span><span className="text-white/10">MÉTRICAS TÉCNICAS</span><span className="text-amber-500">EQUIPO B</span></div>
                  {[
                    { label: "Paradas Totales", a: events.filter(e=>e.team==='A' && e.action==='PARADA').length, b: events.filter(e=>e.team==='B' && e.action==='PARADA').length },
                    { label: "Pérdidas de Balón", a: events.filter(e=>e.team==='A' && e.action==='PÉRDIDA').length, b: events.filter(e=>e.team==='B' && e.action==='PÉRDIDA').length },
                    { label: "Exclusiones (2')", a: 0, b: 0 },
                    { label: "Posesiones", a: 0, b: 0 },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center bg-black/40 rounded-2xl p-5 border border-white/5 shadow-inner transition-all hover:bg-black/60 shadow-xl">
                      <span className="w-14 text-center font-black text-blue-400 text-4xl italic leading-none drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">{stat.a}</span>
                      <span className="flex-1 text-center text-[12px] font-black text-slate-400 uppercase tracking-tighter mx-3 border-x border-white/5 h-full flex items-center justify-center italic text-center font-bold">{stat.label}</span>
                      <span className="w-14 text-center font-black text-amber-400 text-4xl italic leading-none drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">{stat.b}</span>
                    </div>
                  ))}
                  <div className="mt-auto grid grid-cols-2 gap-4 pt-8 border-t border-slate-800 shrink-0"><Button className="bg-green-600 hover:bg-green-500 text-white font-black uppercase italic h-16 text-sm shadow-2xl">Informe Ejecutivo</Button><Button className="bg-amber-600 hover:bg-amber-500 text-white font-black uppercase italic h-16 text-sm shadow-2xl">Descargar CSV</Button></div>
                </div>
              </div>
              <div className="h-[40%] bg-slate-900 border border-slate-700 rounded-3xl flex flex-col overflow-hidden shadow-2xl backdrop-blur-sm shrink-0">
                <div className="bg-slate-800/60 p-3 flex justify-between items-center border-b border-slate-700 shrink-0">
                  <span className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest italic leading-none italic font-bold leading-none"><Shield size={16}/> Portería Local</span>
                  <Dialog><DialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white transition-all hover:scale-110 shadow-lg"><Maximize2 size={18}/></Button></DialogTrigger><DialogContent className="bg-slate-950 border-slate-800 max-w-5xl aspect-video p-10 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]"><DialogHeader className="mb-8"><DialogTitle className="text-3xl text-white font-black italic uppercase tracking-tighter flex items-center gap-6 leading-none italic leading-none"><Target className="text-blue-500" size={42}/> Análisis Detallado Impacto Portería Local</DialogTitle></DialogHeader><div className="flex-1 min-h-0"><PorteriaCentral events={events}/></div></DialogContent></Dialog>
                </div>
                <div className="flex-1 p-3 overflow-hidden"><PorteriaCentral events={events}/></div>
              </div>
            </div>
          )}
        </div>

        {/* PANEL DERECHO (VISITANTE) */}
        <div className="flex-1 flex flex-col gap-3 min-h-0 h-full overflow-hidden">
          <div className={`flex-1 rounded-3xl border-2 border-amber-500/30 bg-amber-950/10 p-5 flex flex-col min-h-0 overflow-hidden transition-all duration-500 ${selectedPlayer?.team === 'A' ? 'opacity-10 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center justify-end gap-3 mb-4 shrink-0 font-bold leading-none italic"><span className="text-[11px] font-black text-white/80 uppercase tracking-widest italic leading-none">Plantilla Visitante</span><Trophy size={18} className="text-amber-400"/></div>
            {selectedPlayer?.team === 'B' ? (
              <div className="flex-1 flex flex-col animate-in slide-in-from-right-4">
                <div className="flex items-center gap-5 bg-white/5 p-4 rounded-2xl border border-white/10 mb-5 shrink-0 shadow-2xl backdrop-blur-md">
                  <div className="bg-white text-amber-900 w-16 h-16 rounded-xl flex items-center justify-center text-4xl font-black italic shadow-inner">{selectedPlayer.number}</div>
                  <div className="flex flex-col flex-1 leading-none"><span className="text-[11px] text-white/40 font-black uppercase mb-1 tracking-widest italic leading-none">REGISTRANDO</span><span className="text-amber-400 font-black text-2xl uppercase italic leading-none font-bold italic leading-none">{playersB.find(p => p.number === selectedPlayer.number)?.name}</span></div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPlayer(null)} className="ml-auto text-white/30 hover:text-white"><XCircle size={32}/></Button>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto content-start pb-6 custom-scrollbar pr-1">
                  <Button className="h-28 bg-green-600 hover:bg-green-500 text-white font-black text-4xl col-span-2 border-b-8 border-green-900 shadow-2xl transition-all" onClick={() => {setCurrentAction('GOL'); setWizardStep('details')}}>GOL</Button>
                  <Button className="h-20 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl border-b-4 border-blue-800 shadow-xl transition-all" onClick={() => {setCurrentAction('PARADA'); setWizardStep('details')}}>PARADA</Button>
                  <Button className="h-20 bg-orange-600 hover:bg-orange-500 text-white font-black text-2xl border-b-4 border-orange-800 shadow-xl transition-all" onClick={() => {setCurrentAction('FUERA'); setWizardStep('details')}}>FUERA</Button>
                  <Button className="h-16 bg-red-600 hover:bg-red-500 text-white font-black col-span-2 text-sm border-b-4 border-red-800 shadow-xl uppercase font-bold italic leading-none" onClick={() => {setCurrentAction('PÉRDIDA'); setWizardStep('losses')}}>Pérdida / Error / Pasos</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 overflow-y-auto custom-scrollbar flex-1 content-start pr-1">
                {playersB.map(p => (
                  <Button key={p.number} onClick={() => setSelectedPlayer({team:'B', number:p.number})} className="h-20 flex flex-col font-black rounded-2xl border-b-4 bg-amber-600 hover:bg-amber-500 text-white border-amber-900 shadow-xl transition-all active:scale-90 active:translate-y-1">
                    <span className="text-3xl leading-none italic italic italic leading-none">{p.number}</span>
                    <span className="text-[9px] font-bold opacity-70 truncate w-full px-1 uppercase italic leading-none mt-1">{p.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER LIVE FEED */}
      <div className="h-12 bg-black/95 border-t border-white/10 flex items-center gap-6 px-8 overflow-x-auto whitespace-nowrap shrink-0 scrollbar-hide shadow-inner z-[100] transition-all"><div className="flex items-center gap-3 text-slate-500 font-black text-[11px] uppercase italic shrink-0 leading-none italic"><History size={18}/> LIVE SCOUT FEED:</div><div className="flex gap-10 items-center italic shrink-0 tracking-tight font-bold italic leading-none">{events.slice(0, 12).map(e => (<div key={e.id} className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-500 group"><span className="text-[11px] text-green-500 font-mono font-black transition-colors leading-none italic">[{formatTime(e.timestamp)}]</span><span className={`text-[12px] font-black italic tracking-tight leading-none italic ${e.team === 'A' ? 'text-blue-400' : 'text-amber-400'}`}>#{e.player} {e.action.toUpperCase()}</span></div>))}</div></div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, Filter, CheckCircle2 } from "lucide-react"
import { Event, UpdateEventRequest, ActionType, DefenseType, CourtZone } from "@/lib/types/api-types"
import { DEFENSE_TYPES, COURT_ZONES, GOAL_ZONES, TURNOVER_TYPES, RECOVERY_TYPES } from "@/lib/constants"

const ACTION_TYPES: ActionType[] = [
    "GOL", "GOL 7M", "GOL CAMPO A CAMPO", "FALLO 7M",
    "PARADA", "FUERA", "POSTE", "BLOCADO", "PÉRDIDA", "RECUPERACIÓN", "ASISTENCIA",
]

interface EventEditDialogProps {
    readonly event: Event | null
    readonly open: boolean
    readonly onClose: () => void
    readonly onSave: (eventId: string, data: UpdateEventRequest) => void
    readonly isSaving?: boolean
    readonly isNightMode?: boolean
}

export function EventEditDialog({
    event,
    open,
    onClose,
    onSave,
    isSaving,
    isNightMode = false,
}: EventEditDialogProps) {
    const [action, setAction] = useState<ActionType>("GOL")
    const [context, setContext] = useState<string[]>([])
    const [courtZone, setCourtZone] = useState<CourtZone | null>(null)
    const [goalZone, setGoalZone] = useState<number | null>(null)
    const [defense, setDefense] = useState<DefenseType | null>(null)
    const [turnoverType, setTurnoverType] = useState<string | null>(null)
    const [recoveryType, setRecoveryType] = useState<string | null>(null)

    useEffect(() => {
        if (event) {
            setAction(event.action)
            setContext(event.context ?? [])
            setCourtZone(event.court_zone ?? null)
            setGoalZone(event.goal_zone ?? null)
            setDefense(event.defense_at_moment ?? null)
            setTurnoverType(event.turnover_type ?? null)
            setRecoveryType(event.recovery_type ?? null)
        }
    }, [event])

    const handleSave = () => {
        if (!event?.id) return
        onSave(event.id, {
            action,
            context: context.length > 0 ? context : null,
            court_zone: courtZone,
            goal_zone: goalZone,
            defense_at_moment: defense,
            rival_goalkeeper: event.rival_goalkeeper,
            turnover_type: turnoverType,
            recovery_type: recoveryType,
        })
    }

    const toggleContext = (ctx: string) => {
        setContext(prev =>
            prev.includes(ctx) ? prev.filter(c => c !== ctx) : [...prev, ctx]
        )
    }

    const isShot = event?.team === "B" && (action?.startsWith("GOL") || ["PARADA", "FUERA", "POSTE", "FALLO 7M", "BLOCADO"].includes(action))

    const bg = isNightMode ? "bg-slate-950 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
    const subBg = isNightMode ? "bg-slate-900/60 border-white/5" : "bg-slate-50 border-slate-200"
    const labelText = isNightMode ? "text-slate-500" : "text-slate-400"
    const btnBase = isNightMode
        ? "bg-black/30 border-white/5 text-slate-500 hover:text-white"
        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className={`max-w-md max-h-[90vh] overflow-y-auto ${bg} rounded-2xl`}>
                <DialogHeader>
                    <DialogTitle className={`text-sm font-black uppercase tracking-[0.2em] ${isNightMode ? "text-white" : "text-slate-800"}`}>
                        Editar Evento
                    </DialogTitle>
                    {event && (
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${labelText}`}>
                            {event.time_formatted}
                            {" · "}
                            <span className={event.team === "A" ? "text-blue-500" : "text-amber-500"}>
                                {event.team === "A" ? "Local" : "Visitante"}
                            </span>
                            {" · "}
                            #{event.player}
                        </p>
                    )}
                </DialogHeader>

                <div className="space-y-3">
                    {/* Acción */}
                    <div className={`${subBg} p-3 rounded-xl border`}>
                        <div className={`text-[10px] font-black mb-2 uppercase tracking-[0.2em] ${labelText}`}>
                            Acción
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {ACTION_TYPES.map(a => (
                                <Button
                                    key={a}
                                    onClick={() => setAction(a)}
                                    className={`h-9 text-[10px] font-black uppercase rounded-xl border transition-all ${action === a
                                        ? "bg-blue-500 border-blue-400 text-white shadow-md"
                                        : btnBase}`}
                                >
                                    {a}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Zona Portería */}
                    {isShot && (
                        <div className={`${subBg} p-3 rounded-xl border flex flex-col items-center`}>
                            <div className={`text-[10px] font-black mb-3 uppercase tracking-[0.2em] ${labelText}`}>
                                Zona Portería
                            </div>
                            <div className="relative aspect-[3/2] w-full max-w-[200px] flex flex-col pt-1.5 px-1.5 bg-[repeating-linear-gradient(45deg,#ef4444_0,#ef4444_10px,#ffffff_10px,#ffffff_20px)] rounded-t-xl shadow border border-white/20">
                                <div className="flex-1 w-full rounded-t-sm relative overflow-hidden shadow-[inset_0_4px_16px_rgba(0,0,0,0.6)] bg-slate-800">
                                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5">
                                        {GOAL_ZONES.map(z => (
                                            <Button
                                                key={z}
                                                variant="ghost"
                                                className={`h-full w-full text-sm font-black rounded p-0 border transition-all ${goalZone === z
                                                    ? (action?.startsWith("GOL")
                                                        ? "bg-emerald-500 text-white border-emerald-300 shadow-lg"
                                                        : "bg-red-500 text-white border-red-300 shadow-lg")
                                                    : "bg-slate-900/40 text-white/30 border-white/5 hover:bg-slate-700/60 hover:text-white"}`}
                                                onClick={() => setGoalZone(goalZone === z ? null : z)}
                                            >
                                                {z}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Situación (Contexto) */}
                    {action?.startsWith("GOL") && (
                        <div className={`${subBg} p-3 rounded-xl border`}>
                            <div className={`text-[10px] font-black mb-2 uppercase tracking-[0.2em] flex items-center gap-2 ${labelText}`}>
                                <Filter className="w-3 h-3 text-amber-500" /> Situación
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {["Igualdad", "Superioridad", "Inferioridad", "Contraataque"].map(ctx => (
                                    <Button
                                        key={ctx}
                                        onClick={() => toggleContext(ctx)}
                                        className={`h-9 text-[10px] font-black uppercase rounded-xl border transition-all ${context.includes(ctx)
                                            ? "bg-amber-500 border-amber-400 text-white shadow-md"
                                            : btnBase}`}
                                    >
                                        {ctx}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Defensa */}
                    {action !== "PÉRDIDA" && action !== "RECUPERACIÓN" && (
                        <div className={`${subBg} p-3 rounded-xl border`}>
                            <div className={`text-[10px] font-black mb-2 uppercase tracking-[0.2em] flex items-center gap-2 ${labelText}`}>
                                <Shield className="w-3 h-3 text-indigo-500" /> Defensa
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {DEFENSE_TYPES.map(dt => (
                                    <Button
                                        key={dt}
                                        onClick={() => setDefense(defense === dt ? null : dt)}
                                        className={`h-8 px-3 text-[10px] font-black uppercase rounded-xl border transition-all ${defense === dt
                                            ? "bg-indigo-500 border-indigo-400 text-white shadow-md"
                                            : btnBase}`}
                                    >
                                        {dt}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Zona de lanzamiento */}
                    {!action?.includes("7M") && ["GOL", "PARADA", "FUERA", "PÉRDIDA"].includes(action) && (
                        <div className={`${subBg} p-3 rounded-xl border`}>
                            <div className={`text-[10px] font-black mb-2 uppercase tracking-[0.2em] ${labelText}`}>
                                Origen Lanzamiento
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {COURT_ZONES.map(z => (
                                    <Button
                                        key={z}
                                        onClick={() => setCourtZone(courtZone === z ? null : z as CourtZone)}
                                        className={`h-8 text-[9px] font-black uppercase rounded-xl border transition-all ${courtZone === z
                                            ? "bg-blue-500 border-blue-400 text-white shadow-md"
                                            : btnBase}`}
                                    >
                                        {z}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Motivo Pérdida */}
                    {action === "PÉRDIDA" && (
                        <div className={`${subBg} p-3 rounded-xl border`}>
                            <div className={`text-[10px] font-black mb-2 uppercase tracking-[0.2em] flex items-center gap-2 ${labelText}`}>
                                <AlertTriangle className="w-3 h-3 text-red-500" /> Motivo
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {TURNOVER_TYPES.map(type => (
                                    <Button
                                        key={type}
                                        onClick={() => setTurnoverType(turnoverType === type ? null : type)}
                                        className={`h-9 text-[9px] font-black uppercase rounded-xl border transition-all ${turnoverType === type
                                            ? "bg-red-500 border-red-400 text-white shadow-md"
                                            : btnBase}`}
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Método Recuperación */}
                    {action === "RECUPERACIÓN" && (
                        <div className={`${subBg} p-3 rounded-xl border`}>
                            <div className={`text-[10px] font-black mb-2 uppercase tracking-[0.2em] flex items-center gap-2 ${labelText}`}>
                                <Shield className="w-3 h-3 text-cyan-500" /> Método
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {RECOVERY_TYPES.map(type => (
                                    <Button
                                        key={type}
                                        onClick={() => setRecoveryType(recoveryType === type ? null : type)}
                                        className={`h-9 text-[9px] font-black uppercase rounded-xl border transition-all ${recoveryType === type
                                            ? "bg-cyan-500 border-cyan-400 text-white shadow-md"
                                            : btnBase}`}
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 mt-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className={`font-black text-[10px] uppercase rounded-xl ${isNightMode ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"}`}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase rounded-xl tracking-[0.2em]"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

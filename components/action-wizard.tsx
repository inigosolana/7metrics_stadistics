import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, AlertTriangle, Filter, CheckCircle2 } from "lucide-react"
import { DEFENSE_TYPES, COURT_ZONES, GOAL_ZONES, TURNOVER_TYPES, RECOVERY_TYPES } from "@/lib/constants"
import { Player, DefenseType, CourtZone } from "@/lib/types/api-types"

export type WizardState = "IDLE" | "ACTION_SELECTION" | "DETAILS"

interface ActionWizardProps {
    wizardState: WizardState
    activePlayer: { team: "A" | "B"; player: number; isGK?: boolean } | null
    isGoalkeeper: boolean
    handleBack: () => void
    currentAction: string | null
    handleActionSelect: (action: string) => void
    selectedContext: string[]
    toggleContext: (ctx: string) => void
    confirmEvent: (action?: string) => void
    selectedCourtZone: CourtZone | null
    setSelectedCourtZone: (z: CourtZone) => void
    selectedGoalZone: number | null
    setSelectedGoalZone: (z: number) => void
    selectedDefense: DefenseType | null
    setSelectedDefense: (d: DefenseType) => void
    selectedTurnoverType: string | null // Using string to simplify, ideally enum
    setSelectedTurnoverType: (t: string) => void
    selectedRecoveryType: string | null
    setSelectedRecoveryType: (t: string) => void
    rivalGoalkeepers: Player[]
    selectedGoalkeeper: number | null
    setSelectedGoalkeeper: (n: number) => void
}

export function ActionWizard({
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
    selectedTurnoverType,
    setSelectedTurnoverType,
    selectedRecoveryType,
    setSelectedRecoveryType,
    rivalGoalkeepers,
    selectedGoalkeeper,
    setSelectedGoalkeeper,
}: ActionWizardProps) {
    return (
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
                                className="h-12 text-sm font-bold bg-green-700 hover:bg-green-600 border-b-4 border-green-900 active:border-0 active:translate-y-1 transition-all"
                                onClick={() => handleActionSelect("GOL CAMPO A CAMPO")}
                            >
                                GOL CAMPO A CAMPO
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
                                PARADA PORTERA
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
                                className="h-12 text-sm font-bold bg-cyan-600 hover:bg-cyan-500 col-span-2 border-b-4 border-cyan-800 active:border-0 active:translate-y-1 transition-all"
                                onClick={() => handleActionSelect("RECUPERACIÓN")}
                            >
                                RECUPERACIÓN DE BALÓN
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
                        <>
                            <Button
                                className="h-16 text-lg font-black bg-green-700 hover:bg-green-600 col-span-2 border-b-4 border-green-900 active:border-0 active:translate-y-1 transition-all"
                                onClick={() => handleActionSelect("GOL CAMPO A CAMPO")}
                            >
                                GOL CAMPO A CAMPO
                            </Button>
                            <Button
                                className="h-16 text-lg font-black bg-amber-600 hover:bg-amber-500 col-span-2 border-b-4 border-amber-800 active:border-0 active:translate-y-1 transition-all"
                                onClick={() => handleActionSelect("FUERA")}
                            >
                                FUERA / POSTE
                            </Button>
                            <Button
                                className="h-16 text-lg font-black bg-red-600 hover:bg-red-500 col-span-2 border-b-4 border-red-800 active:border-0 active:translate-y-1 transition-all"
                                onClick={() => handleActionSelect("PÉRDIDA")}
                            >
                                PÉRDIDA / ERROR
                            </Button>
                        </>
                    )}
                </div>
            )}

            {wizardState === "DETAILS" && (
                <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-10 overflow-hidden pb-14">
                    <div className="flex-1 overflow-y-auto space-y-3 p-1 custom-scrollbar">
                        {/* Updated goalkeeper selection for ALL shot types */}
                        {(currentAction === "PARADA" ||
                            currentAction === "FALLO 7M" ||
                            currentAction?.startsWith("GOL") ||
                            currentAction === "FUERA" ||
                            currentAction === "POSTE") &&
                            rivalGoalkeepers &&
                            rivalGoalkeepers.length > 0 && (
                                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50">
                                    <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> Selecciona Portera Rival
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Nota: p.id es string en API pero el estado local selectedGoalkeeper es number.
                         Asumiremos que usaremos number para la lógica interna del wizard por compatibilidad */}
                                        {rivalGoalkeepers.map((gk: any) => (
                                            <Button
                                                key={gk.number}
                                                variant="outline"
                                                size="sm"
                                                className={`h-10 px-3 font-bold transition-all ${selectedGoalkeeper === gk.number ? "bg-blue-600 border-blue-400 text-white" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}
                                                onClick={() => setSelectedGoalkeeper(gk.number)}
                                            >
                                                #{gk.number} {gk.name.split(" ").pop()}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {currentAction === "GOL 7M" || currentAction === "FALLO 7M" ? (
                            <>
                                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50 flex flex-col items-center">
                                    <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                                        Zona Definición (Localización en Portería)
                                    </div>
                                    <div className="aspect-square w-full max-w-[120px] grid grid-cols-3 gap-0.5 bg-slate-800 p-0.5 rounded border border-slate-700 shadow-inner">
                                        {GOAL_ZONES.map((z) => (
                                            <Button
                                                key={z}
                                                variant="ghost"
                                                className={`h-full w-full text-base font-black rounded-sm transition-all p-0 ${selectedGoalZone === z ? (currentAction === "GOL 7M" ? "bg-green-500 text-black shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]" : "bg-red-500 text-white") : "bg-slate-700/50 text-slate-500 hover:bg-slate-600 hover:text-slate-200"}`}
                                                onClick={() => setSelectedGoalZone(z)}
                                            >
                                                {z}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : currentAction === "GOL CAMPO A CAMPO" ? (
                            <>
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

                                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50">
                                    <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                                        <Filter className="w-3 h-3" /> Contexto Táctico
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["Igualdad", "Superioridad", "Inferioridad"].map((ctx) => {
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
                            </>
                        ) : currentAction === "PÉRDIDA" ? (
                            <>
                                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50">
                                    <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Tipo de Pérdida
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {TURNOVER_TYPES.map((type) => (
                                            <Button
                                                key={type}
                                                size="sm"
                                                variant="outline"
                                                className={`h-9 text-[9px] uppercase font-bold px-2 transition-all ${selectedTurnoverType === type ? "bg-red-600 border-red-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"}`}
                                                onClick={() => setSelectedTurnoverType(type)}
                                            >
                                                {type}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : currentAction === "RECUPERACIÓN" ? (
                            <>
                                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50">
                                    <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> Tipo de Recuperación
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {RECOVERY_TYPES.map((type) => (
                                            <Button
                                                key={type}
                                                size="sm"
                                                variant="outline"
                                                className={`h-10 text-[10px] uppercase font-bold px-2 transition-all ${selectedRecoveryType === type ? "bg-cyan-600 border-cyan-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"}`}
                                                onClick={() => setSelectedRecoveryType(type)}
                                            >
                                                {type}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
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

                                {currentAction?.startsWith("GOL") && (
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

                                {!currentAction?.includes("7M") && ["GOL", "PARADA", "FUERA", "PÉRDIDA"].includes(currentAction || "") && (
                                    <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50">
                                        <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                                            Zona Origen
                                        </div>
                                        <div className="grid grid-cols-3 gap-1">
                                            {COURT_ZONES.map((z: any) => ( // Cast to any to avoid strict type error vs CourtZone string
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

                                {(currentAction?.startsWith("GOL") || ["PARADA", "FUERA", "FALLO 7M"].includes(currentAction || "")) && (
                                    <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50 flex flex-col items-center">
                                        <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                                            Zona Definición {currentAction === "FUERA" ? "(Aprox. hacia dónde salió)" : ""}
                                        </div>
                                        <div className="aspect-square w-full max-w-[120px] grid grid-cols-3 gap-0.5 bg-slate-800 p-0.5 rounded border border-slate-700 shadow-inner">
                                            {GOAL_ZONES.map((z) => (
                                                <Button
                                                    key={z}
                                                    variant="ghost"
                                                    className={`h-full w-full text-base font-black rounded-sm transition-all p-0 ${selectedGoalZone === z
                                                        ? currentAction?.startsWith("GOL")
                                                            ? "bg-green-500 text-black shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"
                                                            : currentAction === "FALLO 7M"
                                                                ? "bg-orange-500 text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"
                                                                : "bg-red-500 text-white"
                                                        : "bg-slate-700/50 text-slate-500 hover:bg-slate-600 hover:text-slate-200"
                                                        }`}
                                                    onClick={() => setSelectedGoalZone(z)}
                                                >
                                                    {z}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
                        <Button
                            size="lg"
                            className="w-full h-11 bg-green-600 hover:bg-green-500 text-white shadow-xl font-black tracking-[0.15em] text-base uppercase border-t border-green-400/20 transition-transform active:scale-[0.98]"
                            onClick={() => confirmEvent()}
                        >
                            CONFIRMAR <CheckCircle2 className="w-5 h-5 ml-2 animate-pulse" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

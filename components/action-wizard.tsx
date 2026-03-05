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
    activeRivalGoalkeeper: number | null
    onSetActiveRivalGK: (n: number) => void
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
    activeRivalGoalkeeper,
    onSetActiveRivalGK,
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
                                className="h-16 text-xl font-black bg-green-600/90 hover:bg-green-500 col-span-2 border-b-4 border-green-800 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.4)] hover:-translate-y-1 transition-all"
                                onClick={() => handleActionSelect("GOL")}
                            >
                                GOL
                            </Button>
                            <Button
                                className="h-14 text-sm font-bold bg-green-700/80 hover:bg-green-600 border-b-4 border-green-900 rounded-xl hover:-translate-y-1 transition-all"
                                onClick={() => handleActionSelect("GOL 7M")}
                            >
                                GOL 7m
                            </Button>
                            <Button
                                className="h-14 text-sm font-bold bg-green-700/80 hover:bg-green-600 border-b-4 border-green-900 rounded-xl hover:-translate-y-1 transition-all"
                                onClick={() => handleActionSelect("GOL CAMPO A CAMPO")}
                            >
                                GOL CAMPO A CAMPO
                            </Button>
                            <Button
                                className="h-14 text-sm font-bold bg-red-700/80 hover:bg-red-600 border-b-4 border-red-900 rounded-xl hover:-translate-y-1 transition-all"
                                onClick={() => handleActionSelect("FALLO 7M")}
                            >
                                FALLO 7m
                            </Button>
                            <Button
                                className="h-14 text-base font-black bg-blue-600/90 hover:bg-blue-500 border-b-4 border-blue-800 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all"
                                onClick={() => handleActionSelect("PARADA")}
                            >
                                PARADA PORTERA
                            </Button>
                            <Button
                                className="h-14 text-base font-black bg-amber-600/90 hover:bg-amber-500 border-b-4 border-amber-800 rounded-xl shadow-[0_4px_14px_0_rgba(217,119,6,0.39)] hover:shadow-[0_6px_20px_rgba(217,119,6,0.4)] hover:-translate-y-1 transition-all"
                                onClick={() => handleActionSelect("FUERA")}
                            >
                                FUERA / POSTE
                            </Button>
                            <Button
                                className="h-14 text-sm font-bold bg-red-600/90 hover:bg-red-500 col-span-2 border-b-4 border-red-800 rounded-xl shadow-[0_4px_14_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)] hover:-translate-y-1 transition-all"
                                onClick={() => handleActionSelect("PÉRDIDA")}
                            >
                                PÉRDIDA / ERROR
                            </Button>
                            <Button
                                className="h-14 text-sm font-bold bg-cyan-600/90 hover:bg-cyan-500 col-span-2 border-b-4 border-cyan-800 rounded-xl shadow-[0_4px_14px_0_rgba(8,145,178,0.39)] hover:shadow-[0_6px_20px_rgba(8,145,178,0.4)] hover:-translate-y-1 transition-all"
                                onClick={() => handleActionSelect("RECUPERACIÓN")}
                            >
                                RECUPERACIÓN DE BALÓN
                            </Button>
                            <Button
                                variant="outline"
                                className="h-12 text-xs border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 col-span-2 bg-slate-950/30 rounded-xl backdrop-blur-sm transition-all"
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
                <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-10 overflow-hidden">
                    <div className="flex-1 overflow-y-auto space-y-4 p-1 custom-scrollbar">
                        {/* Updated goalkeeper selection for ALL shot types */}
                        {(currentAction === "PARADA" ||
                            currentAction === "FALLO 7M" ||
                            currentAction?.startsWith("GOL") ||
                            currentAction === "FUERA" ||
                            currentAction === "POSTE") &&
                            rivalGoalkeepers &&
                            rivalGoalkeepers.length > 0 && (
                                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/50">
                                    <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest flex items-center justify-between">
                                        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Selecciona Portera Rival</span>
                                        <span className="text-[8px] opacity-60">Escudo = Portera Principal</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {rivalGoalkeepers.map((gk: any) => {
                                            const isActive = activeRivalGoalkeeper === gk.number;
                                            const isSelected = selectedGoalkeeper === gk.number;
                                            return (
                                                <div
                                                    key={gk.number}
                                                    className={`flex items-stretch rounded-lg overflow-hidden border transition-all ${isSelected ? "border-blue-500 ring-1 ring-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "border-slate-700 bg-slate-900/50"}`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`h-12 flex-1 justify-start px-3 rounded-none font-bold transition-colors ${isSelected ? "bg-blue-600/20 text-blue-200" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                                                        onClick={() => setSelectedGoalkeeper(gk.number)}
                                                    >
                                                        <span className={`text-sm ${isSelected ? "text-blue-400" : "text-slate-500"}`}>#{gk.number}</span>
                                                        <span className="ml-2 truncate max-w-[80px]">{gk.name.split(" ").pop()}</span>
                                                    </Button>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSetActiveRivalGK(gk.number);
                                                            setSelectedGoalkeeper(gk.number);
                                                        }}
                                                        className={`w-10 rounded-none border-l border-slate-800 transition-all ${isActive ? "bg-green-600/40 text-green-400" : "bg-slate-950/30 text-slate-600 hover:text-slate-300 hover:bg-slate-800"}`}
                                                        title={isActive ? "Portera actual" : "Marcar como portera principal"}
                                                    >
                                                        <Shield className={`w-4 h-4 ${isActive ? "fill-current" : ""}`} />
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                        {currentAction === "GOL 7M" || currentAction === "FALLO 7M" ? (
                            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex flex-col items-center">
                                <div className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">
                                    Zona Definición
                                </div>
                                <div className="aspect-[4/3] w-full max-w-[180px] grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                                    {GOAL_ZONES.map((z) => (
                                        <Button
                                            key={z}
                                            variant="ghost"
                                            className={`h-full w-full text-xl font-black rounded transition-all p-0 ${selectedGoalZone === z ? (currentAction === "GOL 7M" ? "bg-green-500 text-black shadow-lg" : "bg-red-500 text-white shadow-lg") : "bg-slate-700/50 text-slate-500 hover:bg-slate-600 hover:text-slate-200"}`}
                                            onClick={() => setSelectedGoalZone(z)}
                                        >
                                            {z}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : currentAction === "GOL CAMPO A CAMPO" ? (
                            <>
                                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                                    <div className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-indigo-400" /> Defensa Rival
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {DEFENSE_TYPES.map((dt) => (
                                            <Button
                                                key={dt}
                                                size="sm"
                                                variant="outline"
                                                className={`h-8 text-[10px] uppercase font-black px-3 transition-all rounded-md ${selectedDefense === dt ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                                                onClick={() => setSelectedDefense(dt)}
                                            >
                                                {dt}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                                    <div className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Filter className="w-3.5 h-3.5 text-amber-400" /> Situación Táctica
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["Igualdad", "Superioridad", "Inferioridad"].map((ctx) => {
                                            const isActive = selectedContext.includes(ctx)
                                            return (
                                                <Button
                                                    key={ctx}
                                                    size="sm"
                                                    variant="outline"
                                                    className={`h-9 text-[10px] uppercase font-black rounded-md transition-all ${isActive ? "bg-amber-600 text-white border-amber-500 shadow-lg" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"}`}
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
                            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                                <div className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Clasificación de Pérdida
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {TURNOVER_TYPES.map((type) => (
                                        <Button
                                            key={type}
                                            size="sm"
                                            variant="outline"
                                            className={`h-10 text-[10px] uppercase font-black px-2 rounded-md transition-all ${selectedTurnoverType === type ? "bg-red-600 border-red-500 text-white shadow-lg" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"}`}
                                            onClick={() => setSelectedTurnoverType(type)}
                                        >
                                            {type}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : currentAction === "RECUPERACIÓN" ? (
                            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                                <div className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-cyan-400" /> Método de Recuperación
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {RECOVERY_TYPES.map((type) => (
                                        <Button
                                            key={type}
                                            size="sm"
                                            variant="outline"
                                            className={`h-11 text-[10px] uppercase font-black rounded-md transition-all ${selectedRecoveryType === type ? "bg-cyan-600 border-cyan-500 text-white shadow-lg" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"}`}
                                            onClick={() => setSelectedRecoveryType(type)}
                                        >
                                            {type}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                                    <div className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-indigo-400" /> Defensa Rival
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {DEFENSE_TYPES.map((dt) => (
                                            <Button
                                                key={dt}
                                                size="sm"
                                                variant="outline"
                                                className={`h-8 text-[10px] uppercase font-black px-3 transition-all rounded-md ${selectedDefense === dt ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                                                onClick={() => setSelectedDefense(dt)}
                                            >
                                                {dt}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {currentAction?.startsWith("GOL") && (
                                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                                        <div className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Filter className="w-3.5 h-3.5 text-amber-400" /> Situación Táctica
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Igualdad", "Superioridad", "Inferioridad", "Contraataque"].map((ctx) => {
                                                const isActive = selectedContext.includes(ctx)
                                                return (
                                                    <Button
                                                        key={ctx}
                                                        size="sm"
                                                        variant="outline"
                                                        className={`h-9 text-[10px] uppercase font-black rounded-md transition-all ${isActive ? "bg-amber-600 text-white border-amber-500 shadow-lg" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"}`}
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
                                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                                        <div className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">
                                            Zona Origen Lanzamiento
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {COURT_ZONES.map((z: any) => (
                                                <Button
                                                    key={z}
                                                    size="sm"
                                                    className={`h-8 text-[9px] font-black uppercase leading-tight border rounded-md transition-all ${selectedCourtZone === z ? "bg-blue-600 text-white border-blue-400 shadow-md" : "bg-slate-800/50 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-200"}`}
                                                    onClick={() => setSelectedCourtZone(z)}
                                                >
                                                    {z}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(currentAction?.startsWith("GOL") || ["PARADA", "FUERA", "FALLO 7M"].includes(currentAction || "")) && (
                                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex flex-col items-center">
                                        <div className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em] text-center">
                                            Portería {currentAction === "FUERA" ? "(Zona de fallo)" : ""}
                                        </div>
                                        <div className="aspect-[4/3] w-full max-w-[180px] grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                                            {GOAL_ZONES.map((z) => (
                                                <Button
                                                    key={z}
                                                    variant="ghost"
                                                    className={`h-full w-full text-xl font-black rounded transition-all p-0 ${selectedGoalZone === z
                                                        ? currentAction?.startsWith("GOL")
                                                            ? "bg-green-500 text-black shadow-lg"
                                                            : currentAction === "FALLO 7M"
                                                                ? "bg-orange-500 text-white shadow-lg"
                                                                : "bg-red-500 text-white shadow-lg"
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

                    <div className="pt-3 border-t border-slate-700 mt-2 bg-slate-900/90 backdrop-blur-sm shrink-0">
                        <Button
                            size="lg"
                            className="w-full h-12 bg-green-600 hover:bg-green-500 text-white shadow-xl font-black tracking-[0.15em] text-base uppercase border-b-4 border-green-800 rounded-xl transition-all active:translate-y-1 active:border-b-0"
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

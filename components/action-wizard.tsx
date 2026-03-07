import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, AlertTriangle, Filter, CheckCircle2, MousePointerClick } from "lucide-react"
import { DEFENSE_TYPES, COURT_ZONES, GOAL_ZONES, TURNOVER_TYPES, RECOVERY_TYPES } from "@/lib/constants"
import { Player, DefenseType, CourtZone } from "@/lib/types/api-types"

export type WizardState = "IDLE" | "ACTION_SELECTION" | "DETAILS"

interface ActionWizardProps {
    readonly wizardState: WizardState
    readonly activePlayer: { team: "A" | "B"; player: number; isGK?: boolean; name?: string } | null
    readonly isGoalkeeper: boolean
    readonly handleBack: () => void
    readonly currentAction: string | null
    readonly handleActionSelect: (action: string) => void
    readonly selectedContext: string[]
    readonly toggleContext: (ctx: string) => void
    readonly confirmEvent: (action?: string) => void
    readonly selectedCourtZone: CourtZone | null
    readonly setSelectedCourtZone: (z: CourtZone) => void
    readonly selectedGoalZone: number | null
    readonly setSelectedGoalZone: (z: number) => void
    readonly selectedDefense: DefenseType | null
    readonly setSelectedDefense: (d: DefenseType) => void
    readonly selectedTurnoverType: string | null
    readonly setSelectedTurnoverType: (t: string) => void
    readonly selectedRecoveryType: string | null
    readonly setSelectedRecoveryType: (t: string) => void
    readonly rivalGoalkeepers: Player[]
    readonly selectedGoalkeeper: number | null
    readonly setSelectedGoalkeeper: (n: number) => void
    readonly activeRivalGoalkeeper: number | null
    readonly onSetActiveRivalGK: (n: number) => void
    readonly isNightMode?: boolean
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
    isNightMode = false,
}: ActionWizardProps) {
    const glassBg = isNightMode
        ? "bg-slate-950/90 border-white/10 text-white"
        : "bg-white/80 border-slate-200 text-slate-900"

    const subPanelBg = isNightMode
        ? "bg-slate-950/60 border-white/5"
        : "bg-slate-50/50 border-slate-200"

    const labelText = isNightMode ? "text-slate-500" : "text-slate-400"
    const headingText = isNightMode ? "text-white" : "text-slate-900"

    if (wizardState === "IDLE") {
        return (
            <div className={`${glassBg} backdrop-blur-2xl border rounded-2xl p-4 h-full flex flex-col items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-500 min-h-0 gap-3`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isNightMode ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'}`}>
                    <MousePointerClick className={`w-7 h-7 ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <div className="text-center">
                    <p className={`text-sm font-black uppercase tracking-widest ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Selecciona un jugador
                    </p>
                    <p className={`text-[10px] mt-1 ${isNightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        Toca cualquier jugador para registrar una acción
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className={`${glassBg} backdrop-blur-2xl border rounded-2xl p-3 sm:p-4 h-full flex flex-col relative overflow-hidden shadow-2xl transition-all duration-500 min-h-0`}>
            {/* Header */}
            <div className={`flex justify-between items-center mb-3 pb-2 border-b shrink-0 min-h-[40px] ${isNightMode ? 'border-white/10' : 'border-slate-200'}`}>
                <Button variant="ghost" onClick={handleBack} className={`${isNightMode ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} p-2 -ml-2 rounded-xl`}>
                    <ArrowLeft className="w-6 h-6" /> <span className="sr-only">Atrás</span>
                </Button>

                <div className="flex-1 px-3 min-w-0 flex items-center justify-end">
                    {wizardState === "ACTION_SELECTION" && (
                        <span className={`text-[10px] uppercase font-black tracking-[0.2em] ${labelText} truncate`}>Acción</span>
                    )}
                    {wizardState === "DETAILS" && (
                        <span className="text-sm text-blue-500 font-black uppercase italic tracking-wider drop-shadow-sm truncate">{currentAction}</span>
                    )}
                </div>
                <div className={`flex flex-col items-end border-l pl-3 ${isNightMode ? 'border-white/10' : 'border-slate-200'} flex-shrink-0 ml-2`}>
                    <span className={`text-[9px] uppercase font-black ${labelText} tracking-wider`}>{activePlayer?.isGK ? "PORTERO" : "JUGADOR"}</span>
                    <span className={`font-black text-base sm:text-xl leading-none ${headingText} flex items-center gap-1.5 sm:gap-2`}>
                        <span className="text-blue-500">#{activePlayer?.player}</span>
                        <span className="whitespace-nowrap">{activePlayer?.name || ""}</span>
                    </span>
                </div>
            </div>

            {/* Content */}
            {wizardState === "ACTION_SELECTION" && (
                <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 content-start overflow-y-auto custom-scrollbar p-1 animate-in fade-in zoom-in-95">
                    {!isGoalkeeper ? (
                        <>
                            <Button
                                className="h-12 sm:h-16 text-base sm:text-xl font-black bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white col-span-2 border border-emerald-500/30 rounded-xl transition-all shadow-sm active:scale-95"
                                onClick={() => handleActionSelect("GOL")}
                            >
                                GOL
                            </Button>
                            <Button
                                className="h-11 sm:h-14 text-[11px] sm:text-sm font-bold bg-emerald-500/5 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 rounded-xl transition-all shadow-sm"
                                onClick={() => handleActionSelect("GOL 7M")}
                            >
                                GOL 7m
                            </Button>
                            <Button
                                className="h-11 sm:h-14 text-[11px] sm:text-sm font-bold bg-emerald-500/5 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 rounded-xl transition-all shadow-sm"
                                onClick={() => handleActionSelect("GOL CAMPO A CAMPO")}
                            >
                                GOL C. A CAMPO
                            </Button>
                            <Button
                                className="h-11 sm:h-14 text-[11px] sm:text-sm font-bold bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-600 rounded-xl transition-all shadow-sm"
                                onClick={() => handleActionSelect("FALLO 7M")}
                            >
                                FALLO 7m
                            </Button>
                            <Button
                                className="h-11 sm:h-14 text-[11px] sm:text-sm font-bold bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 rounded-xl transition-all shadow-sm"
                                onClick={() => handleActionSelect("PARADA")}
                            >
                                PARADA PORTERO
                            </Button>
                            <Button
                                className="h-11 sm:h-14 text-[11px] sm:text-sm font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 rounded-xl transition-all shadow-sm"
                                onClick={() => handleActionSelect("FUERA")}
                            >
                                FUERA / POSTE
                            </Button>
                            <Button
                                className="h-11 sm:h-14 text-[11px] sm:text-sm font-bold bg-red-500/10 hover:bg-red-500/20 col-span-2 border border-red-500/20 text-red-600 rounded-xl transition-all shadow-sm"
                                onClick={() => handleActionSelect("PÉRDIDA")}
                            >
                                PÉRDIDA / ERROR
                            </Button>
                            <Button
                                className="h-11 sm:h-14 text-[11px] sm:text-sm font-bold bg-cyan-500/10 hover:bg-cyan-500/20 col-span-2 border border-cyan-500/20 text-cyan-600 rounded-xl transition-all shadow-sm"
                                onClick={() => handleActionSelect("RECUPERACIÓN")}
                            >
                                RECUPERACIÓN DE BALÓN
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                className="h-14 sm:h-20 text-base sm:text-xl font-black bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white col-span-2 border border-emerald-500/30 rounded-xl transition-all shadow-sm"
                                onClick={() => handleActionSelect("GOL CAMPO A CAMPO")}
                            >
                                GOL CAMPO A CAMPO
                            </Button>
                            <Button
                                className="h-14 sm:h-20 text-base sm:text-xl font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 rounded-xl transition-all shadow-sm"
                                onClick={() => handleActionSelect("FUERA")}
                            >
                                FUERA / POSTE
                            </Button>
                            <Button
                                className="h-14 sm:h-20 text-base sm:text-xl font-black bg-red-500/10 hover:bg-red-500/20 col-span-2 border border-red-500/20 text-red-600 rounded-xl transition-all shadow-sm"
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
                        {/* Goalkeeper selection for shots */}
                        {(currentAction === "PARADA" ||
                            currentAction === "FALLO 7M" ||
                            currentAction?.startsWith("GOL") ||
                            currentAction === "FUERA" ||
                            currentAction === "POSTE") &&
                            rivalGoalkeepers &&
                            rivalGoalkeepers.length > 0 && (
                                <div className={`${subPanelBg} p-3 rounded-2xl border transition-colors duration-500`}>
                                    <div className={`text-[10px] font-black mb-2 uppercase tracking-[0.2em] flex items-center justify-between ${labelText}`}>
                                        <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Portero Rival</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {rivalGoalkeepers.map((gk: any) => {
                                            const isActive = activeRivalGoalkeeper === gk.number;
                                            const isSelected = selectedGoalkeeper === gk.number;
                                            return (
                                                <div
                                                    key={gk.number}
                                                    className={`flex items-stretch rounded-xl overflow-hidden border transition-all ${isSelected
                                                        ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg"
                                                        : (isNightMode ? "border-white/5 bg-black/30" : "border-slate-200 bg-white")}`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`h-12 flex-1 justify-start px-2 sm:px-3 rounded-none font-black transition-colors ${isSelected
                                                            ? (isNightMode ? "bg-blue-600/20 text-blue-200" : "bg-blue-50 text-blue-600")
                                                            : (isNightMode ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-50")}`}
                                                        onClick={() => setSelectedGoalkeeper(gk.number)}
                                                    >
                                                        <span className={`text-xs sm:text-sm ${isSelected ? "text-blue-500" : labelText}`}>#{gk.number}</span>
                                                        <span className="ml-2 truncate max-w-[120px]">{gk.name}</span>
                                                    </Button>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSetActiveRivalGK(gk.number);
                                                            setSelectedGoalkeeper(gk.number);
                                                        }}
                                                        className={`w-10 sm:w-12 h-full rounded-none border-l transition-all ${isNightMode ? 'border-white/5' : 'border-slate-200'} ${isActive
                                                            ? (isNightMode ? "bg-green-600/20 text-green-400" : "bg-green-50 text-green-600")
                                                            : (isNightMode ? "bg-black/20 text-slate-600 hover:text-slate-300" : "bg-slate-50/50 text-slate-300 hover:text-slate-600")}`}
                                                        title={isActive ? "Portero actual" : "Marcar como portero principal"}
                                                    >
                                                        <Shield className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "fill-current" : ""}`} />
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                        {(currentAction?.startsWith("GOL") || ["PARADA", "FUERA", "FALLO 7M"].includes(currentAction || "")) && (
                            <div className={`${subPanelBg} p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center transition-colors duration-500`}>
                                <div className={`text-[10px] font-black mb-3 uppercase tracking-[0.2em] ${labelText}`}>
                                    Definición {currentAction === "FUERA" ? "(Fallo)" : ""}
                                </div>
                                <div className="relative aspect-[3/2] w-full max-w-[210px] sm:max-w-[240px] flex flex-col pt-[6px] sm:pt-[8px] px-[6px] sm:px-[8px] bg-[repeating-linear-gradient(45deg,#ef4444_0,#ef4444_12px,#ffffff_12px,#ffffff_24px)] rounded-t-xl shadow-lg border border-white/20">
                                    <div
                                        className={`flex-1 w-full rounded-t-sm relative overflow-hidden shadow-[inset_0_5px_20px_rgba(0,0,0,0.6)] ${isNightMode ? 'bg-slate-900' : 'bg-slate-800'}`}
                                        style={{
                                            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255,255,255,0.05) 11px, rgba(255,255,255,0.05) 12px), repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(255,255,255,0.05) 11px, rgba(255,255,255,0.05) 12px)"
                                        }}
                                    >
                                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-1">
                                            {GOAL_ZONES.map((z) => (
                                                <Button
                                                    key={z}
                                                    variant="ghost"
                                                    className={`h-full w-full text-sm sm:text-xl font-black rounded-md transition-all p-0 backdrop-blur-[1px] border ${selectedGoalZone === z
                                                        ? (currentAction?.startsWith("GOL")
                                                            ? "bg-emerald-500 text-white border-emerald-300 shadow-lg"
                                                            : currentAction === "FALLO 7M" || currentAction === "FUERA"
                                                                ? "bg-red-500 text-white border-red-300 shadow-lg"
                                                                : "bg-blue-500 text-white border-blue-300 shadow-lg")
                                                        : "bg-slate-900/40 text-white/30 border-white/5 hover:border-white/20 hover:bg-slate-700/60 hover:text-white"
                                                        }`}
                                                    onClick={() => setSelectedGoalZone(z)}
                                                >
                                                    {z}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other Detail Subsections */}
                        {currentAction === "PÉRDIDA" ? (
                            <div className={`${subPanelBg} p-3 rounded-2xl border`}>
                                <div className={`text-[10px] font-black mb-3 uppercase tracking-[0.2em] flex items-center gap-2 ${labelText}`}>
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Motivo
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {TURNOVER_TYPES.map((type) => (
                                        <Button
                                            key={type}
                                            onClick={() => setSelectedTurnoverType(type)}
                                            className={`h-11 text-[10px] uppercase font-black rounded-xl transition-all border ${selectedTurnoverType === type
                                                ? "bg-red-500 border-red-400 text-white shadow-md"
                                                : (isNightMode ? "bg-black/30 border-white/5 text-slate-500 hover:text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}`}
                                        >
                                            {type}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : currentAction === "RECUPERACIÓN" ? (
                            <div className={`${subPanelBg} p-3 rounded-2xl border`}>
                                <div className={`text-[10px] font-black mb-3 uppercase tracking-[0.2em] flex items-center gap-2 ${labelText}`}>
                                    <Shield className="w-3.5 h-3.5 text-cyan-500" /> Método
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {RECOVERY_TYPES.map((type) => (
                                        <Button
                                            key={type}
                                            onClick={() => setSelectedRecoveryType(type)}
                                            className={`h-11 text-[10px] uppercase font-black rounded-xl transition-all border ${selectedRecoveryType === type
                                                ? "bg-cyan-500 border-cyan-400 text-white shadow-md"
                                                : (isNightMode ? "bg-black/30 border-white/5 text-slate-500 hover:text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}`}
                                        >
                                            {type}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={`${subPanelBg} p-3 rounded-2xl border`}>
                                    <div className={`text-[10px] font-black mb-3 uppercase tracking-[0.2em] flex items-center gap-2 ${labelText}`}>
                                        <Shield className="w-3.5 h-3.5 text-indigo-500" /> Defensa
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {DEFENSE_TYPES.map((dt) => (
                                            <Button
                                                key={dt}
                                                onClick={() => setSelectedDefense(dt)}
                                                className={`h-9 px-4 text-[10px] uppercase font-black rounded-xl transition-all border ${selectedDefense === dt
                                                    ? "bg-indigo-500 border-indigo-400 text-white shadow-md"
                                                    : (isNightMode ? "bg-black/30 border-white/5 text-slate-500 hover:text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}`}
                                            >
                                                {dt}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {currentAction?.startsWith("GOL") && (
                                    <div className={`${subPanelBg} p-3 rounded-2xl border`}>
                                        <div className={`text-[10px] font-black mb-3 uppercase tracking-[0.2em] flex items-center gap-2 ${labelText}`}>
                                            <Filter className="w-3.5 h-3.5 text-amber-500" /> Situación
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Igualdad", "Superioridad", "Inferioridad", "Contraataque"].map((ctx) => {
                                                const isActive = selectedContext.includes(ctx)
                                                return (
                                                    <Button
                                                        key={ctx}
                                                        onClick={() => toggleContext(ctx)}
                                                        className={`h-10 text-[10px] uppercase font-black rounded-xl transition-all border ${isActive
                                                            ? "bg-amber-500 border-amber-400 text-white shadow-md"
                                                            : (isNightMode ? "bg-black/30 border-white/5 text-slate-500 hover:text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}`}
                                                    >
                                                        {ctx}
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {!currentAction?.includes("7M") && ["GOL", "PARADA", "FUERA", "PÉRDIDA"].includes(currentAction || "") && (
                                    <div className={`${subPanelBg} p-3 rounded-2xl border`}>
                                        <div className={`text-[10px] font-black mb-3 uppercase tracking-[0.2em] ${labelText}`}>
                                            Origen Lanzamiento
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {COURT_ZONES.map((z: any) => (
                                                <Button
                                                    key={z}
                                                    onClick={() => setSelectedCourtZone(z)}
                                                    className={`h-9 text-[9px] font-black uppercase rounded-xl transition-all border ${selectedCourtZone === z
                                                        ? "bg-blue-500 border-blue-400 text-white shadow-md"
                                                        : (isNightMode ? "bg-black/30 border-white/5 text-slate-500 hover:text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}`}
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

                    <div className={`pt-4 border-t mt-auto shrink-0 transition-colors duration-500 ${isNightMode ? 'border-white/10' : 'border-slate-200'}`}>
                        <Button
                            size="lg"
                            className="w-full h-12 sm:h-16 bg-blue-600 hover:bg-blue-500 text-white shadow-xl font-black tracking-[0.18em] sm:tracking-[0.3em] text-sm sm:text-xl uppercase rounded-2xl transition-all active:scale-[0.98] border border-blue-400/50"
                            onClick={() => confirmEvent()}
                        >
                            CONFIRMAR <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

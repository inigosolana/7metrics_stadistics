import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Event } from "@/lib/types/api-types"
import { GOAL_ZONES } from "@/lib/constants"
import { Shield, Target } from "lucide-react"

interface GoalProps {
    readonly events: Event[]
    readonly isNightMode?: boolean
}

export const GoalAdvanced = ({ events, isNightMode = false }: GoalProps) => {
    const [filter, setFilter] = useState<"ALL" | "WING" | "7M">("ALL")

    const relevantShots = useMemo(() => {
        return events.filter((e: Event) => {
            // Asumimos que Team B tira a la portera local (Team A)
            if (e.team !== "B") return false
            if (!e.goal_zone) return false

            const isShot = ["GOL", "GOL 7M", "FALLO 7M", "BLOCADO", "FUERA", "PARADA"].some(
                (act) => e.action.startsWith(act) || e.action === act,
            )
            if (!isShot) return false
            if (filter === "WING" && !e.court_zone?.includes("Extremo")) return false
            if (filter === "7M" && e.action !== "GOL 7M" && e.action !== "FALLO 7M") return false
            return true
        })
    }, [events, filter])

    const heatmapScale = useMemo(() => {
        const hitsPerZone = GOAL_ZONES.map(
            (z) => relevantShots.filter((s: Event) => s.goal_zone === z).length,
        )
        const maxHits = Math.max(...hitsPerZone, 1)
        return { hitsPerZone, maxHits }
    }, [relevantShots])

    const getHeatmapColor = (zoneIndex: number) => {
        const hits = heatmapScale.hitsPerZone[zoneIndex]
        const intensity = hits / heatmapScale.maxHits
        if (hits === 0) return isNightMode ? "rgba(15, 23, 42, 0.3)" : "rgba(226, 232, 240, 0.4)"

        return isNightMode
            ? `rgba(59, 130, 246, ${0.1 + intensity * 0.3})`
            : `rgba(59, 130, 246, ${0.05 + intensity * 0.2})`
    }

    return (
        <div className={`w-full h-full flex flex-col rounded-2xl border transition-colors duration-500 overflow-hidden shadow-xl ${isNightMode ? 'bg-slate-950/90 border-white/5' : 'bg-white/80 border-slate-200'}`}>
            <div className={`flex p-1 border-b gap-1 shrink-0 ${isNightMode ? 'bg-black/40 border-white/5' : 'bg-slate-100/50 border-slate-200'}`}>
                {(["ALL", "WING", "7M"] as const).map((f) => (
                    <Button
                        key={f}
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilter(f)}
                        className={`flex-1 text-[9px] sm:text-[10px] h-7 sm:h-8 font-black uppercase transition-all rounded-lg ${filter === f
                            ? (isNightMode ? "bg-blue-600 text-white shadow-lg" : "bg-blue-500 text-white shadow-md")
                            : (isNightMode ? "text-slate-500 hover:text-white" : "text-slate-400 hover:bg-slate-200/50 hover:text-slate-600")}`}
                    >
                        {f === "ALL" ? "TODOS" : f === "WING" ? "EXTREMOS" : "7M"}
                    </Button>
                ))}
            </div>

            <div className={`flex-1 p-2 sm:p-4 flex items-center justify-center min-h-0 relative overflow-hidden ${isNightMode ? 'bg-[#000000]/20' : 'bg-slate-50/30'}`}>
                <div className={`absolute bottom-0 w-[80%] h-6 blur-2xl rounded-full ${isNightMode ? 'bg-blue-900/20' : 'bg-blue-500/10'}`}></div>

                <div className="relative aspect-[3/2] w-full h-full max-h-[170px] sm:max-h-[220px] max-w-[450px] flex flex-col pt-[8px] sm:pt-[12px] px-[8px] sm:px-[12px] bg-[repeating-linear-gradient(45deg,#dc2626_0,#dc2626_20px,#f8fafc_20px,#f8fafc_40px)] rounded-t-xl shadow-2xl border-t border-x border-white/20">
                        <div
                        className={`flex-1 w-full rounded-t-lg relative overflow-hidden shadow-[inset_0_10px_40px_rgba(0,0,0,0.5)] ${isNightMode ? 'bg-slate-900' : 'bg-slate-800'}`}
                        style={{
                            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.05) 19px, rgba(255,255,255,0.08) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.05) 19px, rgba(255,255,255,0.08) 20px)"
                        }}
                    >
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-1 sm:gap-1.5 sm:p-1.5">
                            {GOAL_ZONES.map((z, index) => {
                                const zoneEvents = relevantShots.filter((s: Event) => s.goal_zone === z)
                                const goals = zoneEvents.filter(e => e.action.startsWith("GOL")).length
                                const saves = zoneEvents.filter(e => e.action === "PARADA").length

                                return (
                                    <div
                                        key={z}
                                        className={`relative rounded-lg flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-[2px] border ${isNightMode ? 'border-white/5 hover:border-white/20' : 'border-white/10 hover:border-white/30'}`}
                                        style={{ backgroundColor: getHeatmapColor(index) }}
                                    >
                                        <span className={`absolute top-1 left-1 text-[8px] sm:text-[9px] font-black pointer-events-none drop-shadow-md ${isNightMode ? 'text-white/20' : 'text-white/40'}`}>{z}</span>

                                        <div className="flex flex-col items-center gap-0.5 z-10">
                                            {goals > 0 && (
                                                <div className="flex items-center gap-1 animate-in zoom-in duration-300">
                                                    <div className="text-sm sm:text-xl font-black text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">{goals}</div>
                                                    <Target className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-red-500/80" />
                                                </div>
                                            )}
                                            {saves > 0 && (
                                                <div className="flex items-center gap-1 animate-in zoom-in slide-in-from-bottom-1 duration-300">
                                                    <div className="text-sm sm:text-xl font-black text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">{saves}</div>
                                                    <Shield className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-emerald-400/80" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`flex justify-center items-center gap-3 sm:gap-6 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black tracking-[0.12em] sm:tracking-[0.2em] shrink-0 border-t uppercase transition-colors duration-500 ${isNightMode ? 'bg-black/60 text-slate-500 border-white/5' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span>Goles</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                    <span>Paradas</span>
                </div>
            </div>
        </div>
    )
}

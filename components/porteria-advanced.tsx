import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Event } from "@/lib/types/api-types"
import { GOAL_ZONES } from "@/lib/constants"

interface PorteriaProps {
    events: Event[]
}

export const PorteriaAdvanced = ({ events }: PorteriaProps) => {
    const [filter, setFilter] = useState<"ALL" | "WING" | "7M">("ALL")

    const relevantShots = useMemo(() => {
        return events.filter((e) => {
            // Filtrar tiros a la portería (asumimos que Team B tira a la portería que estamos viendo,
            // esto depende de cómo se visualice, normalmente se ve la portería local defendida por Team A,
            // luego los tiros son de Team B. El código original hacía: if (e.team !== "B") return false)
            // Mantengo la lógica original per se.

            if (e.team !== "B") return false
            if (!e.goal_zone) return false
            const isShot = ["GOL", "GOL 7M", "FALLO 7M", "BLOCADO", "FUERA", "PARADA"].some(
                (act) => e.action.startsWith(act) || e.action === act,
            )
            if (!isShot) return false
            if (filter === "WING" && !e.court_zone?.includes("Extremo")) return false
            // Uso de casting porque is_7m no está en el tipo Event generado actualmente del Swagger base
            // Asumiré que e.action es suficiente o que is_7m viene en el match event real
            if (filter === "7M" && e.action !== "GOL 7M" && e.action !== "FALLO 7M") return false
            return true
        })
    }, [events, filter])

    const heatmapScale = useMemo(() => {
        const goalsPerZone = GOAL_ZONES.map(
            (z) =>
                relevantShots.filter(
                    (s) => {
                        // Lógica de color original basada en displayColor que no está en Event type
                        // Asignamos color basado en acción si no hay display_color
                        const isGoal = s.action.startsWith("GOL")
                        return s.goal_zone === z && isGoal
                    }
                ).length,
        )
        const maxGoals = Math.max(...goalsPerZone, 1)
        return { goalsPerZone, maxGoals }
    }, [relevantShots])

    const getHeatmapColor = (zoneIndex: number) => {
        const goals = heatmapScale.goalsPerZone[zoneIndex]
        const intensity = goals / heatmapScale.maxGoals
        if (goals === 0) return "rgba(30, 41, 59, 0.5)"
        return `rgba(220, 38, 38, ${0.3 + intensity * 0.5})`
    }

    return (
        <div className="w-full h-full flex flex-col bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-sm">
            <div className="flex p-1 bg-slate-950 border-b border-slate-800 gap-1 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilter("ALL")}
                    className={`flex-1 text-[9px] h-7 font-bold uppercase ${filter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400"}`}
                >
                    TODOS
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilter("WING")}
                    className={`flex-1 text-[9px] h-7 font-bold uppercase ${filter === "WING" ? "bg-slate-800 text-white" : "text-slate-400"}`}
                >
                    EXTREMOS
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilter("7M")}
                    className={`flex-1 text-[9px] h-7 font-bold uppercase ${filter === "7M" ? "bg-slate-800 text-white" : "text-slate-400"}`}
                >
                    7M
                </Button>
            </div>
            <div className="flex-1 p-2 grid grid-cols-3 grid-rows-3 gap-1.5 min-h-0 overflow-hidden">
                {GOAL_ZONES.map((z, index) => {
                    const shotsInZone = relevantShots.filter((s) => s.goal_zone === z)
                    return (
                        <div
                            key={z}
                            className="relative rounded-sm border border-white/10 flex flex-wrap content-center justify-center items-center gap-0.5 p-0.5 overflow-hidden transition-colors duration-300"
                            style={{ backgroundColor: getHeatmapColor(index) }}
                        >
                            <span className="absolute top-0.5 left-0.5 text-[7px] text-slate-500/50 pointer-events-none">{z}</span>

                            {shotsInZone.slice(0, 9).map((shot) => {
                                // Determine color based on action since displayColor is optional/missing
                                let colorClass = "bg-red-500 text-white border-red-300" // Default Fail
                                if (shot.action.startsWith("GOL")) {
                                    if (shot.action.includes("7M")) colorClass = "bg-blue-500 text-white border-blue-300 shadow-[0_0_5px_rgba(59,130,246,0.5)]"
                                    else colorClass = "bg-green-500 text-white border-green-300 shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                                } else if (shot.action.includes("FALLO 7M")) {
                                    colorClass = "bg-orange-500 text-white border-orange-300 shadow-[0_0_5px_rgba(249,115,22,0.5)]"
                                }

                                return (
                                    <div
                                        key={shot.id}
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border ${colorClass}`}
                                        title={`${shot.action} - Jugador ${shot.player}`}
                                    >
                                        {shot.player}
                                    </div>
                                )
                            })}
                            {shotsInZone.length > 9 && (
                                <span className="text-[8px] font-bold text-white">+{shotsInZone.length - 9}</span>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="flex justify-center gap-4 pb-1 text-[8px] text-slate-400 shrink-0 bg-slate-950/50">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> Gol 7M
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Gol
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div> Fallo 7M
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div> Fallo/Parada
                </div>
            </div>
        </div>
    )
}

export const PorteriaLocalSaves = ({ events }: PorteriaProps) => {
    const relevantSaves = useMemo(() => {
        return events.filter((e) => {
            if (e.team !== "B") return false
            if (!e.goal_zone) return false
            return e.action === "PARADA"
        })
    }, [events])

    return (
        <div className="w-full h-full flex flex-col bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-sm">
            <div className="flex p-1 bg-emerald-950 border-b border-emerald-800 shrink-0">
                <div className="flex-1 text-center text-[10px] font-bold uppercase text-emerald-300">PARADAS PORTERO LOCAL</div>
            </div>
            <div className="flex-1 p-2 grid grid-cols-3 grid-rows-3 gap-1.5 min-h-0 overflow-hidden">
                {GOAL_ZONES.map((z) => {
                    const savesInZone = relevantSaves.filter((s) => s.goal_zone === z)
                    return (
                        <div
                            key={z}
                            className="relative rounded-sm border border-white/10 flex flex-wrap content-center justify-center items-center gap-0.5 p-0.5 overflow-hidden transition-colors duration-300 bg-slate-800/50"
                        >
                            <span className="absolute top-0.5 left-0.5 text-[7px] text-slate-500/50 pointer-events-none">{z}</span>

                            {savesInZone.slice(0, 9).map((save) => (
                                <div
                                    key={save.id}
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border bg-emerald-500 text-white border-emerald-300 shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                                    title={`PARADA - Portero ${save.player}`}
                                >
                                    {save.player}
                                </div>
                            ))}
                            {savesInZone.length > 9 && (
                                <span className="text-[8px] font-bold text-white">+{savesInZone.length - 9}</span>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="flex justify-center gap-4 pb-1 text-[8px] text-slate-400 shrink-0 bg-slate-950/50">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Parada Portero Local
                </div>
            </div>
        </div>
    )
}

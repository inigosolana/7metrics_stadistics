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
        return events.filter((e: Event) => {
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
        const hitsPerZone = GOAL_ZONES.map(
            (z) => relevantShots.filter((s: Event) => s.goal_zone === z).length,
        )
        const maxHits = Math.max(...hitsPerZone, 1)
        return { hitsPerZone, maxHits }
    }, [relevantShots])

    const getHeatmapColor = (zoneIndex: number) => {
        const hits = heatmapScale.hitsPerZone[zoneIndex]
        const intensity = hits / heatmapScale.maxHits
        if (hits === 0) return "rgba(30, 41, 59, 0.5)"
        return `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`
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
                    const shotsInZone = relevantShots.filter((s: Event) => s.goal_zone === z)
                    return (
                        <div
                            key={z}
                            className="relative rounded-sm border border-white/10 flex flex-col items-center justify-center overflow-hidden transition-colors duration-300"
                            style={{ backgroundColor: getHeatmapColor(index) }}
                        >
                            <span className="absolute top-0.5 left-0.5 text-[7px] text-slate-500/50 pointer-events-none">{z}</span>

                            {shotsInZone.length > 0 && (
                                <div className="text-center">
                                    <div className="text-xl font-black text-white leading-none">
                                        {shotsInZone.length}
                                    </div>
                                    <div className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Eventos</div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="flex justify-center gap-4 pb-1 text-[8px] text-slate-400 shrink-0 bg-slate-950/50">
                Resumen de todos los lanzamientos por zona
            </div>
        </div>
    )
}

export const PorteriaLocalSaves = ({ events }: PorteriaProps) => {
    const relevantSaves = useMemo(() => {
        return events.filter((e: Event) => {
            if (e.team !== "B") return false
            if (!e.goal_zone) return false
            return e.action === "PARADA"
        })
    }, [events])

    const heatmapScale = useMemo(() => {
        const savesPerZone = GOAL_ZONES.map(
            (z) => relevantSaves.filter((s: Event) => s.goal_zone === z).length,
        )
        const maxSaves = Math.max(...savesPerZone, 1)
        return { savesPerZone, maxSaves }
    }, [relevantSaves])

    const getHeatmapColor = (zoneIndex: number) => {
        const saves = heatmapScale.savesPerZone[zoneIndex]
        const intensity = saves / heatmapScale.maxSaves
        if (saves === 0) return "rgba(6, 78, 59, 0.2)"
        return `rgba(16, 185, 129, ${0.1 + intensity * 0.4})`
    }

    return (
        <div className="w-full h-full flex flex-col bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-sm">
            <div className="flex p-1 bg-emerald-950 border-b border-emerald-800 shrink-0">
                <div className="flex-1 text-center text-[10px] font-bold uppercase text-emerald-300">PARADAS PORTERO LOCAL</div>
            </div>
            <div className="flex-1 p-2 grid grid-cols-3 grid-rows-3 gap-1.5 min-h-0 overflow-hidden">
                {GOAL_ZONES.map((z, index) => {
                    const savesInZone = relevantSaves.filter((s: Event) => s.goal_zone === z)
                    return (
                        <div
                            key={z}
                            className="relative rounded-sm border border-white/10 flex flex-col items-center justify-center overflow-hidden transition-colors duration-300"
                            style={{ backgroundColor: getHeatmapColor(index) }}
                        >
                            <span className="absolute top-0.5 left-0.5 text-[7px] text-emerald-500/30 pointer-events-none">{z}</span>

                            {savesInZone.length > 0 && (
                                <div className="text-center">
                                    <div className="text-2xl font-black text-emerald-400 leading-none drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                        {savesInZone.length}
                                    </div>
                                    <div className="text-[7px] font-bold text-emerald-500/60 uppercase tracking-tighter">Paradas</div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="flex justify-center gap-4 pb-1 text-[8px] text-slate-400 shrink-0 bg-slate-950/50">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Referencia Visual Paradas
                </div>
            </div>
        </div>
    )
}

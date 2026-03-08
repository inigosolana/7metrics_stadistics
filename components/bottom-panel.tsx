"use client"

import { useMemo } from "react"
import { Event } from "@/lib/types/api-types"

interface BottomPanelProps {
    readonly events: Event[]
    readonly teamAName: string
    readonly teamBName: string
    readonly isNightMode?: boolean
}


// ── Tab: Parciales ─────────────────────────────────────────────────────────────
function PartialsTab({ events, teamAName, teamBName, isNightMode }: Omit<BottomPanelProps, "isNightMode"> & { isNightMode: boolean }) {
    const INTERVAL = 5 // minutos

    const partials = useMemo(() => {
        const maxTime = events.length > 0 ? Math.max(...events.map(e => e.timestamp)) : 0
        const maxMin = Math.ceil(maxTime / 60)
        const buckets: { label: string; goalsA: number; goalsB: number }[] = []

        for (let start = 0; start < Math.max(maxMin, INTERVAL); start += INTERVAL) {
            const end = start + INTERVAL
            const bucket = events.filter(e => {
                const min = e.timestamp / 60
                return min >= start && min < end
            })
            buckets.push({
                label: `${start}-${end}'`,
                goalsA: bucket.filter(e => e.team === "A" && e.action.startsWith("GOL")).length,
                goalsB: bucket.filter(e => e.team === "B" && e.action.startsWith("GOL")).length,
            })
        }
        return buckets
    }, [events])

    const maxGoals = Math.max(...partials.flatMap(p => [p.goalsA, p.goalsB]), 1)

    // Acumulados
    let cumA = 0, cumB = 0

    return (
        <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className={`grid grid-cols-[3rem_1fr_2rem_2rem] gap-1 text-[8px] font-black uppercase tracking-wider shrink-0 ${isNightMode ? "text-slate-600" : "text-slate-400"}`}>
                <span>Tramo</span><span></span>
                <span className="text-blue-500 text-center">{teamAName.slice(0, 3)}</span>
                <span className="text-amber-500 text-center">{teamBName.slice(0, 3)}</span>
            </div>
            {partials.map((p, i) => {
                cumA += p.goalsA
                cumB += p.goalsB
                return (
                    <div key={i} className={`grid grid-cols-[3rem_1fr_2rem_2rem] items-center gap-1 py-1 rounded-lg px-1 ${isNightMode ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
                        <span className={`text-[8px] font-bold ${isNightMode ? "text-slate-500" : "text-slate-400"}`}>{p.label}</span>
                        <div className="flex gap-0.5 items-center h-4">
                            {p.goalsA > 0 && <div className="bg-blue-500 rounded-sm h-full transition-all" style={{ width: `${(p.goalsA / maxGoals) * 100}%`, minWidth: "4px" }} />}
                            {p.goalsB > 0 && <div className="bg-amber-500 rounded-sm h-full transition-all ml-auto" style={{ width: `${(p.goalsB / maxGoals) * 100}%`, minWidth: "4px" }} />}
                        </div>
                        <span className="text-[10px] font-black text-blue-500 text-center">{p.goalsA > 0 ? `+${p.goalsA}` : "—"}</span>
                        <span className="text-[10px] font-black text-amber-500 text-center">{p.goalsB > 0 ? `+${p.goalsB}` : "—"}</span>
                    </div>
                )
            })}
            <div className={`grid grid-cols-[3rem_1fr_2rem_2rem] items-center gap-1 py-1.5 px-1 rounded-lg border-t mt-1 ${isNightMode ? "border-white/10" : "border-slate-200"}`}>
                <span className={`text-[8px] font-black uppercase ${isNightMode ? "text-slate-400" : "text-slate-600"}`}>Total</span>
                <span />
                <span className="text-[11px] font-black text-blue-500 text-center">{cumA}</span>
                <span className="text-[11px] font-black text-amber-500 text-center">{cumB}</span>
            </div>
        </div>
    )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function BottomPanel({ events, teamAName, teamBName, isNightMode = false }: BottomPanelProps) {
    const glassBg = isNightMode ? "bg-slate-950/90 border-white/10" : "bg-white/80 border-slate-200"

    return (
        <div className={`flex flex-col h-full border rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${glassBg}`}>
            {/* Header */}
            <div className={`flex items-center gap-2 px-3 py-2 shrink-0 border-b ${isNightMode ? "bg-black/40 border-white/10" : "bg-slate-50/50 border-slate-200"}`}>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isNightMode ? "text-slate-500" : "text-slate-400"}`}>Parciales</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 p-2 sm:p-3 overflow-hidden">
                <PartialsTab events={events} teamAName={teamAName} teamBName={teamBName} isNightMode={isNightMode} />
            </div>
        </div>
    )
}

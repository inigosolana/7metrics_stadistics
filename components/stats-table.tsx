import { useMemo } from "react"
import { Event, Player } from "@/lib/types/api-types"

interface StatsTableProps {
    readonly events: Event[]
    readonly teamAName: string
    readonly teamBName: string
    readonly teamAPlayers: Player[]
    readonly teamBPlayers: Player[]
    readonly isNightMode?: boolean
}

export function StatsTable({
    events,
    teamAName,
    teamBName,
    teamAPlayers,
    teamBPlayers,
    isNightMode = false
}: StatsTableProps) {

    const stats = useMemo(() => {
        const calculate = (team: "A" | "B") => ({
            goals: events.filter((e) => e.team === team && e.action.startsWith("GOL")).length,
            shots: events.filter(
                (e) =>
                    e.team === team &&
                    (e.action.startsWith("GOL") || e.action === "PARADA" || e.action === "FUERA" || e.action === "POSTE"),
            ).length,
            saves: events.filter((e) => e.team === team && e.action === "PARADA").length,
            turnovers: events.filter((e) => e.team === team && e.action === "PÉRDIDA").length,
            possessions: events.filter((e) => e.team === team).length,
            recoveries: events.filter((e) => e.team === team && e.action === "RECUPERACIÓN").length,
            goals7m: events.filter((e) => e.team === team && e.action === "GOL 7M").length,
            goalsSup: events.filter(
                (e) => e.team === team && e.action.startsWith("GOL") && e.context?.includes("Superioridad"),
            ).length,
            goalsInf: events.filter(
                (e) => e.team === team && e.action.startsWith("GOL") && e.context?.includes("Inferioridad"),
            ).length,
            goalsEq: events.filter(
                (e) =>
                    e.team === team &&
                    e.action.startsWith("GOL") &&
                    (e.context?.includes("Igualdad") || !e.context || e.context.length === 0),
            ).length,
        })
        return { A: calculate("A"), B: calculate("B") }
    }, [events])

    const effA = stats.A.shots > 0 ? Math.round((stats.A.goals / stats.A.shots) * 100) : 0
    const effB = stats.B.shots > 0 ? Math.round((stats.B.goals / stats.B.shots) * 100) : 0

    const gkStatsA = useMemo(() => {
        const goalkeepers = teamAPlayers.filter(p => p.is_goalkeeper)
        return goalkeepers.map(gk => {
            const shotsAgainst = events.filter(e =>
                e.team === "B" &&
                e.rival_goalkeeper === gk.number &&
                (e.action.startsWith("GOL") || e.action === "PARADA" || e.action === "FALLO 7M")
            )
            const saves = shotsAgainst.filter(e => e.action === "PARADA" || e.action === "FALLO 7M").length
            const goalsConceded = shotsAgainst.filter(e => e.action.startsWith("GOL")).length
            const totalShots = saves + goalsConceded
            const savePercentage = totalShots > 0 ? Math.round((saves / totalShots) * 100) : 0
            return { number: gk.number, name: gk.name, saves, goalsConceded, totalShots, savePercentage }
        }).filter(gk => gk.totalShots > 0)
    }, [events, teamAPlayers])

    const gkStatsB = useMemo(() => {
        const goalkeepers = teamBPlayers.filter(p => p.is_goalkeeper)
        return goalkeepers.map(gk => {
            const shotsAgainst = events.filter(e =>
                e.team === "A" &&
                e.rival_goalkeeper === gk.number &&
                (e.action.startsWith("GOL") || e.action === "PARADA" || e.action === "FALLO 7M")
            )
            const saves = shotsAgainst.filter(e => e.action === "PARADA" || e.action === "FALLO 7M").length
            const goalsConceded = shotsAgainst.filter(e => e.action.startsWith("GOL")).length
            const totalShots = saves + goalsConceded
            const savePercentage = totalShots > 0 ? Math.round((saves / totalShots) * 100) : 0
            return { number: gk.number, name: gk.name, saves, goalsConceded, totalShots, savePercentage }
        }).filter(gk => gk.totalShots > 0)
    }, [events, teamBPlayers])

    const totalShotsA = gkStatsA.reduce((sum, gk) => sum + gk.totalShots, 0)
    const totalSavesA = gkStatsA.reduce((sum, gk) => sum + gk.saves, 0)
    const gkEffA = totalShotsA > 0 ? Math.round((totalSavesA / totalShotsA) * 100) : 0

    const totalShotsB = gkStatsB.reduce((sum, gk) => sum + gk.totalShots, 0)
    const totalSavesB = gkStatsB.reduce((sum, gk) => sum + gk.saves, 0)
    const gkEffB = totalShotsB > 0 ? Math.round((totalSavesB / totalShotsB) * 100) : 0

    const StatRow = ({ label, valA, valB, highlight = false }: any) => (
        <div className={`flex items-center text-xs py-2 border-b transition-colors duration-200 ${isNightMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'} ${highlight ? (isNightMode ? 'bg-white/5 font-black' : 'bg-slate-100/80 font-black') : ''}`}>
            <div className={`flex-1 text-center ${highlight ? "text-blue-500" : (isNightMode ? "text-slate-300" : "text-slate-700")}`}>{valA}</div>
            <div className={`w-36 text-center text-[10px] font-black uppercase tracking-wider ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
            <div className={`flex-1 text-center ${highlight ? "text-amber-500" : (isNightMode ? "text-slate-300" : "text-slate-700")}`}>{valB}</div>
        </div>
    )

    return (
        <div className={`rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl border transition-all duration-500 ${isNightMode ? 'bg-slate-950/90 border-white/5 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'}`}>
            <div className={`text-center py-2.5 font-black uppercase tracking-[0.3em] text-[10px] ${isNightMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-500 text-white'}`}>
                Estadísticas Globales
            </div>

            <div className={`flex border-b font-black text-[10px] py-2 uppercase tracking-widest ${isNightMode ? 'border-white/5 bg-black/40' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex-1 text-center text-blue-500 truncate px-2">{teamAName}</div>
                <div className="flex-1 text-center text-amber-500 truncate px-2">{teamBName}</div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                <StatRow label="Eficacia" valA={`${effA}%`} valB={`${effB}%`} highlight />
                <StatRow label="Portería" valA={`${gkEffA}%`} valB={`${gkEffB}%`} highlight />

                {gkStatsA.length > 0 && (
                    <div className={`${isNightMode ? 'bg-blue-900/10' : 'bg-blue-50/50'}`}>
                        <div className="text-[9px] font-black text-blue-500 px-3 pt-3 pb-1 uppercase tracking-widest">PORTERAS LOCAL</div>
                        {gkStatsA.map(gk => (
                            <div key={`gkA-${gk.number}`} className="flex items-center text-[10px] py-1.5 px-3 border-b border-white/5">
                                <div className="flex-1 text-left font-bold"><span className="text-blue-500">#{gk.number}</span> {gk.name}</div>
                                <div className={`flex gap-3 text-[10px] ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <span>{gk.saves}/{gk.totalShots} <span className="font-black text-blue-500 ml-1">{gk.savePercentage}%</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {gkStatsB.length > 0 && (
                    <div className={`${isNightMode ? 'bg-amber-900/10' : 'bg-amber-50/50'}`}>
                        <div className="text-[9px] font-black text-amber-500 px-3 pt-3 pb-1 uppercase tracking-widest">PORTERAS RIVAL</div>
                        {gkStatsB.map(gk => (
                            <div key={`gkB-${gk.number}`} className="flex items-center text-[10px] py-1.5 px-3 border-b border-white/5">
                                <div className="flex-1 text-left font-bold"><span className="text-amber-500">#{gk.number}</span> {gk.name}</div>
                                <div className={`flex gap-3 text-[10px] ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <span>{gk.saves}/{gk.totalShots} <span className="font-black text-amber-500 ml-1">{gk.savePercentage}%</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className={`mt-2 border-t ${isNightMode ? 'border-white/5' : 'border-slate-100'}`}></div>

                <StatRow label="Pérdidas" valA={stats.A.turnovers} valB={stats.B.turnovers} />
                <StatRow label="Recuperaciones" valA={stats.A.recoveries} valB={stats.B.recoveries} />
                <StatRow label="Goles 7m" valA={stats.A.goals7m} valB={stats.B.goals7m} />
                <StatRow label="Goles Sup." valA={stats.A.goalsSup} valB={stats.B.goalsSup} />
                <StatRow label="Goles Inf." valA={stats.A.goalsInf} valB={stats.B.goalsInf} />
                <StatRow label="Goles Igual." valA={stats.A.goalsEq} valB={stats.B.goalsEq} />
            </div>
        </div>
    )
}

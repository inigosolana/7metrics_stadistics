
import { useMemo } from "react"
import { Event, Player } from "@/lib/types/api-types"

interface StatsTableProps {
    events: Event[]
    teamAName: string
    teamBName: string
    teamAPlayers: Player[]
    teamBPlayers: Player[]
}

export function StatsTable({
    events,
    teamAName,
    teamBName,
    teamAPlayers,
    teamBPlayers
}: StatsTableProps) {

    // Cálculo local de estadísticas (mantenido del original para asegurar funcionalidad inmediata)
    // En el futuro, esto podría venir directamente de useMatchStatistics()
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
            possessions: events.filter((e) => e.team === team).length, // Esto es aproximado si no hay evento explícito de posesión
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

    // Goalkeeper Stats - Team A goalkeepers face shots from Team B
    const gkStatsA = useMemo(() => {
        const goalkeepers = teamAPlayers.filter(p => p.is_goalkeeper)
        return goalkeepers.map(gk => {
            // Shots where this GK was selected as rivalGoalkeeper (shots from Team B)
            const shotsAgainst = events.filter(e =>
                e.team === "B" &&
                e.rival_goalkeeper === gk.number &&
                (e.action.startsWith("GOL") || e.action === "PARADA" || e.action === "FALLO 7M")
            )
            const saves = shotsAgainst.filter(e => e.action === "PARADA" || e.action === "FALLO 7M").length
            const goalsConceded = shotsAgainst.filter(e => e.action.startsWith("GOL")).length
            const totalShots = saves + goalsConceded
            const savePercentage = totalShots > 0 ? Math.round((saves / totalShots) * 100) : 0

            return {
                number: gk.number,
                name: gk.name,
                saves,
                goalsConceded,
                totalShots,
                savePercentage
            }
        }).filter(gk => gk.totalShots > 0) // Only show GKs who faced shots
    }, [events, teamAPlayers])

    // Goalkeeper Stats - Team B goalkeepers face shots from Team A
    const gkStatsB = useMemo(() => {
        const goalkeepers = teamBPlayers.filter(p => p.is_goalkeeper)
        return goalkeepers.map(gk => {
            // Shots where this GK was selected as rivalGoalkeeper (shots from Team A)
            const shotsAgainst = events.filter(e =>
                e.team === "A" &&
                e.rival_goalkeeper === gk.number &&
                (e.action.startsWith("GOL") || e.action === "PARADA" || e.action === "FALLO 7M")
            )
            const saves = shotsAgainst.filter(e => e.action === "PARADA" || e.action === "FALLO 7M").length
            const goalsConceded = shotsAgainst.filter(e => e.action.startsWith("GOL")).length
            const totalShots = saves + goalsConceded
            const savePercentage = totalShots > 0 ? Math.round((saves / totalShots) * 100) : 0

            return {
                number: gk.number,
                name: gk.name,
                saves,
                goalsConceded,
                totalShots,
                savePercentage
            }
        }).filter(gk => gk.totalShots > 0) // Only show GKs who faced shots
    }, [events, teamBPlayers])

    // Overall GK effectiveness
    const totalShotsA = gkStatsA.reduce((sum, gk) => sum + gk.totalShots, 0)
    const totalSavesA = gkStatsA.reduce((sum, gk) => sum + gk.saves, 0)
    const gkEffA = totalShotsA > 0 ? Math.round((totalSavesA / totalShotsA) * 100) : 0

    const totalShotsB = gkStatsB.reduce((sum, gk) => sum + gk.totalShots, 0)
    const totalSavesB = gkStatsB.reduce((sum, gk) => sum + gk.saves, 0)
    const gkEffB = totalShotsB > 0 ? Math.round((totalSavesB / totalShotsB) * 100) : 0

    const StatRow = ({ label, valA, valB, highlight = false }: any) => (
        <div
            className={`flex items-center text-xs py-2 border-b border-slate-300/40 hover:bg-slate-50 ${highlight ? "bg-slate-100 font-bold" : ""}`}
        >
            <div className={`flex-1 text-center font-bold ${highlight ? "text-blue-700" : "text-slate-700"}`}>{valA}</div>
            <div className="w-36 text-center text-slate-500 uppercase text-sm font-black tracking-wider">{label}</div>
            <div className={`flex-1 text-center font-bold ${highlight ? "text-amber-700" : "text-slate-700"}`}>{valB}</div>
        </div>
    )

    return (
        <div className="bg-white text-slate-900 rounded-lg overflow-hidden flex flex-col h-full shadow-lg text-sm border border-slate-300">
            <div className="bg-green-600 text-white text-center py-2 font-bold uppercase tracking-widest text-[11px]">
                Estadísticas en Tiempo Real
            </div>

            <div className="flex border-b border-slate-300 bg-slate-100 font-bold text-xs py-2">
                <div className="flex-1 text-center text-blue-700 truncate px-1">{teamAName}</div>
                <div className="flex-1 text-center text-amber-700 truncate px-1">{teamBName}</div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-50/50">
                <StatRow label="Efectividad Tiro" valA={`${effA}%`} valB={`${effB}%`} highlight />
                <StatRow label="Efectividad Portería" valA={`${gkEffA}%`} valB={`${gkEffB}%`} highlight />

                {/* Individual Goalkeeper Stats - Team A */}
                {gkStatsA.length > 0 && (
                    <>
                        <div className="text-[10px] font-bold text-blue-600 px-2 pt-2 pb-1 bg-blue-50">PORTEROS {teamAName.toUpperCase()}</div>
                        {gkStatsA.map(gk => (
                            <div key={`gkA-${gk.number}`} className="flex items-center text-[10px] py-1.5 px-2 border-b border-slate-200/60 bg-blue-50/30">
                                <div className="flex-1 text-left">
                                    <span className="font-bold text-blue-700">#{gk.number}</span> {gk.name.split(' ').pop()}
                                </div>
                                <div className="flex gap-3 text-slate-600">
                                    <span><span className="font-semibold">{gk.saves}</span> paradas</span>
                                    <span><span className="font-semibold">{gk.totalShots}</span> lanz.</span>
                                    <span className="font-bold text-blue-700">{gk.savePercentage}%</span>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Individual Goalkeeper Stats - Team B */}
                {gkStatsB.length > 0 && (
                    <>
                        <div className="text-[10px] font-bold text-amber-600 px-2 pt-2 pb-1 bg-amber-50">PORTEROS {teamBName.toUpperCase()}</div>
                        {gkStatsB.map(gk => (
                            <div key={`gkB-${gk.number}`} className="flex items-center text-[10px] py-1.5 px-2 border-b border-slate-200/60 bg-amber-50/30">
                                <div className="flex-1 text-left">
                                    <span className="font-bold text-amber-700">#{gk.number}</span> {gk.name.split(' ').pop()}
                                </div>
                                <div className="flex gap-3 text-slate-600">
                                    <span><span className="font-semibold">{gk.saves}</span> paradas</span>
                                    <span><span className="font-semibold">{gk.totalShots}</span> lanz.</span>
                                    <span className="font-bold text-amber-700">{gk.savePercentage}%</span>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                <div className="my-1 border-t-2 border-slate-300"></div>

                <StatRow label="Pérdidas" valA={stats.A.turnovers} valB={stats.B.turnovers} />
                <StatRow label="Recuperaciones" valA={stats.A.recoveries} valB={stats.B.recoveries} />
                <StatRow label="Posesiones" valA={stats.A.possessions} valB={stats.B.possessions} />
                <StatRow label="Goles 7m" valA={`${stats.A.goals7m}`} valB={`${stats.B.goals7m}`} />
                <div className="my-1 border-t border-slate-200"></div>
                <StatRow label="Goles Superioridad" valA={stats.A.goalsSup} valB={stats.B.goalsSup} />
                <StatRow label="Goles Inferioridad" valA={stats.A.goalsInf} valB={stats.B.goalsInf} />
                <StatRow label="Goles Igualdad" valA={stats.A.goalsEq} valB={stats.B.goalsEq} />
            </div>
        </div>
    )
}

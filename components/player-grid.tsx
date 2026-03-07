import { Button } from "@/components/ui/button"
import { Shield, Trophy } from "lucide-react"
import { Player } from "@/lib/types/api-types"
import { Dispatch, SetStateAction } from "react"

interface PlayerGridProps {
    readonly team: "A" | "B"
    readonly players: Player[]
    readonly selectedPlayerA: number | null
    readonly selectedPlayerB: number | null
    readonly handlePlayerSelect: (team: "A" | "B", number: number) => void
    readonly teamName: string
    readonly activeGoalkeeper: number | null
    readonly setActiveGoalkeeper: Dispatch<SetStateAction<number | null>>
    readonly isNightMode?: boolean
}

export function PlayerGrid({
    team,
    players,
    selectedPlayerA,
    selectedPlayerB,
    handlePlayerSelect,
    teamName,
    activeGoalkeeper,
    setActiveGoalkeeper,
    isNightMode = false
}: PlayerGridProps) {
    const sortedPlayers = [...players].sort((a, b) => a.number - b.number);
    const isTeamA = team === "A";

    const containerStyle = isNightMode
        ? "bg-slate-950/90 border-white/5"
        : "bg-white/80 border-slate-200"

    return (
        <div className={`border rounded-2xl p-3 sm:p-4 h-full flex flex-col min-h-0 shadow-2xl relative overflow-hidden transition-all duration-500 ${containerStyle}`}>
            <div className={`absolute -top-20 -right-20 w-40 h-40 blur-[80px] rounded-full opacity-10 pointer-events-none ${isTeamA ? "bg-blue-500" : "bg-amber-500"}`}></div>

            <div className={`text-sm sm:text-xl font-black mb-3 sm:mb-4 uppercase tracking-[0.12em] sm:tracking-[0.2em] flex items-center justify-center gap-2 sm:gap-3 shrink-0 ${isTeamA ? "text-blue-500" : "text-amber-500"}`}>
                <Trophy className={`w-4 h-4 sm:w-5 sm:h-5 ${isTeamA ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"}`} /> {teamName}
            </div>

            <div className="grid grid-cols-1 gap-1.5 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-2">
                {sortedPlayers.map((player) => {
                    const isSelected = (isTeamA ? selectedPlayerA : selectedPlayerB) === player.number
                    const isActiveGK = activeGoalkeeper === player.number

                    const selectedStyle = isTeamA
                        ? "bg-blue-600 border-blue-400 text-white shadow-xl ring-2 ring-blue-500/20"
                        : "bg-amber-500 border-amber-300 text-white shadow-xl ring-2 ring-amber-500/20";

                    const unselectedStyle = isNightMode
                        ? "bg-black/40 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/10 hover:text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300";

                    return (
                        <div key={player.id || player.number} className="flex gap-1.5 sm:gap-2">
                            <Button
                                variant="outline"
                                className={`flex-1 min-h-[44px] sm:min-h-[55px] flex items-center justify-start px-2.5 sm:px-4 rounded-xl border relative transition-all duration-200 active:scale-95 shadow-md overflow-hidden ${isSelected ? selectedStyle : unselectedStyle} ${isActiveGK && !isSelected ? "ring-2 ring-green-500/30" : ""}`}
                                onClick={() => handlePlayerSelect(team, player.number)}
                            >
                                <span className={`text-lg sm:text-2xl font-black leading-none italic shrink-0 w-7 sm:w-10 text-left ${isSelected ? "text-white" : (isTeamA ? "text-blue-500/40" : "text-amber-500/40")}`}>
                                    {player.number}
                                </span>
                                <div className="flex flex-col ml-2 sm:ml-3 flex-1 min-w-0">
                                    <span className={`text-[11px] sm:text-sm font-black uppercase tracking-tight truncate ${isSelected ? "text-white" : (isNightMode ? "text-slate-200" : "text-slate-800")}`}>
                                        {player.name || `P#${player.number}`}
                                    </span>
                                </div>
                            </Button>

                            {player.is_goalkeeper && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setActiveGoalkeeper(isActiveGK ? null : player.number)}
                                    className={`shrink-0 w-9 sm:w-12 h-auto rounded-xl border transition-all ${isActiveGK
                                        ? "bg-green-500 border-green-400 text-white shadow-lg"
                                        : (isNightMode ? "bg-black/40 border-white/5 text-slate-600" : "bg-white border-slate-200 text-slate-300")
                                        }`}
                                    title={isActiveGK ? "Portero en campo" : "Marcar como portero en campo"}
                                >
                                    <Shield className={`w-4 h-4 sm:w-5 sm:h-5 ${isActiveGK ? "fill-current" : ""}`} />
                                </Button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

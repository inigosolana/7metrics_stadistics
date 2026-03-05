import { Button } from "@/components/ui/button"
import { Shield, Trophy } from "lucide-react"
import { Player } from "@/lib/types/api-types"
import { Dispatch, SetStateAction } from "react"

interface PlayerGridProps {
    team: "A" | "B"
    players: Player[]
    selectedPlayerA: number | null
    selectedPlayerB: number | null
    handlePlayerSelect: (team: "A" | "B", number: number) => void
    teamName: string
    activeGoalkeeper: number | null
    setActiveGoalkeeper: Dispatch<SetStateAction<number | null>>
}

export function PlayerGrid({
    team,
    players,
    selectedPlayerA,
    selectedPlayerB,
    handlePlayerSelect,
    teamName,
    activeGoalkeeper,
    setActiveGoalkeeper
}: PlayerGridProps) {
    // Ordenar jugadores por número para visualización consistente
    const sortedPlayers = [...players].sort((a, b) => a.number - b.number);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 h-full flex flex-col min-h-0 shadow-sm">
            <div
                className={`text-sm font-bold mb-3 uppercase tracking-wide flex items-center gap-2 px-1 shrink-0 ${team === "A" ? "text-blue-400" : "text-amber-400"}`}
            >
                <Trophy className="w-4 h-4" /> {teamName}
            </div>
            <div className="grid grid-cols-1 gap-1.5 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                {sortedPlayers.map((player) => {
                    const isSelected = (team === "A" ? selectedPlayerA : selectedPlayerB) === player.number
                    const isActiveGK = activeGoalkeeper === player.number

                    return (
                        <div key={player.id || player.number} className="flex gap-1">
                            <Button
                                variant="outline"
                                className={`flex-1 min-h-[40px] flex items-center justify-start px-4 border-slate-700 relative transition-all duration-75 active:scale-95 ${isSelected ? (team === "A" ? "bg-blue-600 border-blue-500 text-white" : "bg-amber-600 border-amber-500 text-white") : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"} ${isActiveGK ? "ring-1 ring-green-500 ring-offset-1 ring-offset-slate-900" : ""}`}
                                onClick={() => handlePlayerSelect(team, player.number)}
                            >
                                <span className="text-xl sm:text-2xl lg:text-3xl font-black leading-none italic shrink-0">#{player.number}</span>
                                <div className="flex flex-col ml-3 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold truncate text-slate-200">
                                            {player.name}
                                        </span>
                                        {player.is_goalkeeper && (
                                            <span className="text-[8px] leading-none bg-blue-600/30 text-blue-400 px-1 py-0.5 rounded border border-blue-500/30 font-black shrink-0">
                                                GK
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Button>

                            {player.is_goalkeeper && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setActiveGoalkeeper(isActiveGK ? null : player.number)}
                                    className={`shrink-0 w-10 h-auto border border-slate-700 ${isActiveGK ? "bg-green-600/20 text-green-400 border-green-500/50" : "bg-slate-800 text-slate-500 hover:text-slate-300"}`}
                                    title={isActiveGK ? "Portero en campo" : "Marcar como portero en campo"}
                                >
                                    <Shield className={`w-5 h-5 ${isActiveGK ? "fill-current" : ""}`} />
                                </Button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

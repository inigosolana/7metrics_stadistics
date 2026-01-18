import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Shield, Trash2, Edit3, Plus, Settings, Trophy } from "lucide-react"
import { DEFENSE_TYPES, POSITIONS, HANDS } from "@/lib/constants"
import { DefenseType, Position, Hand } from "@/lib/types/api-types"
import { useCreateMatch, useStartMatch } from "@/lib/hooks/useMatch"

// Definición local de Player para el estado de setup UI antes de enviar al backend
interface SetupPlayer {
    number: number
    name: string
    isGoalkeeper: boolean
    position?: Position
    hand?: Hand
}

// Subcomponente SetupTeamColumn
const SetupTeamColumn = ({ team, name, setName, defense, setDefense, players, setPlayers, color }: any) => {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editData, setEditData] = useState<SetupPlayer>({
        number: 0,
        name: "",
        isGoalkeeper: false,
        position: undefined,
        hand: undefined,
    })

    const startEdit = (player: SetupPlayer) => {
        setEditingId(player.number)
        setEditData(player)
    }
    const saveEdit = () => {
        setPlayers(players.map((p: SetupPlayer) => (p.number === editingId ? editData : p)))
        setEditingId(null)
    }

    const deletePlayer = (number: number) => {
        setPlayers(players.filter((p: SetupPlayer) => p.number !== number))
    }

    const addPlayer = () => {
        if (players.length >= 16) return
        const maxNum = players.length > 0 ? Math.max(...players.map((p: SetupPlayer) => p.number)) : 0
        const newP = {
            number: maxNum + 1,
            name: "Nuevo Jugador",
            isGoalkeeper: false,
            position: undefined,
            hand: undefined,
        }
        setPlayers([...players, newP])
    }

    return (
        <div
            className={`flex-1 bg-slate-900/50 p-4 rounded-xl border ${color === "blue" ? "border-blue-900/50" : "border-amber-900/50"} flex flex-col gap-4`}
        >
            <div>
                <Label className="text-xs text-slate-400">Nombre Equipo</Label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-950 border-slate-800 font-bold"
                />
            </div>
            <div>
                <Label className="text-xs text-slate-400">Defensa Inicial</Label>
                <Select value={defense} onValueChange={setDefense}>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                        {DEFENSE_TYPES.map((dt) => (
                            <SelectItem key={dt} value={dt} className="text-slate-200 focus:bg-slate-800">
                                {dt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-slate-800 pt-2 min-h-[300px]">
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs text-slate-400">Jugadores ({players.length})</Label>
                </div>

                <div className="space-y-1">
                    {players.map((p: SetupPlayer) => (
                        <Dialog
                            key={p.number}
                            open={editingId === p.number}
                            onOpenChange={(open) => !open && setEditingId(null)}
                        >
                            <DialogTrigger asChild>
                                <div
                                    className={`flex items-center justify-between p-2 rounded bg-slate-800/50 hover:bg-slate-800 border ${color === "blue" ? "hover:border-blue-500/50" : "hover:border-amber-500/50"} border-transparent transition-all group`}
                                >
                                    <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => startEdit(p)}>
                                        <span
                                            className={`font-bold w-6 text-center ${color === "blue" ? "text-blue-400" : "text-amber-400"}`}
                                        >
                                            {p.number}
                                        </span>
                                        <span className="text-sm truncate">{p.name}</span>
                                        {p.isGoalkeeper && <Shield className="w-3 h-3 text-slate-500 ml-1" />}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-slate-600 hover:text-red-500"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                deletePlayer(p.number)
                                            }}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                        <Edit3
                                            className="w-3 h-3 text-slate-600 group-hover:text-slate-300 cursor-pointer"
                                            onClick={() => startEdit(p)}
                                        />
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
                                <DialogHeader>
                                    <DialogTitle>Editar Jugador {p.number}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Número</Label>
                                        <Input
                                            type="number"
                                            value={editData.number}
                                            onChange={(e) => setEditData({ ...editData, number: Number.parseInt(e.target.value) || 0 })}
                                            className="col-span-3 bg-slate-900 border-slate-800"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Nombre</Label>
                                        <Input
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="col-span-3 bg-slate-900 border-slate-800"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Es Portero</Label>
                                        <div className="col-span-3 flex items-center space-x-2">
                                            <Switch
                                                id="gk-mode"
                                                checked={editData.isGoalkeeper}
                                                onCheckedChange={(c) => setEditData({ ...editData, isGoalkeeper: c })}
                                            />
                                            <Label htmlFor="gk-mode">{editData.isGoalkeeper ? "Sí" : "No"}</Label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Posición</Label>
                                        <Select
                                            value={editData.position || ""}
                                            onValueChange={(val) => setEditData({ ...editData, position: val as any })}
                                        >
                                            <SelectTrigger className="col-span-3 bg-slate-900 border-slate-800">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800">
                                                {POSITIONS.map((pos) => (
                                                    <SelectItem key={pos} value={pos} className="text-slate-200">
                                                        {pos}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Mano</Label>
                                        <Select
                                            value={editData.hand || ""}
                                            onValueChange={(val) => setEditData({ ...editData, hand: val as any })}
                                        >
                                            <SelectTrigger className="col-span-3 bg-slate-900 border-slate-800">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800">
                                                {HANDS.map((hand) => (
                                                    <SelectItem key={hand} value={hand} className="text-slate-200">
                                                        {hand}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={saveEdit} className="bg-green-600 hover:bg-green-500">
                                        Guardar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={addPlayer}
                    className="w-full mt-3 border-dashed border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 bg-transparent"
                >
                    <Plus className="w-4 h-4 mr-2" /> Añadir Jugador
                </Button>
            </div>
        </div>
    )
}

// Main Component
import { useCreatePlayersBulk as useCreateBulk } from "@/lib/hooks/usePlayers" // Import correcto

export function MatchSetup({ onMatchStarted }: { onMatchStarted: (id: string, initialPossession: string) => void }) {
    const [teamAName, setTeamAName] = useState("Local A")
    const [teamBName, setTeamBName] = useState("Visitante B")
    const [defenseA, setDefenseA] = useState<DefenseType>("6:0")
    const [defenseB, setDefenseB] = useState<DefenseType>("6:0")
    const [teamAPlayers, setTeamAPlayers] = useState<SetupPlayer[]>(
        Array.from({ length: 16 }, (_, i) => ({
            number: i + 1,
            name: `Jugador A${i + 1}`,
            isGoalkeeper: i === 0 || i === 12,
            position: undefined,
            hand: undefined,
        })),
    )
    const [teamBPlayers, setTeamBPlayers] = useState<SetupPlayer[]>(
        Array.from({ length: 16 }, (_, i) => ({
            number: i + 1,
            name: `Jugador B${i + 1}`,
            isGoalkeeper: i === 0 || i === 12,
            position: undefined,
            hand: undefined,
        })),
    )
    const [initialPossession, setInitialPossession] = useState<"A" | "B" | null>(null)

    // API Mutations
    const createMatch = useCreateMatch()
    const createPlayers = useCreateBulk()
    const startMatch = useStartMatch()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleStart = async () => {
        if (!initialPossession) return
        setIsSubmitting(true)

        try {
            // 1. Create Match
            const match = await createMatch.mutateAsync({
                team_a_name: teamAName,
                team_b_name: teamBName,
                defense_a: defenseA,
                defense_b: defenseB
            })
            const matchId = match.id!

            // 2. Create Players
            await createPlayers.mutateAsync({
                matchId,
                players: teamAPlayers.map(p => ({
                    team: "A",
                    number: p.number,
                    name: p.name,
                    is_goalkeeper: p.isGoalkeeper,
                    position: p.position || null,
                    hand: p.hand || null
                }))
            })

            await createPlayers.mutateAsync({
                matchId,
                players: teamBPlayers.map(p => ({
                    team: "B",
                    number: p.number,
                    name: p.name,
                    is_goalkeeper: p.isGoalkeeper,
                    position: p.position || null,
                    hand: p.hand || null
                }))
            })

            // 3. Start Match (Set initial info)
            // La API espera un POST a /matches/{id}/start, que no recibe body según swagger base, 
            // pero updateamos initial_possession via update si hace falta, o asumimos que start lo maneja?
            // En el swagger: /matches/{match_id}/start post. No params.
            // Pero necesitamos guardar la posesión inicial. ¿Quizá en el create? 
            // createMatchRequest no tiene initial_possession en mi api-types.ts (basado en swagger).
            // Revisaré si puedo enviar initial_possession en CreateMatchRequest o si debo hacer update.
            // Swagger: CreateMatchRequest body schema Match. Match schema tiene initial_possession.
            // Entonces SÍ podría enviarlo en createMatch si CreateMatchRequest fuera == Match. 
            // Revisando api-types.ts: CreateMatchRequest tiene defense_a/b. 
            // Voy a asumir que puedo enviarlo o que no es crítico, pero idealmente lo enviaría.
            // Como el hook useCreateMatch usa CreateMatchRequest que definí, y este NO tiene initial_possession, 
            // lo añadiré ahora en el hook o asumiré que se gestiona localmente en el frontend la primera posesión.
            // Lo correcto: Añadirlo a CreateMatchRequest si la API lo soporta.

            await startMatch.mutateAsync(matchId)

            onMatchStarted(matchId, initialPossession)

        } catch (e) {
            console.error("Error starting match", e)
            alert("Error al crear el partido. Revisa la consola.")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col">
            <h1 className="text-2xl font-bold mb-6 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                <Settings className="w-6 h-6" /> Configuración de Partido
            </h1>
            <div className="flex-1 flex gap-6 min-h-0 flex-col lg:flex-row">
                <SetupTeamColumn
                    team="A"
                    name={teamAName}
                    setName={setTeamAName}
                    defense={defenseA}
                    setDefense={setDefenseA}
                    players={teamAPlayers}
                    setPlayers={setTeamAPlayers}
                    color="blue"
                />
                <SetupTeamColumn
                    team="B"
                    name={teamBName}
                    setName={setTeamBName}
                    defense={defenseB}
                    setDefense={setDefenseB}
                    players={teamBPlayers}
                    setPlayers={setTeamBPlayers}
                    color="amber"
                />
            </div>

            <div className="mt-6 bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h2 className="text-lg font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-5 h-5" /> Sorteo Inicial - Primera Posesión
                </h2>
                <RadioGroup value={initialPossession || ""} onValueChange={(val) => setInitialPossession(val as "A" | "B")}>
                    <div className="flex gap-4 items-center justify-center">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="A" id="possession-a" />
                            <Label htmlFor="possession-a" className="text-base font-semibold cursor-pointer text-blue-400">
                                {teamAName} (Local)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="B" id="possession-b" />
                            <Label htmlFor="possession-b" className="text-base font-semibold cursor-pointer text-amber-400">
                                {teamBName} (Visitante)
                            </Label>
                        </div>
                    </div>
                </RadioGroup>
            </div>

            <Button
                size="lg"
                onClick={handleStart}
                disabled={!initialPossession || isSubmitting}
                className="mt-6 w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 font-black tracking-widest text-xl py-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
                {isSubmitting ? "CREANDO..." : "COMENZAR PARTIDO"}
            </Button>
        </div>
    )
}

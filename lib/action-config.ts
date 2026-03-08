import { ActionType } from "./types/api-types"

export const ACTION_CONFIG: Record<ActionType, { color: string; bg: string; label: string }> = {
    "GOL":                  { color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Gol" },
    "GOL 7M":               { color: "text-lime-400",    bg: "bg-lime-500/20",    label: "Gol 7m" },
    "GOL CAMPO A CAMPO":    { color: "text-yellow-400",  bg: "bg-yellow-500/20",  label: "C. a C." },
    "FALLO 7M":             { color: "text-rose-400",    bg: "bg-rose-500/20",    label: "Fallo 7m" },
    "PARADA":               { color: "text-sky-400",     bg: "bg-sky-500/20",     label: "Parada" },
    "FUERA":                { color: "text-slate-400",   bg: "bg-slate-500/20",   label: "Fuera" },
    "POSTE":                { color: "text-orange-400",  bg: "bg-orange-500/20",  label: "Poste" },
    "BLOCADO":              { color: "text-purple-400",  bg: "bg-purple-500/20",  label: "Blocado" },
    "PÉRDIDA":              { color: "text-red-400",     bg: "bg-red-500/20",     label: "Pérdida" },
    "RECUPERACIÓN":         { color: "text-cyan-400",    bg: "bg-cyan-500/20",    label: "Recup." },
    "ASISTENCIA":           { color: "text-violet-400",  bg: "bg-violet-500/20",  label: "Asist." },
}


import { DefenseType } from "./types/api-types"

export const COURT_ZONES = ["Extremo Izq", "Lateral Izq", "Central", "Lateral Der", "Extremo Der", "Pivote", "9m"]
export const GOAL_ZONES = [1, 2, 3, 4, 5, 6, 7, 8, 9]
export const DEFENSE_TYPES: DefenseType[] = ["6:0", "5:1", "3:2:1", "4:2", "Mixta", "Presión", "Otro"]
export const CONTEXTS = ["Igualdad", "Superioridad", "Inferioridad", "Contraataque"]
export const POSITIONS = ["Portero", "Extremo Izq", "Extremo Der", "Lateral Izq", "Lateral Der", "Central", "Pivote"]
export const HANDS = ["Diestro", "Zurdo"]
export const TURNOVER_TYPES = [
    "Pasos",
    "Dobles",
    "Falta en ataque",
    "Pase y va",
    "Recepción fallida",
    "Pisando área",
    "3 segundos",
]
export const RECOVERY_TYPES = ["Robo", "Interceptación", "Falta en Ataque"]

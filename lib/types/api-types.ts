export type TeamSide = "A" | "B";
export type MatchStatus = "SETUP" | "IN_PROGRESS" | "PAUSED" | "FINISHED";
export type DefenseType = "6:0" | "5:1" | "3:2:1" | "4:2" | "Mixta" | "Presión" | "Otro";
export type ActionType =
    | "GOL"
    | "GOL 7M"
    | "GOL CAMPO A CAMPO"
    | "FALLO 7M"
    | "PARADA"
    | "FUERA"
    | "POSTE"
    | "BLOCADO"
    | "PÉRDIDA"
    | "RECUPERACIÓN"
    | "ASISTENCIA";

export type CourtZone = "Extremo Izq" | "Lateral Izq" | "Central" | "Lateral Der" | "Extremo Der" | "Pivote" | "9m";
export type Position = "Portero" | "Extremo Izq" | "Extremo Der" | "Lateral Izq" | "Lateral Der" | "Central" | "Pivote";
export type Hand = "Diestro" | "Zurdo";

// --- ENTITIES ---

export interface Match {
    id?: string;
    team_a_name: string;
    team_b_name: string;
    defense_a?: DefenseType;
    defense_b?: DefenseType;
    initial_possession?: TeamSide | null;
    local_score?: number;
    visitor_score?: number;
    total_time_seconds?: number;
    status?: MatchStatus;
    created_at?: string;
    updated_at?: string;
}

export interface Player {
    id?: string;
    match_id: string;
    team: TeamSide;
    number: number;
    name: string;
    is_goalkeeper?: boolean;
    position?: Position | null;
    hand?: Hand | null;
    created_at?: string;
}

export interface BulkPlayerCreate {
    players: Record<string, any>[]; // Simplification for bulk creation payload
}

export interface Event {
    id?: string;
    match_id: string;
    timestamp: number;
    time_formatted: string;
    player: number;
    team: TeamSide;
    action: ActionType;
    court_zone?: CourtZone | null;
    goal_zone?: number | null;
    defense_at_moment?: DefenseType | null;
    context?: string[] | null;
    rival_goalkeeper?: number | null;
    created_at?: string;
}

// --- API REQUEST/RESPONSE TYPES ---

export interface CreateMatchRequest {
    team_a_name: string;
    team_b_name: string;
    defense_a?: DefenseType;
    defense_b?: DefenseType;
}

export interface CreatePlayerRequest {
    match_id: string;
    team: TeamSide;
    number: number;
    name: string;
    is_goalkeeper?: boolean;
    position?: Position | null;
    hand?: Hand | null;
}

export interface CreateEventRequest {
    match_id: string;
    timestamp: number;
    time_formatted: string;
    player: number;
    team: TeamSide;
    action: ActionType;
    court_zone?: CourtZone | null;
    goal_zone?: number | null;
    defense_at_moment?: DefenseType | null;
    context?: string[] | null;
    rival_goalkeeper?: number | null;
}

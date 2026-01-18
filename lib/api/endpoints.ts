export const ENDPOINTS = {
    // Matches
    MATCH_CREATE: '/matches/',
    MATCH_LIST: '/matches/',
    MATCH_GET: (id: string) => `/matches/${id}`,
    MATCH_START: (id: string) => `/matches/${id}/start`,
    MATCH_PAUSE: (id: string) => `/matches/${id}/pause`,
    MATCH_FINISH: (id: string) => `/matches/${id}/finish`,

    // Players
    PLAYER_CREATE: (matchId: string) => `/matches/${matchId}/players/`,
    PLAYER_LIST: (matchId: string) => `/matches/${matchId}/players/`,
    PLAYER_BULK: (matchId: string) => `/matches/${matchId}/players/bulk`,
    PLAYER_DELETE: (matchId: string, playerId: string) => `/matches/${matchId}/players/${playerId}`,

    // Events
    EVENT_CREATE: '/events/',
    EVENT_LIST: (matchId: string) => `/events/${matchId}`,
    EVENT_UNDO_LAST: (matchId: string) => `/events/last/${matchId}`,

    // Statistics
    STATS_FULL: (matchId: string) => `/matches/${matchId}/statistics/`,
    STATS_GOALKEEPERS: (matchId: string) => `/matches/${matchId}/statistics/goalkeepers`,
    STATS_EXPORT_CSV: (matchId: string) => `/matches/${matchId}/statistics/export/csv`,
};


import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { Player, CreatePlayerRequest } from '@/lib/types/api-types';

export const playersApi = {
    create: async (matchId: string, data: Omit<CreatePlayerRequest, 'match_id'>): Promise<Player> => {
        // La API espera CreatePlayerRequest que incluye match_id, pero al llamar a este método quizá sea redundante pasarlo en 'data'.
        // Sin embargo, el Swagger dice que create_player recibe un Player object en el body y match_id en el path.
        // El Schema 'Player' tiene match_id.
        const payload = { ...data, match_id: matchId };
        const response = await apiClient.post(ENDPOINTS.PLAYER_CREATE(matchId), payload);
        return response.data;
    },

    createBulk: async (matchId: string, players: Omit<CreatePlayerRequest, 'match_id'>[]): Promise<Player[]> => {
        const payload = {
            players: players.map(p => ({ ...p, match_id: matchId }))
        };
        const response = await apiClient.post(ENDPOINTS.PLAYER_BULK(matchId), payload);
        return response.data;
    },

    getAll: async (matchId: string, team?: string): Promise<Player[]> => {
        const params = team ? { team } : {};
        const response = await apiClient.get(ENDPOINTS.PLAYER_LIST(matchId), { params });
        return response.data;
    },

    delete: async (matchId: string, playerId: string): Promise<void> => {
        await apiClient.delete(ENDPOINTS.PLAYER_DELETE(matchId, playerId));
    },
};

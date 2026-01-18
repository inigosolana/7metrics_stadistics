import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

// Tipos específicos de respuesta para stats, si la API los devuelve como dicts genéricos
// El Swagger dice "schema: {}" para las respuestas de stats, así que usaré `any` o tipos inferidos por ahora hasta tener la respuesta real.
// Idealmente el backend debería tener schemas más estrictos para esto.

export const statisticsApi = {
    getFullStats: async (matchId: string): Promise<any> => {
        const response = await apiClient.get(ENDPOINTS.STATS_FULL(matchId));
        return response.data;
    },

    getGoalkeeperStats: async (matchId: string): Promise<any> => {
        const response = await apiClient.get(ENDPOINTS.STATS_GOALKEEPERS(matchId));
        return response.data;
    },

    exportCsv: async (matchId: string): Promise<Blob> => {
        const response = await apiClient.get(ENDPOINTS.STATS_EXPORT_CSV(matchId), {
            responseType: 'blob'
        });
        return response.data;
    },
};

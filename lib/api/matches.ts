
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { Match, CreateMatchRequest } from '@/lib/types/api-types';

export const matchesApi = {
    create: async (data: CreateMatchRequest): Promise<Match> => {
        const response = await apiClient.post(ENDPOINTS.MATCH_CREATE, data);
        return response.data;
    },

    getAll: async (skip = 0, limit = 50): Promise<Match[]> => {
        const response = await apiClient.get(ENDPOINTS.MATCH_LIST, {
            params: { skip, limit }
        });
        return response.data;
    },

    getById: async (id: string): Promise<Match> => {
        const response = await apiClient.get(ENDPOINTS.MATCH_GET(id));
        return response.data;
    },

    start: async (id: string): Promise<void> => {
        await apiClient.post(ENDPOINTS.MATCH_START(id));
    },

    pause: async (id: string): Promise<void> => {
        await apiClient.post(ENDPOINTS.MATCH_PAUSE(id));
    },

    finish: async (id: string): Promise<void> => {
        await apiClient.post(ENDPOINTS.MATCH_FINISH(id));
    },
};

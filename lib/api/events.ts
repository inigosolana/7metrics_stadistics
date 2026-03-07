import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { Event, CreateEventRequest, UpdateEventRequest } from '@/lib/types/api-types';

export const eventsApi = {
    create: async (data: CreateEventRequest): Promise<Event> => {
        const response = await apiClient.post(ENDPOINTS.EVENT_CREATE, data);
        return response.data;
    },

    getAll: async (matchId: string): Promise<Event[]> => {
        const response = await apiClient.get(ENDPOINTS.EVENT_LIST(matchId));
        return response.data;
    },

    undoLast: async (matchId: string): Promise<void> => {
        await apiClient.delete(ENDPOINTS.EVENT_UNDO_LAST(matchId));
    },

    deleteById: async (eventId: string): Promise<void> => {
        await apiClient.delete(ENDPOINTS.EVENT_DELETE(eventId));
    },

    update: async (eventId: string, data: UpdateEventRequest): Promise<Event> => {
        const response = await apiClient.patch(ENDPOINTS.EVENT_UPDATE(eventId), data);
        return response.data;
    },
};

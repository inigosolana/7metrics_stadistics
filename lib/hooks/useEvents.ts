
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api/events';
import { CreateEventRequest } from '@/lib/types/api-types';
import { matchKeys } from './useMatch';
import { statisticsKeys } from './useStatistics';

export const eventKeys = {
    all: ['events'] as const,
    byMatch: (matchId: string) => [...eventKeys.all, 'match', matchId] as const,
};

export function useEventsByMatch(matchId: string | null) {
    return useQuery({
        queryKey: eventKeys.byMatch(matchId!),
        queryFn: () => eventsApi.getAll(matchId!),
        enabled: !!matchId,
    });
}

export function useCreateEvent(matchId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEventRequest) => eventsApi.create(data),
        onSuccess: (newEvent) => {
            queryClient.invalidateQueries({ queryKey: eventKeys.byMatch(matchId) });

            // Invalidar estadísticas para recalcular goles entiempo real
            queryClient.invalidateQueries({ queryKey: statisticsKeys.match(matchId) });
            queryClient.invalidateQueries({ queryKey: statisticsKeys.goalkeepers(matchId) });
            queryClient.invalidateQueries({ queryKey: statisticsKeys.heatmap(matchId) });

            // Invalidar match para score y tiempo
            queryClient.invalidateQueries({ queryKey: matchKeys.detail(matchId) });
        },
    });
}

export function useUndoLastEvent(matchId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => eventsApi.undoLast(matchId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: eventKeys.byMatch(matchId) });
            queryClient.invalidateQueries({ queryKey: statisticsKeys.match(matchId) });
            queryClient.invalidateQueries({ queryKey: statisticsKeys.goalkeepers(matchId) });
            queryClient.invalidateQueries({ queryKey: statisticsKeys.heatmap(matchId) });
            queryClient.invalidateQueries({ queryKey: matchKeys.detail(matchId) });
        },
    });
}

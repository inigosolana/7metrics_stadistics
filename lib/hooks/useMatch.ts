
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi } from '@/lib/api/matches';
import { CreateMatchRequest } from '@/lib/types/api-types';

export const matchKeys = {
    all: ['matches'] as const,
    lists: () => [...matchKeys.all, 'list'] as const,
    detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
};

export function useMatch(matchId: string | null) {
    return useQuery({
        queryKey: matchKeys.detail(matchId!),
        queryFn: () => matchesApi.getById(matchId!),
        enabled: !!matchId,
        staleTime: 1000 * 30, // 30s de cache
    });
}

export function useMatchesList() {
    return useQuery({
        queryKey: matchKeys.lists(),
        queryFn: () => matchesApi.getAll(),
    });
}

export function useCreateMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMatchRequest) => matchesApi.create(data),
        onSuccess: (newMatch) => {
            queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
            queryClient.setQueryData(matchKeys.detail(newMatch.id!), newMatch);
        },
    });
}

export function useStartMatch(matchId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id?: string) => {
            const finalId = id || matchId;
            if (!finalId) throw new Error("Match ID is required");
            return matchesApi.start(finalId);
        },
        onSuccess: (_, id) => {
            const finalId = id || matchId;
            if (finalId) {
                queryClient.invalidateQueries({ queryKey: matchKeys.detail(finalId) });
            }
        },
    });
}

export function usePauseMatch(matchId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => matchesApi.pause(matchId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: matchKeys.detail(matchId) });
        },
    });
}

export function useFinishMatch(matchId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => matchesApi.finish(matchId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: matchKeys.detail(matchId) });
        },
    });
}

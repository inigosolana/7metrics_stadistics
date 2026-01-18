import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playersApi } from '@/lib/api/players';
import { CreatePlayerRequest } from '@/lib/types/api-types';

export const playerKeys = {
    all: ['players'] as const,
    byMatch: (matchId: string) => [...playerKeys.all, 'match', matchId] as const,
};

export function usePlayers(matchId: string | null, team?: string) {
    return useQuery({
        queryKey: [...playerKeys.byMatch(matchId!), team],
        queryFn: () => playersApi.getAll(matchId!, team),
        enabled: !!matchId,
    });
}

export function useCreatePlayer(matchId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Omit<CreatePlayerRequest, 'match_id'>) => playersApi.create(matchId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: playerKeys.byMatch(matchId) });
        },
    });
}

export function useCreatePlayersBulk(matchId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ matchId: dynamicId, players }: { matchId?: string, players: Omit<CreatePlayerRequest, 'match_id'>[] }) => {
            const finalId = dynamicId || matchId;
            if (!finalId) throw new Error("Match ID is required");
            return playersApi.createBulk(finalId, players);
        },
        onSuccess: (_, variables) => {
            const finalId = variables.matchId || matchId;
            if (finalId) {
                queryClient.invalidateQueries({ queryKey: playerKeys.byMatch(finalId) });
            }
        },
    });
}

export function useDeletePlayer(matchId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (playerId: string) => playersApi.delete(matchId, playerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: playerKeys.byMatch(matchId) });
        },
    });
}

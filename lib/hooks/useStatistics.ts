
import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '@/lib/api/statistics';

export const statisticsKeys = {
    all: ['statistics'] as const,
    match: (matchId: string) => [...statisticsKeys.all, matchId] as const,
    goalkeepers: (matchId: string) => [...statisticsKeys.all, matchId, 'goalkeepers'] as const,
    heatmap: (matchId: string) => [...statisticsKeys.all, matchId, 'heatmap'] as const,
};

export function useMatchStatistics(matchId: string | null) {
    return useQuery({
        queryKey: statisticsKeys.match(matchId!),
        queryFn: () => statisticsApi.getFullStats(matchId!),
        enabled: !!matchId,
        // Refetch frecuente durante el partido si se desea tiempo real real
        // refetchInterval: 5000, 
    });
}

export function useGoalkeeperStatistics(matchId: string | null) {
    return useQuery({
        queryKey: statisticsKeys.goalkeepers(matchId!),
        queryFn: () => statisticsApi.getGoalkeeperStats(matchId!),
        enabled: !!matchId,
    });
}

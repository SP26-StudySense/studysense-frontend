import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { usePromiseMutation } from '@/shared/hooks';
import { QueryParams } from '@/shared/types';
import * as api from '../api';
import { StartSessionRequest, EndSessionRequest, LogEventRequest } from '../types';

export function useActiveSession() {
    return useQuery({
        queryKey: queryKeys.studySessions.active(),
        queryFn: api.getActiveSession,
        staleTime: 1000 * 60, // 1 minute
        retry: false, // Don't retry if it fails (likely 404/204 when no session)
    });
}

export function useSessionById(id: string) {
    return useQuery({
        queryKey: queryKeys.studySessions.detail(id),
        queryFn: () => api.getSessionById(id),
        enabled: !!id,
    });
}

export function useSessionHistory(params?: QueryParams) {
    return useQuery({
        queryKey: queryKeys.studySessions.history(params),
        queryFn: () => api.getSessionHistory(params),
    });
}

export function useRecentSessions(limit: number = 5) {
    return useQuery({
        queryKey: queryKeys.studySessions.recent(),
        queryFn: () => api.getRecentSessions(limit),
    });
}

export function useSessionStatistics(period: 'week' | 'month' | 'all' = 'week') {
    return useQuery({
        queryKey: queryKeys.studySessions.statistics(period),
        queryFn: () => api.getSessionStatistics(period),
    });
}

export function useStartSession() {
    const queryClient = useQueryClient();

    return usePromiseMutation({
        mutationFn: (data: StartSessionRequest) => api.startSession(data),
        toastMessages: {
            loading: 'Starting session...',
            success: 'Study session started',
            error: 'Failed to start session',
        },
        onSuccess: () => {
            // Refresh active session query
            queryClient.invalidateQueries({ queryKey: queryKeys.studySessions.active() });
        },
    });
}

export function usePauseSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.pauseSession(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studySessions.active() });
        },
    });
}

export function useResumeSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.resumeSession(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studySessions.active() });
        },
    });
}

export function useEndSession() {
    const queryClient = useQueryClient();

    return usePromiseMutation({
        mutationFn: ({ id, data }: { id: string; data: EndSessionRequest }) => api.endSession(id, data),
        toastMessages: {
            loading: 'Saving session summary...',
            success: 'Session completed successfully!',
            error: 'Failed to save session summary',
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studySessions.active() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studySessions.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.studySessions.history() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studySessions.recent() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studySessions.statistics() });
        },
    });
}

export function useLogEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: LogEventRequest }) => api.logStudyEvent(id, data),
        onSuccess: (data, variables) => {
            // We don't necessarily need to invalidate queries on every event to prevent extra network calls,
            // but we could if needed for specific use cases
        },
    });
}

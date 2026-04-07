/**
 * Study Sessions Queries
 * React Query hooks for GET operations
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import * as api from './api';
import type {
  ActiveSessionResponse,
  SessionDetailResponse,
  SessionHistoryParams,
  SessionHistoryItem,
  RecentSessionItem,
  SessionStatistics,
  SessionStatisticsParams,
} from '../types';
import type { PaginatedResponse } from '@/shared/types';

/**
 * Get the user's currently active session (if any).
 * Returns `null` when there is no active session (204 No Content).
 */
export function useActiveSession(
  planId?: number,
  options?: Omit<
    UseQueryOptions<ActiveSessionResponse | null>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.studySessions.active(planId),
    queryFn: () => api.getActiveSession(planId),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    ...options,
  });
}

/**
 * Get full session detail by ID.
 */
export function useSessionById(
  id: string,
  options?: Omit<
    UseQueryOptions<SessionDetailResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.studySessions.detail(id),
    queryFn: () => api.getSessionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get paginated session history.
 */
export function useSessionHistory(
  params: SessionHistoryParams = {},
  options?: Omit<
    UseQueryOptions<PaginatedResponse<SessionHistoryItem>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.studySessions.history(params),
    queryFn: () => api.getSessionHistory(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Get recent sessions (for dashboard widget).
 */
export function useRecentSessions(
  limit: number = 5,
  options?: Omit<
    UseQueryOptions<RecentSessionItem[]>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.studySessions.recent(limit),
    queryFn: () => api.getRecentSessions(limit),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Get session statistics for a given period.
 */
export function useSessionStatistics(
  params: SessionStatisticsParams = {},
  options?: Omit<
    UseQueryOptions<SessionStatistics>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.studySessions.statistics(params),
    queryFn: () => api.getSessionStatistics(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

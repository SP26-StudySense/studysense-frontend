/**
 * Study Sessions Mutations
 * React Query hooks for POST/PATCH operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import * as api from './api';
import type {
  StartSessionRequest,
  StartSessionResponse,
  PauseSessionResponse,
  ResumeSessionResponse,
  EndSessionRequest,
  EndSessionResponse,
  LogEventRequest,
  LogEventResponse,
} from '../types';

/**
 * Start a new study session.
 * Invalidates active session and recent sessions caches on success.
 */
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation<StartSessionResponse, Error, StartSessionRequest>({
    mutationFn: api.startSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studySessions.active(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.studySessions.recent(),
      });
    },
  });
}

/**
 * Pause an active session.
 */
export function usePauseSession() {
  const queryClient = useQueryClient();

  return useMutation<PauseSessionResponse, Error, string>({
    mutationFn: api.pauseSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studySessions.active(),
      });
    },
  });
}

/**
 * Resume a paused session.
 */
export function useResumeSession() {
  const queryClient = useQueryClient();

  return useMutation<ResumeSessionResponse, Error, string>({
    mutationFn: api.resumeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studySessions.active(),
      });
    },
  });
}

/**
 * End a session with optional summary data.
 * Invalidates all session-related caches on success.
 */
export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation<
    EndSessionResponse,
    Error,
    { id: string; request: EndSessionRequest }
  >({
    mutationFn: ({ id, request }) => api.endSession(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studySessions.active(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.studySessions.all,
      });
    },
  });
}

/**
 * Log a study event during a session.
 */
export function useLogEvent() {
  return useMutation<
    LogEventResponse,
    Error,
    { sessionId: string; request: LogEventRequest }
  >({
    mutationFn: ({ sessionId, request }) =>
      api.logStudyEvent(sessionId, request),
  });
}

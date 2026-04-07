/**
 * Study Sessions API — Pure Functions
 * No React hooks. Can be used anywhere: hooks, server actions, tests.
 */

import { get, post, patch } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { ApiException } from '@/shared/api/errors';
import type {
  StartSessionRequest,
  StartSessionResponse,
  PauseSessionResponse,
  ResumeSessionResponse,
  EndSessionRequest,
  EndSessionResponse,
  ActiveSessionResponse,
  SessionDetailResponse,
  SessionHistoryParams,
  SessionHistoryItem,
  RecentSessionItem,
  SessionStatistics,
  SessionStatisticsParams,
  LogEventRequest,
  LogEventResponse,
} from '../types';
import type { PaginatedResponse } from '@/shared/types';

const ep = endpoints.studySessions;

// ─── Session Lifecycle ──────────────────────────────────────────────────────

export async function startSession(
  request: StartSessionRequest
): Promise<StartSessionResponse> {
  return post<StartSessionResponse>(ep.start, request);
}

export async function pauseSession(id: string): Promise<PauseSessionResponse> {
  return patch<PauseSessionResponse>(ep.pause(id), {});
}

export async function resumeSession(id: string): Promise<ResumeSessionResponse> {
  return patch<ResumeSessionResponse>(ep.resume(id), {});
}

export async function endSession(
  id: string,
  request: EndSessionRequest
): Promise<EndSessionResponse> {
  return patch<EndSessionResponse, EndSessionRequest>(ep.end(id), request);
}

// ─── Session Queries ────────────────────────────────────────────────────────

export async function getActiveSession(
  planId?: number
): Promise<ActiveSessionResponse | null> {
  try {
    return await get<ActiveSessionResponse | null>(ep.active, {
      params: planId ? { planId } : undefined,
    });
  } catch (error: unknown) {
    // 204 No Content means the user has no active session.
    if (error instanceof ApiException && error.status === 204) {
      return null;
    }
    throw error;
  }
}

export async function getSessionById(id: string): Promise<SessionDetailResponse> {
  return get<SessionDetailResponse>(ep.byId(id));
}

export async function getSessionHistory(
  params: SessionHistoryParams
): Promise<PaginatedResponse<SessionHistoryItem>> {
  const { studyPlanId, ...restParams } = params;
  const normalizedParams: SessionHistoryParams = {
    ...restParams,
    planId: restParams.planId ?? studyPlanId,
  };

  return get<PaginatedResponse<SessionHistoryItem>>(ep.history, {
    params: normalizedParams,
  });
}

export async function getRecentSessions(
  limit: number = 5
): Promise<RecentSessionItem[]> {
  return get<RecentSessionItem[]>(ep.recent, { params: { limit } });
}

export async function getSessionStatistics(
  params: SessionStatisticsParams = {}
): Promise<SessionStatistics> {
  const { studyPlanId, ...restParams } = params;
  const normalizedParams: SessionStatisticsParams = {
    ...restParams,
    planId: restParams.planId ?? studyPlanId,
  };

  return get<SessionStatistics>(ep.statistics, {
    params: normalizedParams,
  });
}

// ─── Study Events ───────────────────────────────────────────────────────────

export async function logStudyEvent(
  sessionId: string,
  request: LogEventRequest
): Promise<LogEventResponse> {
  return post<LogEventResponse>(ep.events(sessionId), request);
}

/**
 * Study Sessions API — Pure Functions
 * No React hooks. Can be used anywhere: hooks, server actions, tests.
 */

import { get, post, patch, put } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
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
  LogEventRequest,
  LogEventResponse,
} from '../types';
import type { PaginatedResponse } from '@/shared/types';

const ep = endpoints.studySessions;

// ─── Task Update ────────────────────────────────────────────────────────────

export async function markTaskCompleted(taskId: number, moduleId: number, task: {
  title: string;
  description?: string;
  estimatedMinutes: number;
}): Promise<void> {
  await put(endpoints.tasks.byId(String(taskId)), {
    studyPlanModuleId: moduleId,
    title: task.title,
    description: task.description,
    status: 'Completed',
    estimatedDurationSeconds: task.estimatedMinutes * 60,
    scheduledDate: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });
}

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

export async function getActiveSession(): Promise<ActiveSessionResponse | null> {
  try {
    return await get<ActiveSessionResponse>(ep.active);
  } catch (error: unknown) {
    // 204 No Content → no active session
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      (error as { statusCode: number }).statusCode === 204
    ) {
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
  return get<PaginatedResponse<SessionHistoryItem>>(ep.history, { params });
}

export async function getRecentSessions(
  limit: number = 5
): Promise<RecentSessionItem[]> {
  return get<RecentSessionItem[]>(ep.recent, { params: { limit } });
}

export async function getSessionStatistics(
  period?: string
): Promise<SessionStatistics> {
  return get<SessionStatistics>(ep.statistics, {
    params: period ? { period } : undefined,
  });
}

// ─── Study Events ───────────────────────────────────────────────────────────

export async function logStudyEvent(
  sessionId: string,
  request: LogEventRequest
): Promise<LogEventResponse> {
  return post<LogEventResponse>(ep.events(sessionId), request);
}

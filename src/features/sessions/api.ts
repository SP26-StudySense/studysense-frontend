import { get, post, patch } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { PaginatedResponse, QueryParams } from '@/shared/types';
import {
    StudySession,
    StartSessionRequest,
    StartSessionResponse,
    PauseSessionResponse,
    ResumeSessionResponse,
    EndSessionRequest,
    EndSessionResponse,
    ActiveSessionResponse,
    LogEventRequest,
    LogEventResponse,
    SessionHistoryItem,
    RecentSessionItem,
    SessionStatistics,
} from './types';

// Start a new session
export const startSession = (data: StartSessionRequest) => {
    return post<StartSessionResponse>(endpoints.studySessions.start, data);
};

// Pause an active session
export const pauseSession = (id: string) => {
    return patch<PauseSessionResponse>(endpoints.studySessions.pause(id));
};

// Resume a paused session
export const resumeSession = (id: string) => {
    return patch<ResumeSessionResponse>(endpoints.studySessions.resume(id));
};

// End a session and submit summary
export const endSession = (id: string, data: EndSessionRequest) => {
    return patch<EndSessionResponse>(endpoints.studySessions.end(id), data);
};

// Get the user's currently active session, if any
export const getActiveSession = () => {
    return get<ActiveSessionResponse | null>(endpoints.studySessions.active).catch((err) => {
        // 204 No Content is translated to an error by Axios sometimes, handle it
        if (err.response?.status === 204) return null;
        throw err;
    });
};

// Log a study event (task complete, start, etc)
export const logStudyEvent = (id: string, data: LogEventRequest) => {
    return post<LogEventResponse>(endpoints.studySessions.events(id), data);
};

// Get full session details by ID
export const getSessionById = (id: string) => {
    return get<StudySession>(endpoints.studySessions.byId(id));
};

// Get paginated session history
export const getSessionHistory = (params?: QueryParams) => {
    return get<PaginatedResponse<SessionHistoryItem>>(endpoints.studySessions.history, { params });
};

// Get recent sessions for dashboard
export const getRecentSessions = (limit: number = 5) => {
    return get<RecentSessionItem[]>(endpoints.studySessions.recent, { params: { limit } });
};

// Get aggregated session statistics
export const getSessionStatistics = (period: 'week' | 'month' | 'all' = 'week') => {
    return get<SessionStatistics>(endpoints.studySessions.statistics, { params: { period } });
};

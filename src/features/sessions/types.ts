/**
 * Study Session types matching Backend API DTOs
 * @see STUDYSESSION_API_README.md
 */

import { SessionStatus, SessionEndedReason, StudyEventType } from '@/shared/types';

// ─── Shared sub-types ───────────────────────────────────────────────────────

export interface SessionNodeInfo {
  id: number;
  title: string;
  description: string | null;
}

export interface SessionPlanInfo {
  id: number;
  title: string;
}

export interface SessionTaskItem {
  id: number;
  title: string;
  description: string | null;
  order: number;
  estimatedMinutes: number;
  isCompleted: boolean;
}

// ─── Start Session ──────────────────────────────────────────────────────────

export interface StartSessionRequest {
  studyPlanId?: number;
  nodeId?: number;
  moduleId?: number;
  taskIds?: number[];
  plannedDurationSeconds?: number;
  timezone?: string;
}

export interface StartSessionResponse {
  sessionId: string;
  startAt: string;
  status: SessionStatus;
  node: SessionNodeInfo | null;
  tasks: SessionTaskItem[];
}

// ─── Pause Session ──────────────────────────────────────────────────────────

export interface PauseSessionResponse {
  sessionId: string;
  status: SessionStatus;
  pauseCount: number;
  pauseSeconds: number;
}

// ─── Resume Session ─────────────────────────────────────────────────────────

export interface ResumeSessionResponse {
  sessionId: string;
  status: SessionStatus;
}

// ─── End Session ────────────────────────────────────────────────────────────

export interface EndSessionTaskInput {
  taskId: number;
  endTime: string | null;
}

export interface EndSessionRequest {
  endedReason?: SessionEndedReason;
  selfRating?: number;
  notes?: string;
  actualDurationSeconds?: number;
  tasks?: EndSessionTaskInput[];
}

export interface EndSessionResponse {
  sessionId: string;
  totalDurationMinutes: number;
  tasksCompleted: number;
  totalTasks: number;
  xpEarned: number;
}

// ─── Active Session ─────────────────────────────────────────────────────────

export interface ActiveSessionResponse {
  sessionId: string;
  status: SessionStatus;
  startAt: string;
  elapsedSeconds: number;
  planId: number | null;
  nodeId: number | null;
  nodeTitle: string | null;
  planTitle: string | null;
  tasks: SessionTaskItem[];
}

// ─── Session Detail ─────────────────────────────────────────────────────────

export interface SessionDetailResponse {
  id: string;
  userId: string;
  studyPlanId: number | null;
  nodeId: number | null;
  moduleId: number | null;
  startAt: string;
  endAt: string | null;
  status: SessionStatus;
  endedReason: SessionEndedReason | null;
  plannedDurationSeconds: number | null;
  actualDurationSeconds: number | null;
  activeSeconds: number | null;
  idleSeconds: number | null;
  pauseCount: number;
  pauseSeconds: number;
  focusScore: number | null;
  selfRating: number | null;
  fatigueScore: number | null;
  timezone: string | null;
  createdAt: string;
  node: SessionNodeInfo | null;
  plan: SessionPlanInfo | null;
}

// ─── Session History ────────────────────────────────────────────────────────

export interface SessionHistoryParams {
  planId?: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface SessionHistoryItem {
  id: string;
  date: string;
  nodeTitle: string;
  planTitle: string;
  durationMinutes: number;
  tasksCompleted: number;
  totalTasks: number;
  xpEarned: number;
  rating: number;
  status: SessionStatus;
}

// ─── Recent Sessions ────────────────────────────────────────────────────────

export interface RecentSessionItem {
  id: string;
  durationMinutes: number;
  tasksCompleted: number;
  date: string;
  rating: number;
  nodeTitle: string;
}

// ─── Session Statistics ─────────────────────────────────────────────────────

export interface SessionStatistics {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  sessionsThisWeek: number;
  minutesThisWeek: number;
  totalXpEarned: number;
  averageRating: number;
}

// ─── Study Events ───────────────────────────────────────────────────────────

export enum SessionEventType {
  VIEW = 'View',
  CLICK = 'Click',
  START = 'Start',
  SUBMIT = 'Submit',
  COMPLETE = 'Complete',
}

export enum StudyEventCategory {
  LEARNING = 'Learning',
}

export enum ContentMode {
  TEXT = 'Text',
  VIDEO = 'Video',
}

export interface LogEventRequest {
  eventType: SessionEventType | string;
  eventCategory?: StudyEventCategory | string;
  contentMode?: ContentMode | string;
  taskId?: number;
  userId?: string;
  studyPlanModuleId?: string;
  metadata?: Record<string, unknown>;
}

export interface LogEventResponse {
  id: string;
  sessionId: string;
  eventType: SessionEventType | string;
  taskId: number | null;
  timestamp: string;
}

// Re-export enums for convenience
export { SessionStatus, SessionEndedReason, StudyEventType };

/**
 * Study Session types matching Backend DTOs
 */

import { BaseEntity, SessionStatus, SessionEndedReason, StudyEventType } from '@/shared/types';

// Study Session entity
export interface StudySession extends BaseEntity {
    userId: string;
    studyPlanId?: string;
    nodeId?: string;
    moduleId?: string;
    startAt: string;
    endAt?: string;
    status: SessionStatus;
    endedReason?: SessionEndedReason;
    plannedDurationSeconds?: number;
    actualDurationSeconds?: number;
    activeSeconds?: number;
    idleSeconds?: number;
    pauseCount: number;
    pauseSeconds: number;
    focusScore?: number;
    selfRating?: number;
    fatigueScore?: number;
    notes?: string;
    timezone?: string;
    node?: SessionNode;
    plan?: SessionPlan;
}

export interface SessionPlan {
    id: string;
    title: string;
}

// Start session request
export interface StartSessionRequest {
    studyPlanId?: string;
    nodeId?: string;
    moduleId?: string;
    taskId?: string;
    plannedDurationSeconds?: number;
    timezone?: string;
}

// Start session response
export interface StartSessionResponse {
    sessionId: string;
    startAt: string;
    status: SessionStatus;
    node?: SessionNode;
    tasks: SessionTask[];
}

// Session node (simplified node for session context)
export interface SessionNode {
    id: string;
    title: string;
    description: string;
}

// Session task
export interface SessionTask {
    id: string;
    title: string;
    description: string;
    order: number;
    estimatedMinutes: number;
    isCompleted: boolean;
}

// Pause session response
export interface PauseSessionResponse {
    sessionId: string;
    status: SessionStatus;
    pauseCount: number;
    activeSeconds: number;
    pauseSeconds: number;
}

// Resume session response
export interface ResumeSessionResponse {
    sessionId: string;
    status: SessionStatus;
}

// End session request
export interface EndSessionRequest {
    endedReason?: SessionEndedReason;
    selfRating?: number;
    notes?: string;
    actualDurationSeconds?: number;
    activeSeconds?: number;
    idleSeconds?: number;
    tasksCompleted?: string[];
    focusScore?: number;
    fatigueScore?: number;
}

// End session response
export interface EndSessionResponse {
    sessionId: string;
    totalDurationMinutes: number;
    tasksCompleted: number;
    totalTasks: number;
    focusScore: number;
    xpEarned: number;
}

// Active session response
export interface ActiveSessionResponse {
    sessionId: string;
    status: SessionStatus;
    startAt: string;
    elapsedSeconds: number;
    planId?: string;
    nodeId?: string;
    nodeTitle?: string;
    planTitle?: string;
}

// Log event request
export interface LogEventRequest {
    eventType: StudyEventType;
    taskId?: string;
    metadata?: Record<string, unknown>;
}

// Log event response
export interface LogEventResponse {
    id: string;
    sessionId: string;
    eventType: StudyEventType;
    taskId?: string;
    timestamp: string;
}

// Session history item
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

// Recent session item
export interface RecentSessionItem {
    id: string;
    durationMinutes: number;
    tasksCompleted: number;
    date: string;
    rating: number;
    nodeTitle: string;
}

// Session statistics
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

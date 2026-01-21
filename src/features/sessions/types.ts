/**
 * Study Session types matching Backend DTOs
 */

import { BaseEntity, SessionStatus, StudyEventType } from '@/shared/types';

// Study Session entity
export interface StudySession extends BaseEntity {
    userId: string;
    studyPlanId: string;
    nodeId: string;
    startTime: string;
    endTime?: string;
    status: SessionStatus;
    durationMinutes: number;
    plannedDurationMinutes: number;
    tasksCompleted: number;
    totalTasks: number;
    focusScore?: number;
    notes?: string;
}

// Start session request
export interface StartSessionRequest {
    studyPlanId: string;
    nodeId: string;
    plannedDurationMinutes: number;
}

// Start session response
export interface StartSessionResponse {
    session: StudySession;
    node: SessionNode;
    tasks: SessionTask[];
}

// Session node (simplified node for session context)
export interface SessionNode {
    id: string;
    title: string;
    description: string;
    resources: SessionResource[];
}

// Session resource
export interface SessionResource {
    id: string;
    title: string;
    type: string;
    url: string;
    isRequired: boolean;
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

// End session request
export interface EndSessionRequest {
    notes?: string;
    rating?: number;
    feedback?: string;
}

// Session summary
export interface SessionSummary {
    sessionId: string;
    totalDuration: number;
    tasksCompleted: number;
    totalTasks: number;
    focusScore: number;
    nodeProgress: number;
    planProgress: number;
    streak: number;
    achievements: SessionAchievement[];
    recommendations: string[];
}

// Session achievement
export interface SessionAchievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
    focusScore: number;
}

// Study Event (for logging)
export interface StudyEvent extends BaseEntity {
    sessionId: string;
    eventType: StudyEventType;
    taskId?: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
}

// Log event request
export interface LogEventRequest {
    sessionId: string;
    eventType: StudyEventType;
    taskId?: string;
    metadata?: Record<string, unknown>;
}

// Session history item
export interface SessionHistoryItem {
    id: string;
    date: string;
    nodeTitle: string;
    planTitle: string;
    durationMinutes: number;
    tasksCompleted: number;
    status: SessionStatus;
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
}

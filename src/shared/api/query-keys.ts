/**
 * React Query Keys Factory
 * Centralized query key management for cache invalidation and data fetching
 */

import type { QueryParams } from '@/shared/types';

// Factory function for creating query keys
function createQueryKeys<T extends string>(scope: T) {
  return {
    all: [scope] as const,
    lists: () => [...createQueryKeys(scope).all, 'list'] as const,
    list: (params?: QueryParams) =>
      [...createQueryKeys(scope).lists(), params] as const,
    details: () => [...createQueryKeys(scope).all, 'detail'] as const,
    detail: (id: string) => [...createQueryKeys(scope).details(), id] as const,
  };
}

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },

  // Users
  users: {
    ...createQueryKeys('users'),
    profile: () => ['users', 'profile'] as const,
    preferences: () => ['users', 'preferences'] as const,
    progress: () => ['users', 'progress'] as const,
  },

  // Study Plans
  studyPlans: {
    ...createQueryKeys('studyPlans'),
    current: () => ['studyPlans', 'current'] as const,
    progress: (id: string) => ['studyPlans', 'detail', id, 'progress'] as const,
    recommendations: (id: string) =>
      ['studyPlans', 'detail', id, 'recommendations'] as const,
  },

  // Roadmaps
  roadmaps: {
    ...createQueryKeys('roadmaps'),
    nodes: (roadmapId: string) =>
      ['roadmaps', 'detail', roadmapId, 'nodes'] as const,
    node: (roadmapId: string, nodeId: string) =>
      ['roadmaps', 'detail', roadmapId, 'nodes', nodeId] as const,
    nodeProgress: (roadmapId: string, nodeId: string) =>
      ['roadmaps', 'detail', roadmapId, 'nodes', nodeId, 'progress'] as const,
  },

  // Study Sessions
  studySessions: {
    ...createQueryKeys('studySessions'),
    active: (planId?: number) => {
      if (typeof planId === 'number') {
        return ['studySessions', 'active', planId] as const;
      }

      return ['studySessions', 'active'] as const;
    },
    history: (params?: QueryParams) => ['studySessions', 'history', params] as const,
    recent: (limit?: number) => ['studySessions', 'recent', limit] as const,
    statistics: (params?: { period?: string; planId?: number; studyPlanId?: number }) =>
      ['studySessions', 'statistics', params] as const,
    events: (id: string) => ['studySessions', 'detail', id, 'events'] as const,
  },

  // Survey Taking (user-facing survey flow)
  // Root: 'survey-taking' — distinct from analyst-surveys ('analyst-surveys')
  surveyTaking: {
    ...createQueryKeys('survey-taking'),
    initial: () => ['survey-taking', 'initial'] as const,
    resurvey: () => ['survey-taking', 'resurvey'] as const,
    byCode: (code: string) => ['survey-taking', 'code', code] as const,
    results: (id: string) => ['survey-taking', 'detail', id, 'results'] as const,
    questions: (id: string) => ['survey-taking', 'detail', id, 'questions'] as const,
    options: (questionId: string) => ['survey-taking', 'questions', questionId, 'options'] as const,
    // status lives here so invalidateQueries(surveyTaking.all) covers everything
    status: () => ['survey-taking', 'status'] as const,
    pendingTrigger: (triggerType: string) => ['survey-taking', 'pending-trigger', triggerType] as const,
  },

  // Recommendations
  recommendations: {
    all: ['recommendations'] as const,
    forPlan: (planId: string) =>
      ['recommendations', 'plan', planId] as const,
    forNode: (nodeId: string) =>
      ['recommendations', 'node', nodeId] as const,
  },

  // Chat
  chat: {
    all: ['chat'] as const,
    conversations: () => ['chat', 'conversations'] as const,
    conversationsByRoadmap: (roadmapId: string) =>
      ['chat', 'conversations', roadmapId] as const,
    history: (conversationId: string) => ['chat', 'history', conversationId] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    overview: (studyPlanId: string) => ['dashboard', 'overview', studyPlanId] as const,
  },

  // Learning Targets
  learningTargets: {
    all: ['learningTargets'] as const,
    byRoadmap: (roadmapId: string) => ['learningTargets', 'roadmap', roadmapId] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (page = 1, pageSize = 20) => ['notifications', 'list', page, pageSize] as const,
  },

  // Admin
  admin: {
    users: {
      ...createQueryKeys('admin-users'),
    },
    transactions: {
      ...createQueryKeys('admin-transactions'),
    },
    roadmaps: {
      ...createQueryKeys('admin-roadmaps'),
    },
    analytics: {
      all: ['admin', 'analytics'] as const,
      overview: () => ['admin', 'analytics', 'overview'] as const,
      users: () => ['admin', 'analytics', 'users'] as const,
      sessions: () => ['admin', 'analytics', 'sessions'] as const,
      effectiveness: () => ['admin', 'analytics', 'effectiveness'] as const,
    },
  },
} as const;

// Type helper for query keys
export type QueryKeyType = (typeof queryKeys)[keyof typeof queryKeys];

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

  // Sessions
  sessions: {
    ...createQueryKeys('sessions'),
    current: () => ['sessions', 'current'] as const,
    history: (params?: QueryParams) => ['sessions', 'history', params] as const,
    summary: (id: string) => ['sessions', 'detail', id, 'summary'] as const,
    events: (id: string) => ['sessions', 'detail', id, 'events'] as const,
  },

  // Surveys
  surveys: {
    ...createQueryKeys('surveys'),
    initial: () => ['surveys', 'initial'] as const,
    resurvey: () => ['surveys', 'resurvey'] as const,
    results: (id: string) => ['surveys', 'detail', id, 'results'] as const,
    questions: (id: string) => ['surveys', 'detail', id, 'questions'] as const,
    options: (questionId: string) => ['surveys', 'questions', questionId, 'options'] as const,
  },

  // Survey status
  survey: {
    status: () => ['survey', 'status'] as const,
  },

  // Recommendations
  recommendations: {
    all: ['recommendations'] as const,
    forPlan: (planId: string) =>
      ['recommendations', 'plan', planId] as const,
    forNode: (nodeId: string) =>
      ['recommendations', 'node', nodeId] as const,
  },

  // Admin
  admin: {
    users: {
      ...createQueryKeys('admin-users'),
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

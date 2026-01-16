/**
 * API Endpoints configuration
 * Centralized API endpoint management matching Backend routes
 */

export const endpoints = {
  // Authentication & Authorization
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    me: '/auth/me',
  },

  // User & Profile Management
  users: {
    base: '/users',
    byId: (id: string) => `/users/${id}`,
    profile: '/users/profile',
    preferences: '/users/preferences',
    progress: '/users/progress',
    avatar: '/users/avatar',
  },

  // Study Plans
  studyPlans: {
    base: '/study-plans',
    byId: (id: string) => `/study-plans/${id}`,
    create: '/study-plans',
    current: '/study-plans/current',
    archive: (id: string) => `/study-plans/${id}/archive`,
    adjust: (id: string) => `/study-plans/${id}/adjust`,
    progress: (id: string) => `/study-plans/${id}/progress`,
  },

  // Roadmaps
  roadmaps: {
    base: '/roadmaps',
    byId: (id: string) => `/roadmaps/${id}`,
    nodes: (roadmapId: string) => `/roadmaps/${roadmapId}/nodes`,
    nodeById: (roadmapId: string, nodeId: string) => `/roadmaps/${roadmapId}/nodes/${nodeId}`,
    nodeProgress: (roadmapId: string, nodeId: string) => `/roadmaps/${roadmapId}/nodes/${nodeId}/progress`,
  },

  // Study Sessions
  sessions: {
    base: '/sessions',
    byId: (id: string) => `/sessions/${id}`,
    start: '/sessions/start',
    current: '/sessions/current',
    pause: (id: string) => `/sessions/${id}/pause`,
    resume: (id: string) => `/sessions/${id}/resume`,
    end: (id: string) => `/sessions/${id}/end`,
    summary: (id: string) => `/sessions/${id}/summary`,
    history: '/sessions/history',
  },

  // Study Events (Logging)
  events: {
    base: '/events',
    log: '/events/log',
    bySession: (sessionId: string) => `/events/session/${sessionId}`,
  },

  // Survey & Assessment
  surveys: {
    base: '/surveys',
    initial: '/surveys/initial',
    resurvey: '/surveys/resurvey',
    submit: (id: string) => `/surveys/${id}/submit`,
    results: (id: string) => `/surveys/${id}/results`,
  },

  // Recommendations (AI Interface)
  recommendations: {
    base: '/recommendations',
    forPlan: (planId: string) => `/recommendations/plan/${planId}`,
    forNode: (nodeId: string) => `/recommendations/node/${nodeId}`,
    apply: (id: string) => `/recommendations/${id}/apply`,
  },

  // Admin endpoints
  admin: {
    users: {
      base: '/admin/users',
      byId: (id: string) => `/admin/users/${id}`,
      activate: (id: string) => `/admin/users/${id}/activate`,
      deactivate: (id: string) => `/admin/users/${id}/deactivate`,
    },
    roadmaps: {
      base: '/admin/roadmaps',
      byId: (id: string) => `/admin/roadmaps/${id}`,
      publish: (id: string) => `/admin/roadmaps/${id}/publish`,
    },
    analytics: {
      overview: '/admin/analytics/overview',
      users: '/admin/analytics/users',
      sessions: '/admin/analytics/sessions',
      effectiveness: '/admin/analytics/effectiveness',
    },
  },
} as const;

// Type helper for endpoint functions
export type EndpointFunction = (...args: string[]) => string;

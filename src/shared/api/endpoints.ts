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
    confirmEmail: '/auth/confirm-email',
    googleLogin: '/auth/google-login',
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
    byRoadmap: (roadmapId: string) => `/study-plans/by-roadmap/${roadmapId}`,
    user: '/study-plans/user',
    current: '/study-plans/current',
    archive: (id: string) => `/study-plans/${id}/archive`,
    adjust: (id: string) => `/study-plans/${id}/adjust`,
    progress: (id: string) => `/study-plans/${id}/progress`,
  },

  // Tasks
  tasks: {
    base: '/tasks',
    byId: (id: string) => `/tasks/${id}`,
    batch: '/tasks/batch',
    byPlan: (studyPlanId: string) => `/tasks/by-plan/${studyPlanId}`,
    byModule: (moduleId: string) => `/tasks/by-module/${moduleId}`,
  },

  // Roadmaps
  roadmaps: {
    base: '/roadmaps',
    byId: (id: string) => `/roadmaps/${id}`,
    nodes: (roadmapId: string) => `/roadmaps/${roadmapId}/nodes`,
    nodeById: (roadmapId: string, nodeId: string) => `/roadmaps/${roadmapId}/nodes/${nodeId}`,
    nodeContents: (roadmapId: string, nodeId: string) => `/roadmaps/${roadmapId}/nodes/${nodeId}/contents`,
    nodeProgress: (roadmapId: string, nodeId: string) => `/roadmaps/${roadmapId}/nodes/${nodeId}/progress`,
  },

  // Study Sessions
  studySessions: {
    base: '/study-sessions',
    byId: (id: string) => `/study-sessions/${id}`,
    start: '/study-sessions/start',
    active: '/study-sessions/active',
    pause: (id: string) => `/study-sessions/${id}/pause`,
    resume: (id: string) => `/study-sessions/${id}/resume`,
    end: (id: string) => `/study-sessions/${id}/end`,
    history: '/study-sessions/history',
    recent: '/study-sessions/recent',
    statistics: '/study-sessions/statistics',
    events: (id: string) => `/study-sessions/${id}/events`,
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

  // AI Chat
  chat: {
    send: '/ai/chat/send',
    createConversation: '/ai/chat/conversations',
    conversations: (roadmapId?: number) =>
      roadmapId != null
        ? `/ai/chat/conversations/${roadmapId}`
        : '/ai/chat/conversations',
    history: (conversationId: string) => `/ai/chat/${conversationId}/history`,
  },
  // AI Task Items
  ai: {
    createTaskItems: '/ai/create-task-items',
  },
  // Admin endpoints
  admin: {
    users: {
      base: '/admin/users',
      roles: '/admin/users/roles',
      byId: (id: string) => `/admin/users/${id}`,
      activate: (id: string) => `/admin/users/${id}/activate`,
      deactivate: (id: string) => `/admin/users/${id}/deactivate`,
      assignSubject: (id: string) => `/admin/users/${id}/subject`,
      unassignSubject: (id: string) => `/admin/users/${id}/subject`,
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

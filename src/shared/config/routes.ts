/**
 * Application routes configuration
 * Centralized route management for type-safe navigation
 */

export const routes = {
  // Public routes
  public: {
    home: '/',
    about: '/about',
    pricing: '/pricing',
    contact: '/contact',
    upgradePlan: '/upgrade-plan',
    membership: '/membership',
  },

  // Payment routes (can be grouped in public or separated)
  payment: {
    success: '/payment/success',
    failed: '/payment/fail',
  },

  // Auth routes
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    verifyEmail: '/verify-email',
  },

  // Dashboard routes
  dashboard: {
    home: '/dashboard',
    
    // Study Plans
    studyPlans: {
      list: '/study-plans',
      detail: (id: string) => `/study-plans/${id}`,
      create: '/study-plans/create',
      edit: (id: string) => `/study-plans/${id}/edit`,
    },

    // Roadmaps
    roadmaps: {
      list: '/roadmaps',
      detail: (id: string) => `/roadmaps/${id}`,
      node: (roadmapId: string, nodeId: string) => `/roadmaps/${roadmapId}/nodes/${nodeId}`,
    },

    // My Roadmap (dashboard view)
    myRoadmap: (id: string) => `/my-roadmap/${id}`,

    // Study Sessions
    sessions: {
      list: '/sessions',
      listByPlan: (studyPlanId: string) => `/sessions/${studyPlanId}`,
      detail: (id: string) => `/sessions/${id}`,
      active: '/sessions/active',
      history: '/sessions/history',
      historyByPlan: (studyPlanId: string) => `/sessions/${studyPlanId}/history`,
    },

    // Chat
    chat: {
      list: '/chat',
      roadmap: (roadmapId: string) => `/chat/${roadmapId}`,
    },

    // Surveys
    surveys: {
      list: '/surveys',
      take: (code: string) => `/surveys/${code}`, // Changed to use code instead of idnp
      
    },

    // Profile & Settings
    profile: '/profile',
    settings: '/settings',
    preferences: '/settings/preferences',
  },

  // Admin routes
  admin: {
    home: '/admin',
    users: {
      list: '/admin/users',
      detail: (id: string) => `/admin/users/${id}`,
    },
    roadmaps: {
      list: '/admin/roadmaps',
      detail: (id: string) => `/admin/roadmaps/${id}`,
      create: '/admin/roadmaps/create',
    },
    analytics: '/admin/analytics',
    settings: '/admin/settings',
  },

  // Analyst routes
  analyst: {
    home: '/analyst-dashboard',
    survey: '/analyst-survey',
    triggerMapping: '/analyst-triggermapping',
  },

  // Content Manager routes
  contentManager: {
    dashboard: '/content-dashboard',
    roadmaps: {
      list: '/content-roadmaps',
      detail: (id: string) => `/content-roadmaps/${id}`,
      create: '/content-roadmaps/create',
      quizDetail: (quizId: string | number) => `/content-roadmaps/quizzes/${quizId}`,
    },
    profile: '/content-profile',
  },

  // API routes
  api: {
    auth: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
    },
  },
} as const;

// Route groups for middleware
export const publicRoutes = [
  routes.public.home,
  routes.public.about,
  routes.public.pricing,
  routes.public.contact,
  routes.public.upgradePlan,
  routes.payment.success,
  routes.payment.failed,
];

export const authRoutes = [
  routes.auth.login,
  routes.auth.register,
  routes.auth.forgotPassword,
  routes.auth.resetPassword,
  routes.auth.verifyEmail,
];

export const protectedRoutes = ['/dashboard', '/study-plans', '/sessions', '/profile', '/settings', '/membership'];

export const adminRoutes = ['/admin-dashboard', '/admin-users', '/admin-categories', '/admin-transactions'];

export const analystRoutes = ['/analyst-survey', '/analyst-triggermapping'];

export const contentManagerRoutes = ['/content-dashboard', '/content-roadmaps', '/content-profile'];

export const studyPlanRoutes = ['/study-plans'];

// Helper to check route type
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname.startsWith(route));
}

export function isAnalystRoute(pathname: string): boolean {
  return analystRoutes.some((route) => pathname.startsWith(route));
}

export function isContentManagerRoute(pathname: string): boolean {
  return contentManagerRoutes.some((route) => pathname.startsWith(route));
}

export function isStudyPlanRoute(pathname: string): boolean {
  return studyPlanRoutes.some((route) => pathname.startsWith(route));
}

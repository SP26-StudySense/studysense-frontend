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

    // Study Sessions
    sessions: {
      list: '/sessions',
      detail: (id: string) => `/sessions/${id}`,
      active: '/sessions/active',
      history: '/sessions/history',
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
];

export const authRoutes = [
  routes.auth.login,
  routes.auth.register,
  routes.auth.forgotPassword,
  routes.auth.resetPassword,
  routes.auth.verifyEmail,
];

export const protectedRoutes = ['/dashboard', '/study-plans', '/roadmaps', '/sessions', '/profile', '/settings'];

export const adminRoutes = ['/admin'];

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

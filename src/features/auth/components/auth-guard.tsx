'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { routes } from '@/shared/config/routes';
import { UserRole } from '@/shared/types';
import { useCurrentUser } from '../api/queries';
import type { User } from '../types';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface RoleGuardProps extends AuthGuardProps {
  allowedRoles: Array<UserRole | string>;
  redirectTo?: string;
}

function hasAllowedRole(roles: string[] | undefined, allowedRoles: Array<UserRole | string>): boolean {
  if (!roles?.length) {
    return false;
  }

  const normalizedAllowedRoles = allowedRoles.map((role) =>
    role.toString().replace(/\s+/g, '').toLowerCase()
  );

  return roles.some((role) => normalizedAllowedRoles.includes(role.replace(/\s+/g, '').toLowerCase()));
}

/**
 * Default loading component
 */
function DefaultLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
      <LoadingSpinner size="lg" showText text="Loading..." />
    </div>
  );
}

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to login if not authenticated
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);
  const { data: user, isLoading, error } = useCurrentUser();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && !isLoading && (!user || error)) {
      router.push(routes.auth.login);
    }
  }, [error, hasHydrated, isLoading, router, user]);

  // Keep server and first client render consistent to avoid hydration mismatch.
  if (!hasHydrated || isLoading) {
    return fallback || <DefaultLoading />;
  }

  if (!user) {
    return fallback || <DefaultLoading />;
  }

  return <>{children}</>;
}

/**
 * Guest Guard - Protects routes that should only be accessible to unauthenticated users
 * Redirects to dashboard if already authenticated
 */
export function GuestGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);
  const { data: user, isLoading } = useCurrentUser({ enabled: true });

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // TEMPORARY: Disable redirect to allow login
  // useEffect(() => {
  //   if (!isLoading && user) {
  //     console.log('[GuestGuard] User exists, redirecting to dashboard');
  //     router.push(routes.dashboard.home);
  //   }
  // }, [user, isLoading, router]);

  // Keep server and first client render identical.
  if (!hasHydrated || isLoading) {
    return fallback || <DefaultLoading />;
  }

  // TEMPORARY: Always show login page
  return <>{children}</>;

  // if (user) {
  //   return fallback || <DefaultLoading />;
  // }

  // return <>{children}</>;
}

/**
 * Role Guard - Protects routes based on user role
 * Redirects to dashboard if user doesn't have required role
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  redirectTo,
}: RoleGuardProps) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const destination = redirectTo ?? routes.dashboard.home;

  useEffect(() => {
    const userHasAllowedRole = hasAllowedRole(user?.roles, allowedRoles);
    if (!isLoading && user && !userHasAllowedRole) {
      router.push(destination);
    }
  }, [user, isLoading, allowedRoles, router, destination]);

  const userHasAllowedRole = hasAllowedRole(user?.roles, allowedRoles);

  if (!user || !userHasAllowedRole) {
    return fallback || <DefaultLoading />;
  }

  return <>{children}</>;
}

/**
 * Admin Guard - Convenience wrapper for admin-only routes
 */
export function AdminGuard({ children, fallback }: AuthGuardProps) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Analyst Guard - Protects analyst-only routes
 * Redirects to landing page if user doesn't have Analyst role
 */
export function AnalystGuard({ children, fallback }: AuthGuardProps) {
  return (
    <RoleGuard
      allowedRoles={[UserRole.ANALYST]}
      redirectTo={routes.public.home}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

/**
 * Content Manager Guard - Protects content-manager-only routes
 */
export function ContentManagerGuard({ children, fallback }: AuthGuardProps) {
  return (
    <RoleGuard
      allowedRoles={['ContentManager']}
      redirectTo={routes.public.home}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

/**
 * Study Plan Guard - Limits study-plan routes to regular users
 */
export function StudyPlanGuard({ children, fallback }: AuthGuardProps) {
  return (
    <RoleGuard
      allowedRoles={[UserRole.USER]}
      redirectTo={routes.public.home}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

/**
 * HOC to wrap components with auth guard
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WrappedComponent(props: P) {
    return (
      <AuthGuard>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * HOC to wrap components with role guard
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
): React.FC<P> {
  return function WrappedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

/**
 * Context value type for auth provider
 */
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

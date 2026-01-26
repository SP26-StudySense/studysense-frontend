'use client';

import { useEffect } from 'react';
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
  allowedRoles: UserRole[];
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
  const { data: user, isLoading, error } = useCurrentUser();

  console.log('[AuthGuard] State:', { user: !!user, isLoading, error: error?.message });

  useEffect(() => {
    if (!isLoading && (!user || error)) {
      console.log('[AuthGuard] Redirecting to login - no user');
      router.push(routes.auth.login);
    }
  }, [user, isLoading, error, router]);

  if (isLoading) {
    console.log('[AuthGuard] Loading...');
    return fallback || <DefaultLoading />;
  }

  if (!user) {
    console.log('[AuthGuard] No user, showing loading');
    return fallback || <DefaultLoading />;
  }

  console.log('[AuthGuard] User authenticated, rendering children');
  return <>{children}</>;
}

/**
 * Guest Guard - Protects routes that should only be accessible to unauthenticated users
 * Redirects to dashboard if already authenticated
 */
export function GuestGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser({ enabled: true });

  console.log('[GuestGuard] State:', { user: !!user, isLoading });

  // TEMPORARY: Disable redirect to allow login
  // useEffect(() => {
  //   if (!isLoading && user) {
  //     console.log('[GuestGuard] User exists, redirecting to dashboard');
  //     router.push(routes.dashboard.home);
  //   }
  // }, [user, isLoading, router]);

  if (isLoading) {
    console.log('[GuestGuard] Loading...');
    return fallback || <DefaultLoading />;
  }

  // TEMPORARY: Always show login page
  console.log('[GuestGuard] Rendering children (temp bypass)');
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
}: RoleGuardProps) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    // Check if user has any of the allowed roles
    const hasAllowedRole = user?.roles?.some(role =>
      allowedRoles.map(r => r.toString()).includes(role)
    );
    if (!isLoading && user && !hasAllowedRole) {
      router.push(routes.dashboard.home);
    }
  }, [user, isLoading, allowedRoles, router]);

  // Check if user has any of the allowed roles
  const hasAllowedRole = user?.roles?.some(role =>
    allowedRoles.map(r => r.toString()).includes(role)
  );

  if (!user || !hasAllowedRole) {
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

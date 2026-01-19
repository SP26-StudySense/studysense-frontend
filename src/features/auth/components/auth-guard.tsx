'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#c1ff72]" />
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
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

  useEffect(() => {
    if (!isLoading && (!user || error)) {
      router.push(routes.auth.login);
    }
  }, [user, isLoading, error, router]);

  if (isLoading) {
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
  const { data: user, isLoading } = useCurrentUser({ enabled: true });

  useEffect(() => {
    if (!isLoading && user) {
      router.push(routes.dashboard.home);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return fallback || <DefaultLoading />;
  }

  if (user) {
    return fallback || <DefaultLoading />;
  }

  return <>{children}</>;
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

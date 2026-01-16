/**
 * Auth API queries using React Query
 */

import { useQuery } from '@tanstack/react-query';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import type { User } from '../types';

/**
 * Fetch current authenticated user
 */
export function useCurrentUser(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => get<User>(endpoints.auth.me),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on auth errors
    ...options,
  });
}

/**
 * Check if user is authenticated
 */
export function useAuthStatus() {
  const { data: user, isLoading, error } = useCurrentUser();

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}

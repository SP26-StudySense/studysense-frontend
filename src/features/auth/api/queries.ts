/**
 * Auth API queries using React Query
 */

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';
import { getUserFromStorage } from './mutations';

/**
 * Get current authenticated user from cache or localStorage
 */
export function useCurrentUser(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => {
      // Check localStorage (for page reload persistence)
      const storedUser = getUserFromStorage();
      if (storedUser) {
        return storedUser;
      }
      
      // No stored user means not logged in
      throw new Error('Not authenticated');
    },
    staleTime: Infinity, // Never refetch - data comes from login
    gcTime: Infinity, // Keep in cache forever
    retry: false, // Don't retry on auth errors
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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

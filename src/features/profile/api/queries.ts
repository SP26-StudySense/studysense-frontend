/**
 * Profile API queries using React Query
 */

import { useQuery } from '@tanstack/react-query';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import type { UserProfile } from '../types';

/**
 * Get current user's profile
 */
export function useProfile() {
    return useQuery({
        queryKey: queryKeys.users.profile(),
        queryFn: () => get<UserProfile>(endpoints.users.profile),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
}

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import type { OverviewStudyPlanDto } from './types';

export function useDashboardOverview(
  studyPlanId?: string,
  options?: Omit<
    UseQueryOptions<OverviewStudyPlanDto, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<OverviewStudyPlanDto, Error>({
    queryKey: queryKeys.dashboard.overview(studyPlanId ?? ''),
    queryFn: () => get<OverviewStudyPlanDto>(endpoints.dashboard.overview(studyPlanId ?? '')),
    enabled: Boolean(studyPlanId),
    ...options,
  });
}

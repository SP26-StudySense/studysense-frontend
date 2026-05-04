import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { ApiException } from '@/shared/api/errors';
import { queryKeys } from '@/shared/api/query-keys';
import type { LearningTargetDto, OverviewStudyPlanDto } from './types';

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

export function useLearningTargetByRoadmap(
  roadmapId?: string,
  options?: Omit<UseQueryOptions<LearningTargetDto | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<LearningTargetDto | null, Error>({
    queryKey: queryKeys.learningTargets.byRoadmap(roadmapId ?? ''),
    queryFn: async () => {
      try {
        return await get<LearningTargetDto>(endpoints.learningTargets.byRoadmap(roadmapId ?? ''));
      } catch (error) {
        if (error instanceof ApiException && error.isNotFound()) {
          return null;
        }

        throw error;
      }
    },
    enabled: Boolean(roadmapId),
    ...options,
  });
}

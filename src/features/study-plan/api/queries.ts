'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { StudyPlanResponse, StudyPlanItem } from './response-types';
import { StudyPlanDto, TaskItemDto } from './types';

/**
 * Hook to fetch user's study plans from /study-plans/user
 * Note: API client auto-adds /api/ prefix and auto-unwraps { data: ... } wrapper
 */
export function useStudyPlans() {
  return useQuery({
    queryKey: ['studyPlans', 'user'] as const,
    queryFn: async () => {
      // get() returns the unwrapped array directly (not { success, data })
      const data = await get<StudyPlanItem[]>('/study-plans/user');
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single study plan by ID
 * GET /study-plans/{id}
 */
export function useStudyPlan(studyPlanId: string | undefined) {
  return useQuery({
    queryKey: ['studyPlans', 'detail', studyPlanId] as const,
    queryFn: async () => {
      if (!studyPlanId) throw new Error('Study plan ID is required');
      const data = await get<StudyPlanDto>(endpoints.studyPlans.byId(studyPlanId));
      return data;
    },
    enabled: !!studyPlanId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch tasks by study plan ID
 * GET /tasks/by-plan/{studyPlanId}
 */
export function useTasksByPlan(studyPlanId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', 'byPlan', studyPlanId] as const,
    queryFn: async () => {
      if (!studyPlanId) throw new Error('Study plan ID is required');
      const data = await get<TaskItemDto[]>(endpoints.tasks.byPlan(studyPlanId));
      return data || [];
    },
    enabled: !!studyPlanId,
    staleTime: 5 * 60 * 1000,
  });
}

export * from './response-types';

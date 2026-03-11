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
export function useStudyPlan(
  studyPlanId: string | undefined,
  options?: { enabled?: boolean; refetchInterval?: number | false }
) {
  return useQuery({
    queryKey: ['studyPlans', 'detail', studyPlanId] as const,
    queryFn: async () => {
      if (!studyPlanId) throw new Error('Study plan ID is required');
      const data = await get<StudyPlanDto>(endpoints.studyPlans.byId(studyPlanId));
      return data;
    },
    enabled: options?.enabled !== false && !!studyPlanId,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.refetchInterval ? 0 : 5 * 60 * 1000, // No cache when polling
  });
}

/**
 * Hook to fetch study plan by roadmap ID
 * GET /study-plans/by-roadmap/{roadmapId}
 * Used for polling after survey submission
 */
export function useStudyPlanByRoadmap(
  roadmapId: number | undefined,
  options?: { enabled?: boolean; refetchInterval?: number | false }
) {
  return useQuery({
    queryKey: ['studyPlans', 'byRoadmap', roadmapId] as const,
    queryFn: async () => {
      if (!roadmapId) throw new Error('Roadmap ID is required');
      const data = await get<StudyPlanDto>(endpoints.studyPlans.byRoadmap(String(roadmapId)));
      return data;
    },
    enabled: options?.enabled !== false && !!roadmapId,
    refetchInterval: options?.refetchInterval,
    retry: false, // Don't retry on 404 - it's expected while plan is being created
    staleTime: 0, // Always fetch fresh data when polling
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
      console.log('🔍 [useTasksByPlan] Fetching tasks for study plan:', studyPlanId);
      if (!studyPlanId) throw new Error('Study plan ID is required');
      const data = await get<TaskItemDto[]>(endpoints.tasks.byPlan(studyPlanId));
      console.log('✅ [useTasksByPlan] Received tasks:', data?.length || 0);
      return data || [];
    },
    enabled: !!studyPlanId,
    staleTime: 30 * 1000, // 30 seconds - reduced from 5 minutes to ensure fresh data
    retry: 3,
  });
}

export * from './response-types';

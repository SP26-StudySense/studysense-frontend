'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post, del, put } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import {
  StudyPlanDto,
  CreateStudyPlanRequest,
  TaskItemDto,
  TaskItemInput,
  CreateTasksBatchRequest,
} from './types';

/**
 * Hook to create a new study plan from a roadmap
 * POST /study-plans
 */
export function useCreateStudyPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateStudyPlanRequest) => {
      const data = await post<StudyPlanDto>(endpoints.studyPlans.create, request);
      return data;
    },
    onSuccess: () => {
      // Invalidate study plans cache
      queryClient.invalidateQueries({ queryKey: ['studyPlans'] });
    },
  });
}

/**
 * Hook to create multiple tasks at once
 * POST /tasks/batch
 */
export function useCreateTasksBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateTasksBatchRequest) => {
      const data = await post<TaskItemDto[]>(endpoints.tasks.batch, request);
      return data;
    },
    onSuccess: () => {
      // Invalidate tasks cache
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Hook to delete a study plan (for rollback)
 * DELETE /study-plans/{id}
 */
export function useDeleteStudyPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studyPlanId: number) => {
      await del<void>(endpoints.studyPlans.byId(String(studyPlanId)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyPlans'] });
    },
  });
}

/**
 * Hook to create a single task
 * POST /tasks
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskItemInput) => {
      const data = await post<TaskItemDto>(endpoints.tasks.base, task);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Hook to update a task
 * PUT /tasks/{taskId}
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, task }: { taskId: number; task: TaskItemInput }) => {
      const data = await put<TaskItemDto>(endpoints.tasks.byId(String(taskId)), task);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Hook to delete a task
 * DELETE /tasks/{taskId}
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      await del<void>(endpoints.tasks.byId(String(taskId)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

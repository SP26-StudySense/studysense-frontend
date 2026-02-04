/**
 * React Query hooks for Survey API
 * Provides caching, automatic refetching, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib';
import * as surveyApi from './api';
import type { SurveyDto, CreateSurveyRequest, UpdateSurveyRequest } from './api';

// Query keys
const surveyKeys = {
  all: ['analyst-surveys'] as const,
  lists: () => [...surveyKeys.all, 'list'] as const,
  list: (pageIndex: number, pageSize: number) => 
    [...surveyKeys.lists(), { pageIndex, pageSize }] as const,
  detail: (id: number) => [...surveyKeys.all, 'detail', id] as const,
  questions: (surveyId: number) => [...surveyKeys.all, 'questions', surveyId] as const,
  options: (questionId: number) => [...surveyKeys.all, 'options', questionId] as const,
};

/**
 * Fetch surveys with pagination
 * - Caches data for 5 minutes
 * - Automatically refetches in background
 * - Keeps previous data while loading new page
 */
export function useSurveys(pageIndex: number, pageSize: number) {
  return useQuery({
    queryKey: surveyKeys.list(pageIndex, pageSize),
    queryFn: () => surveyApi.getAllSurveys({ pageIndex, pageSize }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch when user returns to tab
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Fetch single survey by ID
 */
export function useSurvey(id: number) {
  return useQuery({
    queryKey: surveyKeys.detail(id),
    queryFn: () => surveyApi.getSurveyById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id, // Only fetch if id exists
  });
}

/**
 * Create survey mutation
 * - Invalidates list cache after success
 * - Shows toast notifications
 */
export function useCreateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSurveyRequest) => surveyApi.createSurvey(data),
    onSuccess: () => {
      // Invalidate and refetch surveys list
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
      toast.success('Survey created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create survey:', error);
      toast.error('Failed to create survey');
    },
  });
}

/**
 * Update survey mutation
 * - Optimistically updates the cache
 * - Rolls back on error
 */
export function useUpdateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSurveyRequest }) =>
      surveyApi.updateSurvey(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: surveyKeys.detail(id) });

      // Snapshot previous value
      const previousSurvey = queryClient.getQueryData(surveyKeys.detail(id));

      // Optimistically update the cache
      queryClient.setQueryData(surveyKeys.detail(id), (old: SurveyDto | undefined) => 
        old ? { ...old, ...data } : old
      );

      return { previousSurvey };
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousSurvey) {
        queryClient.setQueryData(surveyKeys.detail(id), context.previousSurvey);
      }
      console.error('Failed to update survey:', error);
      toast.error('Failed to update survey');
    },
    onSuccess: () => {
      // Invalidate lists to show updated data
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
      toast.success('Survey updated successfully');
    },
  });
}

/**
 * Delete survey mutation
 * - Optimistically removes from list
 * - Rolls back on error
 */
export function useDeleteSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => surveyApi.deleteSurvey(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: surveyKeys.lists() });

      // Snapshot previous value
      const previousData = queryClient.getQueriesData({ queryKey: surveyKeys.lists() });

      // Optimistically remove from all list caches
      queryClient.setQueriesData(
        { queryKey: surveyKeys.lists() },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.filter((survey: SurveyDto) => survey.id !== id),
            totalCount: old.totalCount - 1,
          };
        }
      );

      return { previousData };
    },
    onError: (error: Error, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to delete survey:', error);
      toast.error('Failed to delete survey');
    },
    onSuccess: () => {
      toast.success('Survey deleted successfully');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
    },
  });
}

/**
 * Fetch questions for a survey
 */
export function useSurveyQuestions(surveyId: number) {
  return useQuery({
    queryKey: surveyKeys.questions(surveyId),
    queryFn: () => surveyApi.getQuestionsBySurvey(surveyId),
    staleTime: 5 * 60 * 1000,
    enabled: !!surveyId,
  });
}

/**
 * Fetch options for a question
 */
export function useQuestionOptions(questionId: number) {
  return useQuery({
    queryKey: surveyKeys.options(questionId),
    queryFn: () => surveyApi.getOptionsByQuestion(questionId),
    staleTime: 5 * 60 * 1000,
    enabled: !!questionId,
  });
}

/**
 * Create question mutation
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: surveyApi.CreateQuestionRequest) => surveyApi.createQuestion(data),
    onSuccess: (_, variables) => {
      // Invalidate questions list for this survey
      queryClient.invalidateQueries({ queryKey: surveyKeys.questions(variables.surveyId) });
      toast.success('Question created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create question:', error);
      toast.error('Failed to create question');
    },
  });
}

/**
 * Update question mutation
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: surveyApi.UpdateQuestionRequest) => surveyApi.updateQuestion(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.questions(variables.surveyId) });
      toast.success('Question updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update question:', error);
      toast.error('Failed to update question');
    },
  });
}

/**
 * Delete question mutation
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; surveyId: number }) => surveyApi.deleteQuestion(data.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.questions(variables.surveyId) });
      toast.success('Question deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete question:', error);
      toast.error('Failed to delete question');
    },
  });
}

// ============ Question Option Mutations ============

/**
 * Create question option mutation
 */
export function useCreateOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: surveyApi.CreateOptionRequest) => surveyApi.createOption(data),
    onSuccess: (_, variables) => {
      // Invalidate options list for this question
      queryClient.invalidateQueries({ queryKey: surveyKeys.options(variables.questionId) });
      toast.success('Option created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create option:', error);
      toast.error('Failed to create option');
    },
  });
}

/**
 * Update question option mutation
 */
export function useUpdateOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: surveyApi.UpdateOptionRequest) => surveyApi.updateOption(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.options(variables.questionId) });
      toast.success('Option updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update option:', error);
      toast.error('Failed to update option');
    },
  });
}

/**
 * Delete question option mutation
 */
export function useDeleteOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; questionId: number }) => surveyApi.deleteOption(data.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.options(variables.questionId) });
      toast.success('Option deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete option:', error);
      toast.error('Failed to delete option');
    },
  });
}


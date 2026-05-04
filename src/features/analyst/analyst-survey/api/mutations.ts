/**
 * Analyst Survey Mutation Hooks
 * React Query useMutation hooks for data mutations (POST/PUT/PATCH/DELETE operations)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib';
import { surveyQueryKeys } from './api';
import * as api from './api';
import type {
  CreateSurveyRequest,
  UpdateSurveyRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  CreateOptionRequest,
  UpdateOptionRequest,
  CreateFieldSemanticRequest,
  UpdateFieldSemanticRequest,
  SurveyDto,
} from './types';

// ==================== Survey Mutations ====================

/**
 * Create survey mutation
 * - Invalidates list cache after success
 * - Shows toast notifications
 */
export function useCreateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSurveyRequest) => api.createSurvey(data),
    onSuccess: () => {
      // Invalidate and refetch surveys list
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.lists() });
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
      api.updateSurvey(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: surveyQueryKeys.detail(id) });

      // Snapshot previous value
      const previousSurvey = queryClient.getQueryData(surveyQueryKeys.detail(id));

      // Optimistically update the cache
      queryClient.setQueryData(surveyQueryKeys.detail(id), (old: SurveyDto | undefined) => 
        old ? { ...old, ...data } : old
      );

      return { previousSurvey };
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousSurvey) {
        queryClient.setQueryData(surveyQueryKeys.detail(id), context.previousSurvey);
      }
      console.error('Failed to update survey:', error);
      toast.error('Failed to update survey');
    },
    onSuccess: () => {
      // Invalidate lists to show updated data
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.lists() });
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
    mutationFn: (id: number) => api.deleteSurvey(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: surveyQueryKeys.lists() });

      // Snapshot previous value
      const previousData = queryClient.getQueriesData({ queryKey: surveyQueryKeys.lists() });

      // Optimistically remove from all list caches
      queryClient.setQueriesData(
        { queryKey: surveyQueryKeys.lists() },
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
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.lists() });
    },
  });
}

// ==================== Question Mutations ====================

/**
 * Create question mutation
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuestionRequest) => api.createQuestion(data),
    onSuccess: (_, variables) => {
      // Invalidate questions list for this survey
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.questions(variables.surveyId) });
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
    mutationFn: (data: UpdateQuestionRequest) => api.updateQuestion(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.questions(variables.surveyId) });
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
    mutationFn: (data: { id: number; surveyId: number }) => api.deleteQuestion(data.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.questions(variables.surveyId) });
      toast.success('Question deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete question:', error);
      toast.error('Failed to delete question');
    },
  });
}

// ==================== Option Mutations ====================

/**
 * Create question option mutation
 */
export function useCreateOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOptionRequest) => api.createOption(data),
    onSuccess: (_, variables) => {
      // Invalidate options list for this question
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.options(variables.questionId) });
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
    mutationFn: (data: UpdateOptionRequest) => api.updateOption(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.options(variables.questionId) });
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
    mutationFn: (data: { id: number; questionId: number }) => api.deleteOption(data.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.options(variables.questionId) });
      toast.success('Option deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete option:', error);
      toast.error('Failed to delete option');
    },
  });
}

// ==================== Field Semantic Mutations ====================

/**
 * Create field semantic mutation
 */
export function useCreateFieldSemantic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFieldSemanticRequest) => api.createFieldSemantic(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.fieldSemantics(variables.surveyQuestionId) });
      toast.success('Field semantic created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create field semantic:', error);
      toast.error('Failed to create field semantic');
    },
  });
}

/**
 * Update field semantic mutation
 */
export function useUpdateFieldSemantic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFieldSemanticRequest) => api.updateFieldSemantic(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.fieldSemantics(variables.surveyQuestionId) });
      toast.success('Field semantic updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update field semantic:', error);
      toast.error('Failed to update field semantic');
    },
  });
}

/**
 * Delete field semantic mutation
 */
export function useDeleteFieldSemantic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; questionId: number }) => api.deleteFieldSemantic(data.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.fieldSemantics(variables.questionId) });
      toast.success('Field semantic deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete field semantic:', error);
      toast.error('Failed to delete field semantic');
    },
  });
}

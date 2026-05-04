/**
 * Survey Taking API — React Query hooks (queries only)
 * Each hook delegates the actual HTTP call to api.ts (pure functions).
 */

import { useQuery, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  fetchSurveyById,
  fetchSurveyByCode,
  fetchSurveyQuestions,
  fetchQuestionOptions,
  fetchPendingTriggerSurvey,
} from './api';
import type { PendingTriggerSurveyResult } from './types';

/**
 * Get survey by ID
 */
export function useSurvey(surveyId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.surveyTaking.detail(surveyId.toString()),
    queryFn: () => fetchSurveyById(surveyId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get survey by code
 */
export function useSurveyByCode(surveyCode: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.surveyTaking.byCode(surveyCode),
    queryFn: () => fetchSurveyByCode(surveyCode),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get survey questions
 */
export function useSurveyQuestions(surveyId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.surveyTaking.questions(surveyId.toString()),
    queryFn: () => fetchSurveyQuestions(surveyId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get options for a single question
 */
export function useQuestionOptions(questionId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.surveyTaking.options(questionId),
    queryFn: () => fetchQuestionOptions(questionId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Prefetch options for a question in the background (smooth navigation)
 */
export async function prefetchQuestionOptions(queryClient: QueryClient, questionId: string) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.surveyTaking.options(questionId),
    queryFn: () => fetchQuestionOptions(questionId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get all questions with their options
 * Note: This is a simplified version that fetches options on-demand per question
 * For better performance, consider batch loading options from backend
 */
export function useSurveyQuestionsWithOptions(surveyId: number, options?: { enabled?: boolean }) {
  const { data: questions, isLoading, error } = useSurveyQuestions(surveyId, options);

  return {
    data: questions,
    isLoading,
    error,
  };
}

/**
 * Check if the current user has a pending trigger survey for a given trigger type.
 *
 * `staleTime: 0` — always re-fetch on mount so the trigger check is always fresh.
 * Pass `enabled: false` to skip the call (e.g. when no user is logged in).
 */
export function usePendingTriggerSurvey(
  triggerType: string,
  options?: { enabled?: boolean }
) {
  return useQuery<PendingTriggerSurveyResult>({
    queryKey: queryKeys.surveyTaking.pendingTrigger(triggerType),
    queryFn: () => fetchPendingTriggerSurvey(triggerType),
    staleTime: 0,
    gcTime: 0,
    retry: false,
    ...options,
  });
}

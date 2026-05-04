/**
 * Analyst Survey Query Hooks
 * React Query useQuery hooks for fetching data (GET operations)
 */

import { useQuery } from '@tanstack/react-query';
import { surveyQueryKeys } from './api';
import * as api from './api';

// ==================== Survey Queries ====================

/**
 * Fetch surveys with pagination
 * - Caches data for 5 minutes
 * - Automatically refetches in background
 * - Keeps previous data while loading new page
 */
export function useSurveys(pageIndex: number, pageSize: number) {
  return useQuery({
    queryKey: surveyQueryKeys.list(pageIndex, pageSize),
    queryFn: () => api.getAllSurveys({ pageIndex, pageSize }),
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
    queryKey: surveyQueryKeys.detail(id),
    queryFn: () => api.getSurveyById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id, // Only fetch if id exists
  });
}

// ==================== Question Queries ====================

/**
 * Fetch questions for a survey
 */
export function useSurveyQuestions(surveyId: number) {
  return useQuery({
    queryKey: surveyQueryKeys.questions(surveyId),
    queryFn: () => api.getQuestionsBySurvey(surveyId),
    staleTime: 5 * 60 * 1000,
    enabled: !!surveyId,
  });
}

/**
 * Fetch single question by ID
 * Use this when editing a question to get fresh data
 */
export function useQuestion(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: surveyQueryKeys.question(id),
    queryFn: () => api.getQuestionById(id),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

// ==================== Option Queries ====================

/**
 * Fetch options for a question
 */
export function useQuestionOptions(questionId: number) {
  return useQuery({
    queryKey: surveyQueryKeys.options(questionId),
    queryFn: () => api.getOptionsByQuestion(questionId),
    staleTime: 5 * 60 * 1000,
    enabled: !!questionId,
  });
}

// ==================== Field Semantic Queries ====================

/**
 * Fetch field semantics for a question
 */
export function useFieldSemantics(questionId: number) {
  return useQuery({
    queryKey: surveyQueryKeys.fieldSemantics(questionId),
    queryFn: () => api.getFieldSemanticsByQuestion(questionId),
    staleTime: 5 * 60 * 1000,
    enabled: !!questionId,
    refetchOnWindowFocus: false, // Don't refetch when user returns to tab
  });
}

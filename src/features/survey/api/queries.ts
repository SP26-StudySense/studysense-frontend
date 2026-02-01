/**
 * Survey API queries using React Query
 */

import { useQuery, QueryClient } from '@tanstack/react-query';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import type { Survey, SurveyQuestion, QuestionOption, SurveyStatusResponse } from '../types';
import { QuestionType } from '../types';

// API Response types matching backend
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

interface PaginatedData<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Backend DTO types
interface SurveyDto {
  id: number;
  title: string;
  code: string;
  status: 'Draft' | 'Published' | 'Archived';
}

interface SurveyQuestionDto {
  id: number;
  surveyId: number;
  questionKey: string;
  prompt: string;
  type: 'SingleChoice' | 'MultipleChoice' | 'Scale' | 'ShortAnswer' | 'FreeText';
  orderNo: number;
  isRequired: boolean;
  scaleMin: number | null;
  scaleMax: number | null;
}

interface SurveyQuestionOptionDto {
  id: number;
  questionId: number;
  valueKey: string;
  displayText: string;
  weight: number | null;
  orderNo: number;
  allowFreeText: boolean;
}

/**
 * Get survey by ID
 */
export function useSurvey(surveyId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.surveys.detail(surveyId.toString()),
    queryFn: async () => {
      console.log('[Survey Query] Fetching survey:', surveyId);
      const response = await get<ApiResponse<SurveyDto> | SurveyDto>(
        `/surveys/${surveyId}`
      );
      
      console.log('[Survey Query] Response:', response);
      
      // Check if response has success wrapper or is direct data
      if ('success' in response) {
        if (!response.success || !response.data) {
          console.error('[Survey Query] Failed:', response);
          throw new Error(response.message || 'Failed to fetch survey');
        }
        return response.data;
      }
      
      // Direct response
      return response as SurveyDto;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Get survey by Code
 */
export function useSurveyByCode(surveyCode: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.surveys.byCode(surveyCode),
    queryFn: async () => {
      console.log('[Survey Query] Fetching survey by code:', surveyCode);
      const response = await get<ApiResponse<SurveyDto> | SurveyDto>(
        `/surveys/code/${surveyCode}`
      );
      
      console.log('[Survey Query] Response:', response);
      
      // Check if response has success wrapper or is direct data
      if ('success' in response) {
        if (!response.success || !response.data) {
          console.error('[Survey Query] Failed:', response);
          throw new Error(response.message || 'Failed to fetch survey');
        }
        return response.data;
      }
      
      // Direct response
      return response as SurveyDto;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Get survey questions
 */
export function useSurveyQuestions(surveyId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.surveys.questions(surveyId.toString()),
    queryFn: async () => {
      console.log('[Questions Query] Fetching questions for survey:', surveyId);
      const response = await get<ApiResponse<PaginatedData<SurveyQuestionDto>> | SurveyQuestionDto[]>(
        `/surveys/${surveyId}/questions`
      );
      
      console.log('[Questions Query] Response:', response);
      
      // Check if response is wrapped or direct array
      let questionDtos: SurveyQuestionDto[];
      
      if (Array.isArray(response)) {
        // Direct array response
        questionDtos = response;
      } else if ('success' in response) {
        // Wrapped response
        if (!response.success || !response.data) {
          console.error('[Questions Query] Failed:', response);
          throw new Error(response.message || 'Failed to fetch questions');
        }
        questionDtos = response.data.items;
      } else {
        console.error('[Questions Query] Unexpected response format:', response);
        throw new Error('Unexpected response format');
      }

      // Transform backend DTO to frontend format
      const questions: SurveyQuestion[] = questionDtos.map((q) => {
        // Map backend type strings to frontend QuestionType enum
        const typeMap: Record<string, QuestionType> = {
          'SingleChoice': QuestionType.SINGLE_CHOICE,
          'MultipleChoice': QuestionType.MULTIPLE_CHOICE,
          'Scale': QuestionType.SCALE,
          'ShortAnswer': QuestionType.SHORT_ANSWER,
          'FreeText': QuestionType.FREE_TEXT,
        };

        return {
          id: q.id.toString(), // Use numeric ID from backend
          surveyId: q.surveyId.toString(),
          order: q.orderNo,
          text: q.prompt,
          type: typeMap[q.type] || QuestionType.TEXT,
          isRequired: q.isRequired,
          options: [], // Will be loaded separately
          validation: q.type === 'Scale' && q.scaleMin !== null && q.scaleMax !== null
            ? { minValue: q.scaleMin, maxValue: q.scaleMax }
            : undefined,
        };
      });

      return questions;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get question options
 */
export function useQuestionOptions(questionId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.surveys.options(questionId),
    queryFn: async () => {
      const response = await get<ApiResponse<PaginatedData<SurveyQuestionOptionDto>> | SurveyQuestionOptionDto[]>(
        `/surveys/question/option?questionId=${questionId}&pageIndex=1&pageSize=100`
      );
      
      // Check if response is wrapped or direct array
      let optionDtos: SurveyQuestionOptionDto[];
      
      if (Array.isArray(response)) {
        // Direct array response
        optionDtos = response;
      } else if ('success' in response) {
        // Wrapped response
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch options');
        }
        optionDtos = response.data.items;
      } else {
        throw new Error('Unexpected response format');
      }

      // Transform backend DTO to frontend format
      const options: QuestionOption[] = optionDtos.map((opt) => ({
        id: opt.id.toString(), // Use numeric ID from backend
        value: opt.id.toString(), // Store numeric ID as value for submission
        label: opt.displayText,
        order: opt.orderNo,
      }));

      return options;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Prefetch question options in background for smooth navigation
 */
export async function prefetchQuestionOptions(queryClient: QueryClient, questionId: string) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.surveys.options(questionId),
    queryFn: async () => {
      const response = await get<ApiResponse<PaginatedData<SurveyQuestionOptionDto>> | SurveyQuestionOptionDto[]>(
        `/surveys/question/option?questionId=${questionId}&pageIndex=1&pageSize=100`
      );
      
      // Check if response is wrapped or direct array
      let optionDtos: SurveyQuestionOptionDto[];
      
      if (Array.isArray(response)) {
        optionDtos = response;
      } else if ('success' in response) {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch options');
        }
        optionDtos = response.data.items;
      } else {
        throw new Error('Unexpected response format');
      }

      const options: QuestionOption[] = optionDtos.map((opt) => ({
        id: opt.id.toString(), // Use numeric ID from backend
        value: opt.id.toString(), // Store numeric ID as value for submission
        label: opt.displayText,
        order: opt.orderNo,
      }));

      return options;
    },
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
 * Get survey status for current user
 * Checks if user needs to complete initial survey
 */
export function useSurveyStatus(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.survey.status(),
    queryFn: async () => {
      const response = await get<SurveyStatusResponse>('/users/survey-status');
      return response;
    },
    staleTime: 30 * 1000, // Cache for 30 seconds
    enabled,
  });
}

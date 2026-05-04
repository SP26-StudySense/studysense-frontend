/**
 * High-level question & option management hook (Facade Pattern)
 * Wraps low-level api hooks for simplified question and option CRUD operations
 * 
 * Use this hook when you need to manage questions and their options
 * Examples: Question form modals, Question list components
 */

import { useCallback } from 'react';
import {
  useSurveyQuestions,
  useQuestionOptions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useCreateOption,
  useUpdateOption,
  useDeleteOption,
} from '../api';
import type {
  CreateQuestionRequest,
  UpdateQuestionRequest,
  CreateOptionRequest,
  UpdateOptionRequest,
  SurveyQuestionDto,
  SurveyQuestionOptionDto,
} from '../api/types';

interface UseQuestionManagerOptions {
  /** Survey ID (required for questions) */
  surveyId: number;
  /** Question ID (optional, for fetching options) */
  questionId?: number;
}

interface UseQuestionManagerReturn {
  // Questions data
  questions: SurveyQuestionDto[];
  options: SurveyQuestionOptionDto[];
  
  // Loading states
  isLoadingQuestions: boolean;
  isLoadingOptions: boolean;
  isWorking: boolean; // True if any mutation is in progress
  
  // Question actions
  createQuestion: (data: CreateQuestionRequest) => Promise<SurveyQuestionDto>;
  updateQuestion: (data: UpdateQuestionRequest) => Promise<SurveyQuestionDto>;
  deleteQuestion: (id: number) => Promise<void>;
  
  // Option actions
  createOption: (data: CreateOptionRequest) => Promise<SurveyQuestionOptionDto>;
  updateOption: (data: UpdateOptionRequest) => Promise<SurveyQuestionOptionDto>;
  deleteOption: (id: number, questionId: number) => Promise<void>;
  
  // Errors
  error: Error | null;
}

export function useQuestionManager(options: UseQuestionManagerOptions): UseQuestionManagerReturn {
  const { surveyId, questionId } = options;

  // Low-level hooks
  const questionsQuery = useSurveyQuestions(surveyId);
  const optionsQuery = useQuestionOptions(questionId!);
  
  const createQuestionMut = useCreateQuestion();
  const updateQuestionMut = useUpdateQuestion();
  const deleteQuestionMut = useDeleteQuestion();
  
  const createOptionMut = useCreateOption();
  const updateOptionMut = useUpdateOption();
  const deleteOptionMut = useDeleteOption();

  // High-level question actions
  const createQuestion = useCallback(
    async (data: CreateQuestionRequest) => {
      return createQuestionMut.mutateAsync(data);
    },
    [createQuestionMut]
  );

  const updateQuestion = useCallback(
    async (data: UpdateQuestionRequest) => {
      return updateQuestionMut.mutateAsync(data);
    },
    [updateQuestionMut]
  );

  const deleteQuestion = useCallback(
    async (id: number) => {
      return deleteQuestionMut.mutateAsync({ id, surveyId });
    },
    [deleteQuestionMut, surveyId]
  );

  // High-level option actions
  const createOption = useCallback(
    async (data: CreateOptionRequest) => {
      return createOptionMut.mutateAsync(data);
    },
    [createOptionMut]
  );

  const updateOption = useCallback(
    async (data: UpdateOptionRequest) => {
      return updateOptionMut.mutateAsync(data);
    },
    [updateOptionMut]
  );

  const deleteOption = useCallback(
    async (id: number, questionId: number) => {
      return deleteOptionMut.mutateAsync({ id, questionId });
    },
    [deleteOptionMut]
  );

  return {
    // Questions data
    questions: questionsQuery.data?.items || [],
    options: optionsQuery.data?.items || [],
    
    // Loading states
    isLoadingQuestions: questionsQuery.isLoading,
    isLoadingOptions: optionsQuery.isLoading,
    isWorking: 
      createQuestionMut.isPending || 
      updateQuestionMut.isPending || 
      deleteQuestionMut.isPending || 
      createOptionMut.isPending ||
      updateOptionMut.isPending || 
      deleteOptionMut.isPending,
    
    // Question actions
    createQuestion,
    updateQuestion,
    deleteQuestion,
    
    // Option actions
    createOption,
    updateOption,
    deleteOption,
    
    // Errors
    error: (questionsQuery.error || optionsQuery.error) as Error | null,
  };
}

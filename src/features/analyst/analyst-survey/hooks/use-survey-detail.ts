/**
 * High-level hook for Survey Detail page (Composite Facade Pattern)
 * Combines survey, questions, options, and field semantics management
 * 
 * Use this hook for complex pages that need full survey management
 * Example: SurveyDetail page with all CRUD operations
 */

import { useCallback } from 'react';
import { useSurveyManager } from './use-survey-manager';
import { useQuestionManager } from './use-question-manager';
import { 
  useFieldSemantics, 
  useCreateFieldSemantic, 
  useUpdateFieldSemantic, 
  useDeleteFieldSemantic 
} from '../api';
import type {
  CreateFieldSemanticRequest,
  UpdateFieldSemanticRequest,
  SurveyFieldSemanticDto,
} from '../api/types';

interface UseSurveyDetailOptions {
  /** Survey ID (required) */
  surveyId: number;
  /** Question ID (optional, for fetching options and field semantics) */
  questionId?: number;
}

interface UseSurveyDetailReturn {
  // Survey data
  survey: any | undefined;
  
  // Questions & Options
  questions: any[];
  options: any[];
  
  // Field Semantics
  fieldSemantics: SurveyFieldSemanticDto[];
  
  // Loading states
  isLoading: boolean;
  isWorking: boolean;
  
  // Survey actions
  surveyActions: {
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
  };
  
  // Question actions
  questionActions: {
    create: (data: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
  };
  
  // Option actions
  optionActions: {
    create: (data: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    delete: (id: number, questionId: number) => Promise<void>;
  };
  
  // Field Semantic actions
  fieldSemanticActions: {
    create: (data: CreateFieldSemanticRequest) => Promise<SurveyFieldSemanticDto>;
    update: (data: UpdateFieldSemanticRequest) => Promise<SurveyFieldSemanticDto>;
    delete: (id: number, questionId: number) => Promise<void>;
  };
  
  // Error state
  error: Error | null;
}

export function useSurveyDetail(options: UseSurveyDetailOptions): UseSurveyDetailReturn {
  const { surveyId, questionId } = options;

  // Composite hooks
  const surveyManager = useSurveyManager({ surveyId });
  const questionManager = useQuestionManager({ surveyId, questionId });
  
  // Field semantics hooks
  const fieldSemanticsQuery = useFieldSemantics(questionId!);
  const createFieldSemanticMut = useCreateFieldSemantic();
  const updateFieldSemanticMut = useUpdateFieldSemantic();
  const deleteFieldSemanticMut = useDeleteFieldSemantic();

  // Field semantic actions
  const createFieldSemantic = useCallback(
    async (data: CreateFieldSemanticRequest) => {
      return createFieldSemanticMut.mutateAsync(data);
    },
    [createFieldSemanticMut]
  );

  const updateFieldSemantic = useCallback(
    async (data: UpdateFieldSemanticRequest) => {
      return updateFieldSemanticMut.mutateAsync(data);
    },
    [updateFieldSemanticMut]
  );

  const deleteFieldSemantic = useCallback(
    async (id: number, questionId: number) => {
      return deleteFieldSemanticMut.mutateAsync({ id, questionId });
    },
    [deleteFieldSemanticMut]
  );

  return {
    // Survey data
    survey: surveyManager.survey,
    
    // Questions & Options
    questions: questionManager.questions,
    options: questionManager.options,
    
    // Field Semantics
    fieldSemantics: fieldSemanticsQuery.data?.items || [],
    
    // Loading states
    isLoading: surveyManager.isLoading || questionManager.isLoadingQuestions,
    isWorking: 
      surveyManager.isUpdating || 
      surveyManager.isDeleting || 
      questionManager.isWorking ||
      createFieldSemanticMut.isPending ||
      updateFieldSemanticMut.isPending ||
      deleteFieldSemanticMut.isPending,
    
    // Survey actions - grouped and simplified
    surveyActions: {
      update: surveyManager.updateSurvey,
      delete: surveyManager.deleteSurvey,
    },
    
    // Question actions
    questionActions: {
      create: questionManager.createQuestion,
      update: questionManager.updateQuestion,
      delete: questionManager.deleteQuestion,
    },
    
    // Option actions
    optionActions: {
      create: questionManager.createOption,
      update: questionManager.updateOption,
      delete: questionManager.deleteOption,
    },
    
    // Field Semantic actions
    fieldSemanticActions: {
      create: createFieldSemantic,
      update: updateFieldSemantic,
      delete: deleteFieldSemantic,
    },
    
    // Error state
    error: surveyManager.error || questionManager.error || (fieldSemanticsQuery.error as Error | null),
  };
}

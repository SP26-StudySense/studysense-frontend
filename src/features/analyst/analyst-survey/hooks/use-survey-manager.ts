/**
 * High-level survey management hook (Facade Pattern)
 * Wraps low-level api hooks for simplified usage
 * 
 * Use this hook when you need survey CRUD operations
 * Examples: SurveyList page, Survey management components
 */

import { useCallback } from 'react';
import { 
  useSurveys, 
  useSurvey,
  useCreateSurvey, 
  useUpdateSurvey, 
  useDeleteSurvey 
} from '../api';
import type { CreateSurveyRequest, UpdateSurveyRequest } from '../api/types';

interface UseSurveyManagerOptions {
  /** Page index for paginated surveys list (default: 1) */
  pageIndex?: number;
  /** Page size for paginated surveys list (default: 10) */
  pageSize?: number;
  /** Survey ID for fetching single survey detail */
  surveyId?: number;
  /** Whether to fetch surveys (default: true) */
  enabled?: boolean;
}

interface UseSurveyManagerReturn {
  // Data
  surveys: Array<any>;
  survey: any | undefined;
  pagination: {
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
  };
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Actions (simplified API)
  createSurvey: (data: CreateSurveyRequest) => Promise<any>;
  updateSurvey: (id: number, data: UpdateSurveyRequest) => Promise<any>;
  deleteSurvey: (id: number) => Promise<void>;
  
  // Error states
  error: Error | null;
}

export function useSurveyManager(options: UseSurveyManagerOptions = {}): UseSurveyManagerReturn {
  const { 
    pageIndex = 1, 
    pageSize = 10, 
    surveyId,
    enabled = true 
  } = options;

  // Low-level hooks
  const surveysQuery = useSurveys(pageIndex, pageSize);
  const surveyQuery = useSurvey(surveyId!);
  const createMutation = useCreateSurvey();
  const updateMutation = useUpdateSurvey();
  const deleteMutation = useDeleteSurvey();

  // High-level actions - simplified API
  const createSurvey = useCallback(
    async (data: CreateSurveyRequest) => {
      return createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  const updateSurvey = useCallback(
    async (id: number, data: UpdateSurveyRequest) => {
      return updateMutation.mutateAsync({ id, data });
    },
    [updateMutation]
  );

  const deleteSurvey = useCallback(
    async (id: number) => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  return {
    // Data
    surveys: surveysQuery.data?.items || [],
    survey: surveyQuery.data,
    pagination: {
      totalPages: surveysQuery.data?.totalPages || 0,
      totalCount: surveysQuery.data?.totalCount || 0,
      hasNextPage: surveysQuery.data?.hasNextPage || false,
      hasPreviousPage: surveysQuery.data?.hasPreviousPage || false,
      currentPage: surveysQuery.data?.pageIndex || pageIndex,
    },
    
    // Loading states
    isLoading: surveysQuery.isLoading || surveyQuery.isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Actions (simplified API)
    createSurvey,
    updateSurvey,
    deleteSurvey,
    
    // Error states
    error: (surveysQuery.error || surveyQuery.error) as Error | null,
  };
}

/**
 * Analyst Survey API Functions
 * Pure API calls without React hooks - can be used anywhere (server-side, workers, tests)
 */

import { get, post, del, put, patch } from '@/shared/api/client';
import type {
  // Request types
  GetAllSurveysParams,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  CreateOptionRequest,
  UpdateOptionRequest,
  CreateFieldSemanticRequest,
  UpdateFieldSemanticRequest,
  // Response types
  PaginatedResponse,
  SurveyDto,
  SurveyQuestionDto,
  SurveyQuestionOptionDto,
  SurveyFieldSemanticDto,
} from './types';

// ==================== Query Keys ====================
// Centralized query keys for React Query cache management

export const surveyQueryKeys = {
  all: ['analyst-surveys'] as const,
  lists: () => [...surveyQueryKeys.all, 'list'] as const,
  list: (pageIndex: number, pageSize: number) => 
    [...surveyQueryKeys.lists(), { pageIndex, pageSize }] as const,
  detail: (id: number) => [...surveyQueryKeys.all, 'detail', id] as const,
  questions: (surveyId: number) => [...surveyQueryKeys.all, 'questions', surveyId] as const,
  question: (id: number) => [...surveyQueryKeys.all, 'question', id] as const,
  options: (questionId: number) => [...surveyQueryKeys.all, 'options', questionId] as const,
  fieldSemantics: (questionId: number) => [...surveyQueryKeys.all, 'fieldSemantics', questionId] as const,
};

// ==================== Survey APIs ====================

/**
 * Get all surveys (paginated)
 */
export async function getAllSurveys(
  params: GetAllSurveysParams
): Promise<PaginatedResponse<SurveyDto>> {
  const response = await get<{ surveys: PaginatedResponse<SurveyDto> }>(
    `/surveys/all`,
    { params }
  );
  return response.surveys;
}

/**
 * Get survey by ID
 */
export async function getSurveyById(id: number): Promise<SurveyDto> {
  const response = await get<SurveyDto>(`/surveys/${id}`);
  
  if (!response) {
    throw new Error('Survey not found');
  }
  return response;
}

/**
 * Create new survey
 */
export async function createSurvey(
  data: CreateSurveyRequest
): Promise<SurveyDto> {
  return await post<SurveyDto>('/surveys', data);
}

/**
 * Update survey
 */
export async function updateSurvey(
  id: number,
  data: Omit<UpdateSurveyRequest, 'id'>
): Promise<SurveyDto> {
  return await put<SurveyDto>('/surveys/edit', { ...data, id });
}

/**
 * Delete survey
 */
export async function deleteSurvey(id: number): Promise<void> {
  await del(`/surveys/${id}`);
}

// ==================== Question APIs ====================

/**
 * Get questions by survey ID
 */
export async function getQuestionsBySurvey(
  surveyId: number,
  pageIndex: number = 1,
  pageSize: number = 100
): Promise<PaginatedResponse<SurveyQuestionDto>> {
  const response = await get<SurveyQuestionDto[] & {
    pageIndex: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>(
    `/surveys/${surveyId}/questions`,
    { params: { pageIndex, pageSize } }
  );
  
  if (!response || !Array.isArray(response)) {
    throw new Error('Failed to load questions');
  }
  
  // Convert PaginatedList format to PaginatedResponse format
  return {
    items: response,
    pageIndex: (response as any).pageIndex || pageIndex,
    pageSize,
    totalPages: (response as any).totalPages || 1,
    totalCount: response.length,
    hasPreviousPage: (response as any).hasPreviousPage || false,
    hasNextPage: (response as any).hasNextPage || false,
  };
}

/**
 * Get question by ID
 */
export async function getQuestionById(id: number): Promise<SurveyQuestionDto> {
  const response = await get<SurveyQuestionDto>(`/surveys/question/${id}`);
  
  if (!response) {
    throw new Error('Question not found');
  }
  return response;
}

/**
 * Create survey question
 */
export async function createQuestion(data: CreateQuestionRequest): Promise<SurveyQuestionDto> {
  return await post<SurveyQuestionDto>('/surveys/question', data);
}

/**
 * Update survey question
 */
export async function updateQuestion(data: UpdateQuestionRequest): Promise<SurveyQuestionDto> {
  return await patch<SurveyQuestionDto>('/surveys/question', data);
}

/**
 * Delete survey question
 */
export async function deleteQuestion(id: number): Promise<void> {
  await del(`/surveys/question/${id}`);
}

// ==================== Option APIs ====================

/**
 * Get options by question ID
 */
export async function getOptionsByQuestion(
  questionId: number,
  pageIndex: number = 1,
  pageSize: number = 100
): Promise<PaginatedResponse<SurveyQuestionOptionDto>> {
  const response = await get<SurveyQuestionOptionDto[] & {
    pageIndex: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>(
    `/surveys/question/option`,
    { params: { questionId, pageIndex, pageSize } }
  );
  
  if (!response || !Array.isArray(response)) {
    throw new Error('Failed to load options');
  }
  
  // Convert PaginatedList format to PaginatedResponse format
  return {
    items: response,
    pageIndex: (response as any).pageIndex || pageIndex,
    pageSize,
    totalPages: (response as any).totalPages || 1,
    totalCount: response.length,
    hasPreviousPage: (response as any).hasPreviousPage || false,
    hasNextPage: (response as any).hasNextPage || false,
  };
}

/**
 * Create survey question option
 */
export async function createOption(data: CreateOptionRequest): Promise<SurveyQuestionOptionDto> {
  return await post<SurveyQuestionOptionDto>('/surveys/question/option', data);
}

/**
 * Update survey question option
 */
export async function updateOption(data: UpdateOptionRequest): Promise<SurveyQuestionOptionDto> {
  return await patch<SurveyQuestionOptionDto>('/surveys/question/option', data);
}

/**
 * Delete survey question option
 */
export async function deleteOption(id: number): Promise<void> {
  await del(`/surveys/question/option/${id}`);
}

// ==================== Field Semantic APIs ====================

/**
 * Get field semantics by question ID
 */
export async function getFieldSemanticsByQuestion(
  questionId: number,
  pageIndex: number = 1,
  pageSize: number = 100
): Promise<PaginatedResponse<SurveyFieldSemanticDto>> {
  // API client auto-unwraps response, returns data directly (single object or null)
  const data = await get<SurveyFieldSemanticDto | null>(
    `/surveys/question/surveyfieldsemantic`,
    { params: { questionId, pageIndex, pageSize } }
  );
  
  // Backend returns single object in data, wrap it in array
  const items = data ? [data] : [];
  
  return {
    items,
    pageIndex,
    pageSize,
    totalPages: 1,
    totalCount: items.length,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

/**
 * Create field semantic
 */
export async function createFieldSemantic(data: CreateFieldSemanticRequest): Promise<SurveyFieldSemanticDto> {
  return await post<SurveyFieldSemanticDto>('/surveys/question/surveyfieldsemantic', data);
}

/**
 * Update field semantic
 */
export async function updateFieldSemantic(data: UpdateFieldSemanticRequest): Promise<SurveyFieldSemanticDto> {
  return await patch<SurveyFieldSemanticDto>('/surveys/question/surveyfieldsemantic', data);
}

/**
 * Delete field semantic
 */
export async function deleteFieldSemantic(id: number): Promise<void> {
  await del(`/surveys/question/surveyfieldsemantic/${id}`);
}

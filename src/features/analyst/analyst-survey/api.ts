/**
 * Analyst Survey API Service
 * Handles CRUD operations for survey management
 */

import { get, post, del, put, patch } from '@/shared/api/client';
import type { SurveyQuestion, SurveyQuestionOption } from './types';

// Types matching backend DTOs
export interface SurveyDto {
  id: number;
  title: string | null;
  code: string;
  status: 'Draft' | 'Published' | 'Archived';
}

export interface SurveyQuestionDto {
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

export interface SurveyQuestionOptionDto {
  id: number;
  questionId: number;
  valueKey: string;
  displayText: string;
  weight: number | null;
  orderNo: number;
  allowFreeText: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetAllSurveysParams {
  pageIndex: number;
  pageSize: number;
}

export interface CreateSurveyRequest {
  title: string | null;
  code: string;
  status: 'Draft' | 'Published' | 'Archived';
}

export interface UpdateSurveyRequest {
  id: number;
  title: string | null;
  code: string;
  status: 'Draft' | 'Published' | 'Archived';
}

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
 * Get options by question ID
 */
export async function getOptionsByQuestion(
  questionId: number,
  pageIndex: number = 1,
  pageSize: number = 100
): Promise<PaginatedResponse<SurveyQuestionOptionDto>> {
  const response = await get<{ data: PaginatedResponse<SurveyQuestionOptionDto> }>(
    `/surveys/question/option`,
    { params: { questionId, pageIndex, pageSize } }
  );
  if (!response.data) {
    throw new Error('Failed to load options');
  }
  return response.data;
}

// ============ Survey Question CRUD ============

export interface CreateQuestionRequest {
  surveyId: number;
  questionKey: string;
  prompt: string;
  type: 'SingleChoice' | 'MultipleChoice' | 'Scale' | 'ShortAnswer' | 'FreeText';
  orderNo: number;
  isRequired: boolean;
  scaleMin: number | null;
  scaleMax: number | null;
}

export interface UpdateQuestionRequest {
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

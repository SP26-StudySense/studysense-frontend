/**
 * Analyst Survey API Types
 * Centralized type definitions for survey management
 */

// ==================== Core Domain Types ====================

export type SurveyStatus = 'Draft' | 'Published' | 'Archived';
export type SurveyQuestionType = 'SingleChoice' | 'MultipleChoice' | 'Scale' | 'ShortAnswer' | 'FreeText';
export type QuestionFormType = 'single' | 'multiple' | 'scale' | 'shortanswer' | 'freetext';

// ==================== Domain Entities ====================

/**
 * Survey entity
 */
export interface Survey {
  id: number;
  title: string | null;
  code: string;
  status: SurveyStatus;
}

/**
 * Survey Question entity
 */
export interface SurveyQuestion {
  id: number;
  surveyId: number;
  questionKey: string;
  prompt: string;
  type: SurveyQuestionType;
  orderNo: number;
  isRequired: boolean;
  scaleMin: number | null;
  scaleMax: number | null;
  options?: SurveyQuestionOption[];
}

/**
 * Survey Question Option entity
 */
export interface SurveyQuestionOption {
  id: number;
  questionId: number;
  valueKey: string;
  displayText: string;
  weight: number | null;
  orderNo: number;
  allowFreeText: boolean;
}

/**
 * Survey Field Semantic entity
 */
export interface SurveyFieldSemantic {
  id: number;
  surveyQuestionId: number;
  dimensionCode: string;
  evaluates: string;
  aiHint: string | null;
  weight: number | null;
  createdAt: string;
}

// ==================== Backend DTOs ====================

export interface SurveyDto {
  id: number;
  title: string | null;
  code: string;
  status: SurveyStatus;
}

export interface SurveyQuestionDto {
  id: number;
  surveyId: number;
  questionKey: string;
  prompt: string;
  type: SurveyQuestionType;
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

export interface SurveyFieldSemanticDto {
  id: number;
  surveyQuestionId: number;
  dimensionCode: string;
  evaluates: string;
  aiHint: string | null;
  weight: number | null;
  createdAt: string;
}

// ==================== Common Types ====================

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ==================== Request Types ====================

// Survey requests
export interface GetAllSurveysParams {
  pageIndex: number;
  pageSize: number;
}

export interface CreateSurveyRequest {
  title: string | null;
  code: string;
  status: SurveyStatus;
}

export interface UpdateSurveyRequest {
  id: number;
  title: string | null;
  code: string;
  status: SurveyStatus;
}

// Question requests
export interface CreateQuestionRequest {
  surveyId: number;
  questionKey: string;
  prompt: string;
  type: SurveyQuestionType;
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
  type: SurveyQuestionType;
  orderNo: number;
  isRequired: boolean;
  scaleMin: number | null;
  scaleMax: number | null;
}

// Option requests
export interface CreateOptionRequest {
  questionId: number;
  valueKey: string;
  displayText: string;
  weight: number | null;
  orderNo: number;
  allowFreeText: boolean;
}

export interface UpdateOptionRequest {
  id: number;
  questionId: number;
  valueKey: string;
  displayText: string;
  weight: number | null;
  orderNo: number;
  allowFreeText: boolean;
}

// Field Semantic requests
export interface CreateFieldSemanticRequest {
  surveyQuestionId: number;
  dimensionCode: string;
  evaluates: string;
  aiHint: string | null;
  weight: number | null;
  createdAt?: string;
}

export interface UpdateFieldSemanticRequest {
  id: number;
  surveyQuestionId: number;
  dimensionCode: string;
  evaluates: string;
  aiHint: string | null;
  weight: number | null;
  createdAt?: string;
}

// ==================== Form Data Types ====================

/**
 * Survey form data (for UI forms)
 */
export interface SurveyFormData {
  title: string | null;
  code: string;
  status: SurveyStatus;
}

/**
 * Question form data (for UI forms)
 */
export interface QuestionFormData {
  questionKey: string;
  questionText: string;
  questionType: QuestionFormType;
  isRequired: boolean;
  orderNo: number;
  scaleMin: number | null;
  scaleMax: number | null;
}

/**
 * Option form data (for UI forms)
 */
export interface OptionFormData {
  valueKey: string;
  displayText: string;
  weight: number;
  orderNo: number;
  allowFreeText: boolean;
}

/**
 * Field Semantic form data (for UI forms)
 */
export interface FieldSemanticFormData {
  dimensionCode: string;
  evaluates: string;
  aiHint: string;
  weight: number;
}

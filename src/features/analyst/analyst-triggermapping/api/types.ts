/**
 * Analyst Survey Trigger Mapping API Types
 */

// ==================== Backend DTOs ====================

/**
 * Matches SSS.Application.Features.Surveys.Common.SurveyTriggerTypeDto
 */
export interface SurveyTriggerTypeDto {
  code: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
}

/**
 * Matches SSS.Application.Features.Surveys.Common.SurveyTriggerMappingDto
 */
export interface SurveyTriggerMappingDto {
  id: number;
  surveyId: number;
  triggerType: string;
  maxAttempts: number | null;
  cooldownDays: number | null;
  isActive: boolean;
  createdAt: string;
  /** Populated client-side from surveys list; not returned by backend DTO */
  surveyTitle?: string | null;
}

// ==================== Common ====================

export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GenericResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// ==================== Request Types ====================

export interface GetAllTriggerMappingsParams {
  pageIndex: number;
  pageSize: number;
}

export interface CreateTriggerMappingRequest {
  surveyId: number;
  triggerType: string;
  maxAttempts: number | null;
  cooldownDays: number | null;
  isActive: boolean;
}

export interface EditTriggerMappingRequest {
  id: number;
  surveyId: number;
  triggerType: string;
  maxAttempts: number | null;
  cooldownDays: number | null;
  isActive: boolean;
}

export interface CreateSurveyTriggerTypeRequest {
  code: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
}

export interface EditSurveyTriggerTypeRequest {
  code: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
}

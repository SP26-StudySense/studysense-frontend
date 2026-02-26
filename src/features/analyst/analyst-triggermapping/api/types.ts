/**
 * Analyst Survey Trigger Mapping API Types
 */

// ==================== Constants ====================

/**
 * Trigger types matching SSS.Domain.Constants.SurveyTriggerTypes
 */
export const TRIGGER_TYPES = {
  ON_REGISTER: 'ON_REGISTER',
  ON_START_ROADMAP: 'ON_START_ROADMAP',
  ON_COMPLETE_MODULE: 'ON_COMPLETE_MODULE',
} as const;

export type TriggerType = (typeof TRIGGER_TYPES)[keyof typeof TRIGGER_TYPES];

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  ON_REGISTER: 'On Register',
  ON_START_ROADMAP: 'On Start Roadmap',
  ON_COMPLETE_MODULE: 'On Complete Module',
};

export const TRIGGER_TYPE_OPTIONS = Object.entries(TRIGGER_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as TriggerType, label })
);

// ==================== Backend DTOs ====================

/**
 * Matches SSS.Application.Features.Surveys.Common.SurveyTriggerMappingDto
 */
export interface SurveyTriggerMappingDto {
  id: number;
  surveyId: number;
  triggerType: TriggerType;
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
  triggerType: TriggerType;
  maxAttempts: number | null;
  cooldownDays: number | null;
  isActive: boolean;
}

export interface EditTriggerMappingRequest {
  id: number;
  surveyId: number;
  triggerType: TriggerType;
  maxAttempts: number | null;
  cooldownDays: number | null;
  isActive: boolean;
}

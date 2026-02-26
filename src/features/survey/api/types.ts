/**
 * Survey Taking API Types
 * Centralized type definitions — mirrors backend DTOs exactly.
 * All types in this file are internal to features/survey/api.
 * UI-level types live in features/survey/types.ts.
 */

// ─── Generic wrappers ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface PaginatedData<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ─── Backend DTOs ─────────────────────────────────────────────────────────────

export interface SurveyDto {
  id: number;
  title: string;
  code: string;
  status: 'Draft' | 'Published' | 'Archived';
}

export type SurveyQuestionBackendType =
  | 'SingleChoice'
  | 'MultipleChoice'
  | 'Scale'
  | 'ShortAnswer'
  | 'FreeText';

export interface SurveyQuestionDto {
  id: number;
  surveyId: number;
  questionKey: string;
  prompt: string;
  type: SurveyQuestionBackendType;
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

// ─── Request / Response ───────────────────────────────────────────────────────

export interface TakeSurveyPayload {
  startedAt: string;
  submittedAt: string | null;
  triggerReason: string;
  answers: AnswerPayload[];
}

export interface AnswerPayload {
  questionId: number;
  optionId: number | null;
  numberValue: number | null;
  textValue: string | null;
  answeredAt: string;
}

export interface TakeSurveyResult {
  responseId: number;
  status: string;
  answeredCount: number;
  totalQuestions: number;
  validationErrors?: string[];
}

// ─── Pending Trigger Survey ───────────────────────────────────────────────────

/**
 * Mirror of SurveyTriggerTypes constants from backend (SSS.Domain.Constants.SurveyTriggerTypes)
 */
export const SurveyTriggerType = {
  ON_REGISTER: 'ON_REGISTER',
  ON_START_ROADMAP: 'ON_START_ROADMAP',
  ON_COMPLETE_MODULE: 'ON_COMPLETE_MODULE',
} as const;

export type SurveyTriggerType = (typeof SurveyTriggerType)[keyof typeof SurveyTriggerType];

/**
 * Mirror of GetPendingTriggerSurveyResult from backend
 */
export interface PendingTriggerSurveyResult {
  hasPendingSurvey: boolean;
  surveyId: number | null;
  surveyCode: string | null;
  surveyTitle: string | null;
  triggerType: string;
  completedAttempts: number;
  maxAttempts: number | null;
  cooldownDays: number | null;
}

/**
 * Survey types matching Backend DTOs
 */

import { BaseEntity } from '@/shared/types';

// Survey Status Response (for checking if user needs to complete initial survey)
export interface SurveyStatusResponse {
  requiresInitialSurvey: boolean;
  surveyId?: number;
  surveyCode?: string;
  redirectUrl?: string;
}

// Survey entity
export interface Survey extends BaseEntity {
  userId: string;
  type: SurveyType;
  status: SurveyStatus;
  triggeredBy?: SurveyTrigger;
  questions: SurveyQuestion[];
  responses?: SurveyResponse[];
  completedAt?: string;
}

// Survey types
export enum SurveyType {
  INITIAL = 'Initial',
  RESURVEY = 'Resurvey',
  FEEDBACK = 'Feedback',
}

// Survey status
export enum SurveyStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  SKIPPED = 'Skipped',
}

// Resurvey trigger reasons
export enum SurveyTrigger {
  PROGRESS_DEVIATION = 'ProgressDeviation',
  HABIT_CHANGE = 'HabitChange',
  SCHEDULED = 'Scheduled',
  USER_REQUESTED = 'UserRequested',
}

// Survey question
export interface SurveyQuestion {
  id: string;
  surveyId: string;
  order: number;
  text: string;
  type: QuestionType;
  isRequired: boolean;
  options?: QuestionOption[];
  validation?: QuestionValidation;
}

// Question types
export enum QuestionType {
  TEXT = 'Text',
  TEXTAREA = 'Textarea',
  SINGLE_CHOICE = 'SingleChoice',
  MULTIPLE_CHOICE = 'MultipleChoice',
  RATING = 'Rating',
  SCALE = 'Scale',
  TIME = 'Time',
  SHORT_ANSWER = 'ShortAnswer',
  FREE_TEXT = 'FreeText',
}

// Question option (for choice questions)
export interface QuestionOption {
  id: string;
  value: string;
  label: string;
  order: number;
}

// Question validation rules
export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
}

// Survey response (for UI state)
export interface SurveyResponse {
  questionId: string;
  value: string | string[] | number;
  answeredAt: string;
}

// Backend API types for TakeSurvey
export enum SurveyTriggerReason {
  INITIAL = 'Initial',
  RESURVEY = 'Resurvey',
  MANUAL = 'Manual',
}

export interface SurveyAnswerInput {
  questionId: number;
  optionId?: number | null;
  numberValue?: number | null;
  textValue?: string | null;
  answeredAt: string;
}

export interface TakeSurveyRequest {
  startedAt: string;
  submittedAt: string | null;
  triggerReason: SurveyTriggerReason;
  answers: SurveyAnswerInput[];
}

export interface TakeSurveyResponse {
  success: boolean;
  message: string;
  data?: {
    responseId: number;
    status: string; // "InProgress" | "Completed"
    answeredCount: number;
    totalQuestions: number;
    validationErrors?: string[];
  };
}

// Legacy - for backward compatibility
export interface SubmitSurveyRequest {
  surveyId: string;
  responses: SurveyResponse[];
}

// Survey result
export interface SurveyResult {
  surveyId: string;
  analysis: SurveyAnalysis;
  recommendations: SurveyRecommendation[];
  suggestedPlanAdjustments?: PlanAdjustment[];
}

// Survey analysis
export interface SurveyAnalysis {
  learningStyle?: string;
  preferredStudyTime?: string;
  strengthAreas?: string[];
  improvementAreas?: string[];
  motivationLevel?: number;
  availableHoursPerWeek?: number;
}

// Survey recommendation
export interface SurveyRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: number;
  actionable: boolean;
}

export enum RecommendationType {
  STUDY_HABIT = 'StudyHabit',
  SCHEDULE = 'Schedule',
  CONTENT = 'Content',
  BREAK = 'Break',
  GOAL = 'Goal',
}

// Plan adjustment suggestion
export interface PlanAdjustment {
  field: string;
  currentValue: unknown;
  suggestedValue: unknown;
  reason: string;
  impact: 'low' | 'medium' | 'high';
}

// Initial survey data structure
export interface InitialSurveyData {
  learningGoal: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  availableHoursPerWeek: number;
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  targetCompletionDate?: string;
}

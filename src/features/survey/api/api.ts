/**
 * Survey Taking API — Pure Functions
 * No React hooks. Can be used anywhere: hooks, server actions, tests, workers.
 */

import { get, post } from '@/shared/api/client';
import { QuestionType } from '../types';
import type { SurveyQuestion, QuestionOption, SurveyResponse } from '../types';
import type {
  ApiResponse,
  PaginatedData,
  SurveyDto,
  SurveyQuestionDto,
  SurveyQuestionOptionDto,
  SurveyQuestionBackendType,
  TakeSurveyPayload,
  AnswerPayload,
  TakeSurveyResult,
  PendingTriggerSurveyResult,
} from './types';

// ─── Response normalizers ────────────────────────────────────────────────────
// Backend may return either a wrapped { success, data } or a direct value.

function unwrapResponse<T>(
  response: ApiResponse<T> | T,
  errorMsg: string
): T {
  if (response !== null && typeof response === 'object' && 'success' in (response as object)) {
    const wrapped = response as ApiResponse<T>;
    if (!wrapped.success || wrapped.data === null) {
      throw new Error(wrapped.message || errorMsg);
    }
    return wrapped.data;
  }
  return response as T;
}

function unwrapPaginatedArray<T>(
  response: ApiResponse<PaginatedData<T>> | T[],
  errorMsg: string
): T[] {
  if (Array.isArray(response)) return response;

  const wrapped = response as ApiResponse<PaginatedData<T>>;
  if (!wrapped.success || !wrapped.data) {
    throw new Error(wrapped.message || errorMsg);
  }
  return wrapped.data.items;
}

// ─── Type mapping ────────────────────────────────────────────────────────────

const QUESTION_TYPE_MAP: Record<SurveyQuestionBackendType, QuestionType> = {
  SingleChoice: QuestionType.SINGLE_CHOICE,
  MultipleChoice: QuestionType.MULTIPLE_CHOICE,
  Scale: QuestionType.SCALE,
  ShortAnswer: QuestionType.SHORT_ANSWER,
  FreeText: QuestionType.FREE_TEXT,
};

// ─── Fetch functions ─────────────────────────────────────────────────────────

export async function fetchSurveyById(surveyId: number): Promise<SurveyDto> {
  const response = await get<ApiResponse<SurveyDto> | SurveyDto>(`/surveys/${surveyId}`);
  return unwrapResponse(response, 'Failed to fetch survey');
}

export async function fetchSurveyByCode(surveyCode: string): Promise<SurveyDto> {
  const response = await get<ApiResponse<SurveyDto> | SurveyDto>(
    `/surveys/code/${surveyCode}`
  );
  return unwrapResponse(response, 'Failed to fetch survey');
}

export async function fetchSurveyQuestions(surveyId: number): Promise<SurveyQuestion[]> {
  const response = await get<ApiResponse<PaginatedData<SurveyQuestionDto>> | SurveyQuestionDto[]>(
    `/surveys/${surveyId}/questions`
  );
  const dtos = unwrapPaginatedArray(response, 'Failed to fetch questions');

  return dtos.map((q) => ({
    id: q.id.toString(),
    surveyId: q.surveyId.toString(),
    order: q.orderNo,
    text: q.prompt,
    type: QUESTION_TYPE_MAP[q.type] ?? QuestionType.TEXT,
    isRequired: q.isRequired,
    options: [],
    validation:
      q.type === 'Scale' && q.scaleMin !== null && q.scaleMax !== null
        ? { minValue: q.scaleMin, maxValue: q.scaleMax }
        : undefined,
  }));
}

export async function fetchQuestionOptions(questionId: string): Promise<QuestionOption[]> {
  const response = await get<
    ApiResponse<PaginatedData<SurveyQuestionOptionDto>> | SurveyQuestionOptionDto[]
  >(`/surveys/question/option?questionId=${questionId}&pageIndex=1&pageSize=100`);

  const dtos = unwrapPaginatedArray(response, 'Failed to fetch options');

  return dtos.map((opt) => ({
    id: opt.id.toString(),
    value: opt.id.toString(),
    label: opt.displayText,
    order: opt.orderNo,
    allowFreeText: opt.allowFreeText,
  }));
}

/**
 * GET /api/surveys/surveytriggermapping/pending-trigger?triggerType=...
 * Check if the current authenticated user has a pending survey for the given trigger.
 */
export async function fetchPendingTriggerSurvey(
  triggerType: string
): Promise<PendingTriggerSurveyResult> {
  return get<PendingTriggerSurveyResult>(
    '/surveys/surveytriggermapping/pending-trigger',
    { params: { triggerType } }
  );
}

// ─── Answer transformer ───────────────────────────────────────────────────────
// Pure function: converts UI response shape → backend AnswerPayload[].
// MultipleChoice creates one record per selected option.

export function transformResponseToAnswers(
  response: SurveyResponse,
  questionType: QuestionType
): AnswerPayload[] {
  const questionId = parseInt(response.questionId);
  const answeredAt = response.answeredAt;

  if (questionType === QuestionType.MULTIPLE_CHOICE) {
    const optionIds = Array.isArray(response.value) ? response.value : [response.value];
    const answers = optionIds
      .map((v) => {
        const optionId =
          typeof v === 'string' ? parseInt(v, 10) : typeof v === 'number' ? v : null;
        return { questionId, optionId: isNaN(optionId as number) ? null : optionId, numberValue: null, textValue: null, answeredAt };
      })
      .filter((a) => a.optionId !== null);

    return answers.length > 0
      ? answers
      : [{ questionId, optionId: null, numberValue: null, textValue: null, answeredAt }];
  }

  if (questionType === QuestionType.SINGLE_CHOICE) {
    const optionId =
      typeof response.value === 'string'
        ? parseInt(response.value, 10)
        : typeof response.value === 'number'
        ? response.value
        : null;
    return [{ questionId, optionId, numberValue: null, textValue: null, answeredAt }];
  }

  if (questionType === QuestionType.SCALE || questionType === QuestionType.RATING) {
    const numberValue =
      typeof response.value === 'number'
        ? response.value
        : typeof response.value === 'string'
        ? parseFloat(response.value)
        : null;
    return [{ questionId, optionId: null, numberValue, textValue: null, answeredAt }];
  }

  const textValue = typeof response.value === 'string' ? response.value : null;
  return [{ questionId, optionId: null, numberValue: null, textValue, answeredAt }];
}

// ─── Submit ───────────────────────────────────────────────────────────────────

export async function submitSurvey(
  surveyId: number,
  payload: TakeSurveyPayload
): Promise<TakeSurveyResult> {
  const response = await post<any>(`/surveys/${surveyId}/take`, payload);

  if ('success' in response && 'data' in response) {
    if (!response.success) throw new Error(response.message || 'Failed to submit survey');
    return response.data as TakeSurveyResult;
  }
  if ('responseId' in response && 'status' in response) {
    return response as TakeSurveyResult;
  }
  throw new Error('Invalid response from server');
}

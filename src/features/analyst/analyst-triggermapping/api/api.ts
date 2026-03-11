/**
 * Analyst Survey Trigger Mapping API Functions
 * Pure API calls – no React hooks
 */

import { get, post, del, patch } from '@/shared/api/client';
import type {
  GetAllTriggerMappingsParams,
  CreateTriggerMappingRequest,
  EditTriggerMappingRequest,
  PaginatedResponse,
  SurveyTriggerMappingDto,
  SurveyTriggerTypeDto,
} from './types';

// ==================== Query Keys ====================

export const triggerMappingQueryKeys = {
  all: ['analyst-trigger-mappings'] as const,
  lists: () => [...triggerMappingQueryKeys.all, 'list'] as const,
  list: (pageIndex: number, pageSize: number) =>
    [...triggerMappingQueryKeys.lists(), { pageIndex, pageSize }] as const,
  detail: (id: number) => [...triggerMappingQueryKeys.all, 'detail', id] as const,
};

export const surveyTriggerTypeQueryKeys = {
  all: ['survey-trigger-types'] as const,
  list: () => [...surveyTriggerTypeQueryKeys.all, 'list'] as const,
};

// ==================== API Functions ====================

/**
 * GET /api/surveys/surveytriggermapping/all
 */
export async function getAllTriggerMappings(
  params: GetAllTriggerMappingsParams
): Promise<PaginatedResponse<SurveyTriggerMappingDto>> {
  const response = await get<{ surveyTriggerMappings: PaginatedResponse<SurveyTriggerMappingDto> }>(
    '/surveys/surveytriggermapping/all',
    { params }
  );
  return response.surveyTriggerMappings;
}

/**
 * GET /api/surveys/surveytriggermapping/{id}
 */
export async function getTriggerMappingById(
  id: number
): Promise<SurveyTriggerMappingDto> {
  const result = await get<SurveyTriggerMappingDto>(
    `/surveys/surveytriggermapping/${id}`
  );
  if (!result) {
    throw new Error('Trigger mapping not found');
  }
  return result;
}

/**
 * POST /api/surveys/surveytriggermapping
 */
export async function createTriggerMapping(
  data: CreateTriggerMappingRequest
): Promise<SurveyTriggerMappingDto> {
  const result = await post<SurveyTriggerMappingDto>(
    '/surveys/surveytriggermapping',
    data
  );
  if (!result) {
    throw new Error('Failed to create trigger mapping');
  }
  return result;
}

/**
 * PATCH /api/surveys/surveytriggermapping
 * Backend returns { success, message, data: null } — no DTO on response body.
 * Axios throws on non-2xx so a resolved promise means success.
 */
export async function editTriggerMapping(
  data: EditTriggerMappingRequest
): Promise<void> {
  await patch<unknown>('/surveys/surveytriggermapping', data);
}

/**
 * DELETE /api/surveys/surveytriggermapping/{id}
 */
export async function deleteTriggerMapping(id: number): Promise<void> {
  await del(`/surveys/surveytriggermapping/${id}`);
}

/**
 * GET /api/surveys/surveytriggertype/all
 * Returns all active SurveyTriggerTypes (reference data, no pagination).
 */
export async function getAllSurveyTriggerTypes(): Promise<SurveyTriggerTypeDto[]> {
  const result = await get<{ surveyTriggerTypes: SurveyTriggerTypeDto[] }>(
    '/surveys/surveytriggertype/all'
  );
  return result.surveyTriggerTypes;
}

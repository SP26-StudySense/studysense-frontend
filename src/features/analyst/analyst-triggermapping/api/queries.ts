/**
 * Analyst Trigger Mapping Query Hooks
 * React Query useQuery hooks (GET operations)
 */

import { useQuery } from '@tanstack/react-query';
import { triggerMappingQueryKeys, surveyTriggerTypeQueryKeys } from './api';
import * as api from './api';

/**
 * Fetch all trigger mappings – paginated
 */
export function useTriggerMappings(pageIndex: number, pageSize: number) {
  return useQuery({
    queryKey: triggerMappingQueryKeys.list(pageIndex, pageSize),
    queryFn: () => api.getAllTriggerMappings({ pageIndex, pageSize }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
}

/**
 * Fetch single trigger mapping by id
 */
export function useTriggerMapping(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: triggerMappingQueryKeys.detail(id),
    queryFn: () => api.getTriggerMappingById(id),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

/**
 * Fetch all active SurveyTriggerTypes (reference data — rarely changes)
 */
export function useAllSurveyTriggerTypes() {
  return useQuery({
    queryKey: surveyTriggerTypeQueryKeys.list(),
    queryFn: () => api.getAllSurveyTriggerTypes(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch one SurveyTriggerType by code
 */
export function useSurveyTriggerType(code: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: surveyTriggerTypeQueryKeys.detail(code),
    queryFn: () => api.getSurveyTriggerTypeByCode(code),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!code,
  });
}

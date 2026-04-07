/**
 * Analyst Trigger Mapping Mutation Hooks
 * React Query useMutation hooks (POST/PATCH/DELETE operations)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib';
import { triggerMappingQueryKeys, surveyTriggerTypeQueryKeys } from './api';
import * as api from './api';
import type {
  CreateTriggerMappingRequest,
  EditTriggerMappingRequest,
  CreateSurveyTriggerTypeRequest,
  EditSurveyTriggerTypeRequest,
} from './types';

// ==================== Create ====================

export function useCreateTriggerMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTriggerMappingRequest) => api.createTriggerMapping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: triggerMappingQueryKeys.lists() });
      toast.success('Trigger mapping created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create trigger mapping:', error);
      toast.error(error.message || 'Failed to create trigger mapping');
    },
  });
}

// ==================== Edit ====================

export function useEditTriggerMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditTriggerMappingRequest) => api.editTriggerMapping(data),
    onSuccess: (_void, variables) => {
      queryClient.invalidateQueries({ queryKey: triggerMappingQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: triggerMappingQueryKeys.detail(variables.id),
      });
      toast.success('Trigger mapping updated');
    },
    onError: (error: Error) => {
      console.error('Failed to edit trigger mapping:', error);
      toast.error(error.message || 'Failed to edit trigger mapping');
    },
  });
}

// ==================== Toggle IsActive (inline PATCH) ====================

export function useToggleTriggerMappingActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditTriggerMappingRequest) => api.editTriggerMapping(data),
    onSuccess: (_void, variables) => {
      queryClient.invalidateQueries({ queryKey: triggerMappingQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: triggerMappingQueryKeys.detail(variables.id),
      });
      toast.success(`Mapping ${variables.isActive ? 'activated' : 'deactivated'}`);
    },
    onError: (error: Error) => {
      console.error('Failed to toggle trigger mapping:', error);
      toast.error(error.message || 'Failed to toggle active state');
    },
  });
}

// ==================== Delete ====================

export function useDeleteTriggerMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteTriggerMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: triggerMappingQueryKeys.lists() });
      toast.success('Trigger mapping deleted');
    },
    onError: (error: Error) => {
      console.error('Failed to delete trigger mapping:', error);
      toast.error(error.message || 'Failed to delete trigger mapping');
    },
  });
}

// ==================== SurveyTriggerType CRUD ====================

export function useCreateSurveyTriggerType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSurveyTriggerTypeRequest) => api.createSurveyTriggerType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyTriggerTypeQueryKeys.lists() });
      toast.success('Survey trigger type created');
    },
    onError: (error: Error) => {
      console.error('Failed to create survey trigger type:', error);
      toast.error(error.message || 'Failed to create survey trigger type');
    },
  });
}

export function useEditSurveyTriggerType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditSurveyTriggerTypeRequest) => api.editSurveyTriggerType(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyTriggerTypeQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: surveyTriggerTypeQueryKeys.detail(variables.code),
      });
      toast.success('Survey trigger type updated');
    },
    onError: (error: Error) => {
      console.error('Failed to edit survey trigger type:', error);
      toast.error(error.message || 'Failed to edit survey trigger type');
    },
  });
}

export function useDeleteSurveyTriggerType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => api.deleteSurveyTriggerType(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyTriggerTypeQueryKeys.lists() });
      toast.success('Survey trigger type deleted');
    },
    onError: (error: Error) => {
      console.error('Failed to delete survey trigger type:', error);
      toast.error(error.message || 'Failed to delete survey trigger type');
    },
  });
}

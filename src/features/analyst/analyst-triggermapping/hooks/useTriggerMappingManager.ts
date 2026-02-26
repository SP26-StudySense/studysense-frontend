"use client";

/**
 * useTriggerMappingManager — Facade hook for Trigger Mapping CRUD
 *
 * Combines:
 *  - Paginated list query
 *  - Surveys list (for form dropdown)
 *  - Create / Edit / Toggle-Active / Delete mutations
 *  - UI state: modal + delete confirmation
 */

import { useState, useCallback } from "react";
import {
  useTriggerMappings,
  useCreateTriggerMapping,
  useEditTriggerMapping,
  useToggleTriggerMappingActive,
  useDeleteTriggerMapping,
} from "../api";
import { getAllSurveys } from "@/features/analyst/analyst-survey/api";
import { useQuery } from "@tanstack/react-query";
import type {
  SurveyTriggerMappingDto,
  CreateTriggerMappingRequest,
  EditTriggerMappingRequest,
} from "../api/types";

// ==================== Modal state union ====================

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; mapping: SurveyTriggerMappingDto }
  | { type: "delete"; id: number; label: string };

// ==================== Return shape ====================

export interface UseTriggerMappingManagerReturn {
  // Data
  mappings: SurveyTriggerMappingDto[];
  surveys: Array<{ id: number; title: string | null; code: string }>;
  pagination: {
    pageIndex: number;
    totalPages: number;
    totalCount: number;
  };

  // Loading / error states
  isLoading: boolean;
  isCreating: boolean;
  isEditing: boolean;
  isTogglingId: number | null;
  isDeleting: boolean;
  serverError: string | null;

  // Modal state
  modalState: ModalState;
  openCreate: () => void;
  openEdit: (mapping: SurveyTriggerMappingDto) => void;
  openDelete: (id: number, label: string) => void;
  closeModal: () => void;

  // Pagination
  setPageIndex: (page: number) => void;

  // Actions
  handleCreate: (data: CreateTriggerMappingRequest) => Promise<void>;
  handleEdit: (data: EditTriggerMappingRequest) => Promise<void>;
  handleToggleActive: (mapping: SurveyTriggerMappingDto) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function useTriggerMappingManager(): UseTriggerMappingManagerReturn {
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });
  const [isTogglingId, setIsTogglingId] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // ── Queries ──────────────────────────────────────────────
  const mappingsQuery = useTriggerMappings(pageIndex, pageSize);

  // Load the full survey list (up to 100) for the form dropdown
  const surveysQuery = useQuery({
    queryKey: ["analyst-surveys", "list-for-dropdown"],
    queryFn: () => getAllSurveys({ pageIndex: 1, pageSize: 100 }),
    staleTime: 10 * 60 * 1000,
  });

  // ── Mutations ─────────────────────────────────────────────
  const createMutation = useCreateTriggerMapping();
  const editMutation = useEditTriggerMapping();
  const toggleMutation = useToggleTriggerMappingActive();
  const deleteMutation = useDeleteTriggerMapping();

  // ── Modal helpers ─────────────────────────────────────────
  const openCreate = useCallback(() => {
    setServerError(null);
    setModalState({ type: "create" });
  }, []);

  const openEdit = useCallback((mapping: SurveyTriggerMappingDto) => {
    setServerError(null);
    setModalState({ type: "edit", mapping });
  }, []);

  const openDelete = useCallback((id: number, label: string) => {
    setModalState({ type: "delete", id, label });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: "none" });
    setServerError(null);
  }, []);

  // ── Actions ───────────────────────────────────────────────
  const handleCreate = useCallback(
    async (data: CreateTriggerMappingRequest) => {
      setServerError(null);
      try {
        await createMutation.mutateAsync(data);
        closeModal();
      } catch (err: unknown) {
        setServerError(
          err instanceof Error ? err.message : "An error occurred while creating."
        );
      }
    },
    [createMutation, closeModal]
  );

  const handleEdit = useCallback(
    async (data: EditTriggerMappingRequest) => {
      setServerError(null);
      try {
        await editMutation.mutateAsync(data);
        closeModal();
      } catch (err: unknown) {
        setServerError(
          err instanceof Error ? err.message : "An error occurred while updating."
        );
      }
    },
    [editMutation, closeModal]
  );

  const handleToggleActive = useCallback(
    async (mapping: SurveyTriggerMappingDto) => {
      setIsTogglingId(mapping.id);
      try {
        await toggleMutation.mutateAsync({
          id: mapping.id,
          surveyId: mapping.surveyId,
          triggerType: mapping.triggerType,
          maxAttempts: mapping.maxAttempts,
          cooldownDays: mapping.cooldownDays,
          isActive: !mapping.isActive,
        });
      } finally {
        setIsTogglingId(null);
      }
    },
    [toggleMutation]
  );

  const handleDelete = useCallback(async () => {
    if (modalState.type !== "delete") return;
    try {
      await deleteMutation.mutateAsync(modalState.id);
      closeModal();
    } catch {
      closeModal();
    }
  }, [deleteMutation, modalState, closeModal]);

  // ── Derived data ──────────────────────────────────────────
  const rawMappings = mappingsQuery.data?.items ?? [];
  const surveyItems = surveysQuery.data?.items ?? [];

  // Enrich mappings with surveyTitle from dropdown list
  const surveyMap = new Map(
    surveyItems.map((s) => [s.id, s.title ?? s.code])
  );
  const mappings: SurveyTriggerMappingDto[] = rawMappings.map((m) => ({
    ...m,
    surveyTitle: surveyMap.get(m.surveyId) ?? null,
  }));

  return {
    mappings,
    surveys: surveyItems.map((s) => ({ id: s.id, title: s.title, code: s.code })),
    pagination: {
      pageIndex,
      totalPages: mappingsQuery.data?.totalPages ?? 0,
      totalCount: mappingsQuery.data?.totalCount ?? 0,
    },
    isLoading: mappingsQuery.isLoading,
    isCreating: createMutation.isPending,
    isEditing: editMutation.isPending,
    isTogglingId,
    isDeleting: deleteMutation.isPending,
    serverError,
    modalState,
    openCreate,
    openEdit,
    openDelete,
    closeModal,
    setPageIndex,
    handleCreate,
    handleEdit,
    handleToggleActive,
    handleDelete,
  };
}

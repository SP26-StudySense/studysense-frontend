"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import {
  useAllSurveyTriggerTypes,
  useCreateSurveyTriggerType,
  useEditSurveyTriggerType,
  useDeleteSurveyTriggerType,
} from "./api";
import {
  DeleteConfirmDialog,
  SurveyTriggerTypeFormModal,
  SurveyTriggerTypeTable,
} from "./components";
import type {
  CreateSurveyTriggerTypeRequest,
  EditSurveyTriggerTypeRequest,
  SurveyTriggerTypeDto,
} from "./api/types";

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; item: SurveyTriggerTypeDto }
  | { type: "delete"; item: SurveyTriggerTypeDto };

export function SurveyTriggerTypePage() {
  const query = useAllSurveyTriggerTypes();
  const createMutation = useCreateSurveyTriggerType();
  const editMutation = useEditSurveyTriggerType();
  const deleteMutation = useDeleteSurveyTriggerType();

  const [modalState, setModalState] = useState<ModalState>({ type: "none" });
  const [serverError, setServerError] = useState<string | null>(null);

  const items = query.data ?? [];

  const openCreate = () => {
    setServerError(null);
    setModalState({ type: "create" });
  };

  const openEdit = (item: SurveyTriggerTypeDto) => {
    setServerError(null);
    setModalState({ type: "edit", item });
  };

  const openDelete = (item: SurveyTriggerTypeDto) => {
    setServerError(null);
    setModalState({ type: "delete", item });
  };

  const closeModal = () => {
    setServerError(null);
    setModalState({ type: "none" });
  };

  const handleSubmit = async (
    data: CreateSurveyTriggerTypeRequest | EditSurveyTriggerTypeRequest
  ) => {
    setServerError(null);
    try {
      if (modalState.type === "create") {
        await createMutation.mutateAsync(data as CreateSurveyTriggerTypeRequest);
      } else if (modalState.type === "edit") {
        await editMutation.mutateAsync(data as EditSurveyTriggerTypeRequest);
      }

      closeModal();
    } catch (error: unknown) {
      setServerError(error instanceof Error ? error.message : "Failed to save SurveyTriggerType.");
    }
  };

  const handleDelete = async () => {
    if (modalState.type !== "delete") return;

    setServerError(null);
    try {
      await deleteMutation.mutateAsync(modalState.item.code);
      closeModal();
    } catch (error: unknown) {
      setServerError(error instanceof Error ? error.message : "Failed to delete SurveyTriggerType.");
    }
  };

  const isSaving = createMutation.isPending || editMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Survey Trigger Types</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage trigger type definitions used by trigger mappings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/analyst-triggermapping"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back To Trigger Mapping
          </Link>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add SurveyTriggerType
          </button>
        </div>
      </div>

      <SurveyTriggerTypeTable
        items={items}
        isLoading={query.isLoading}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <SurveyTriggerTypeFormModal
        isOpen={modalState.type === "create" || modalState.type === "edit"}
        onClose={closeModal}
        mode={modalState.type === "edit" ? "edit" : "create"}
        initialData={modalState.type === "edit" ? modalState.item : undefined}
        isSubmitting={createMutation.isPending || editMutation.isPending}
        serverError={serverError}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        isOpen={modalState.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        title="Delete SurveyTriggerType"
        itemNoun="survey trigger type"
        itemLabel={modalState.type === "delete" ? modalState.item.code : undefined}
      />
    </div>
  );
}

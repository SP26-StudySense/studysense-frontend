"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useTriggerMappingManager } from "./hooks";
import { TriggerMappingTable, TriggerMappingFormModal, DeleteConfirmDialog } from "./components";
import type { CreateTriggerMappingRequest, EditTriggerMappingRequest } from "./api/types";

export function TriggerMappingPage() {
  const {
    mappings,
    surveys,
    triggerTypes,
    pagination,
    isLoading,
    isCreating,
    isEditing,
    isTogglingId,
    isDeleting,
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
  } = useTriggerMappingManager();

  // Unified form submit handler
  const handleFormSubmit = async (
    data: CreateTriggerMappingRequest | EditTriggerMappingRequest
  ) => {
    if (modalState.type === "create") {
      await handleCreate(data as CreateTriggerMappingRequest);
    } else if (modalState.type === "edit") {
      await handleEdit(data as EditTriggerMappingRequest);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Trigger Mapping</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage which surveys are automatically triggered by system events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/analyst-triggermapping/survey-trigger-types"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7dd3fc] to-[#2563eb] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
          >
            SurveyTriggerType
          </Link>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Mapping
          </button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <TriggerMappingTable
        mappings={mappings}
        triggerTypes={triggerTypes}
        isLoading={isLoading}
        isTogglingId={isTogglingId}
        pageIndex={pagination.pageIndex}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        onPageChange={setPageIndex}
        onEdit={openEdit}
        onDelete={(id) => {
          const mapping = mappings.find((m) => m.id === id);
          const label = mapping
            ? `${mapping.surveyTitle ?? `Survey #${mapping.surveyId}`} — ${mapping.triggerType}`
            : `Mapping #${id}`;
          openDelete(id, label);
        }}
        onToggleActive={handleToggleActive}
      />

      {/* ── Create / Edit Modal ─────────────────────────────── */}
      <TriggerMappingFormModal
        isOpen={modalState.type === "create" || modalState.type === "edit"}
        onClose={closeModal}
        mode={modalState.type === "edit" ? "edit" : "create"}
        initialData={modalState.type === "edit" ? modalState.mapping : undefined}
        surveys={surveys}
        triggerTypes={triggerTypes}
        isSubmitting={isCreating || isEditing}
        serverError={serverError}
        onSubmit={handleFormSubmit}
      />

      {/* ── Delete Confirm ──────────────────────────────────── */}
      <DeleteConfirmDialog
        isOpen={modalState.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        itemLabel={modalState.type === "delete" ? modalState.label : undefined}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type {
  CreateSurveyTriggerTypeRequest,
  EditSurveyTriggerTypeRequest,
  SurveyTriggerTypeDto,
} from "../api/types";

interface SurveyTriggerTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: SurveyTriggerTypeDto;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (data: CreateSurveyTriggerTypeRequest | EditSurveyTriggerTypeRequest) => Promise<void>;
}

interface TriggerTypeFormState {
  code: string;
  displayName: string;
  description: string;
  isActive: boolean;
}

const emptyForm: TriggerTypeFormState = {
  code: "",
  displayName: "",
  description: "",
  isActive: true,
};

export function SurveyTriggerTypeFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
  isSubmitting,
  serverError,
  onSubmit,
}: SurveyTriggerTypeFormModalProps) {
  const [formState, setFormState] = useState<TriggerTypeFormState>(emptyForm);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setFormState({
        code: initialData.code,
        displayName: initialData.displayName,
        description: initialData.description ?? "",
        isActive: initialData.isActive,
      });
      setValidationError(null);
      return;
    }

    setFormState(emptyForm);
    setValidationError(null);
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setValidationError(null);
    const code = formState.code.trim();
    const displayName = formState.displayName.trim();

    if (!code) {
      setValidationError("Code is required.");
      return;
    }

    if (!displayName) {
      setValidationError("Display name is required.");
      return;
    }

    const payload = {
      code,
      displayName,
      description: formState.description.trim() || null,
      isActive: formState.isActive,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              {mode === "create" ? "Add SurveyTriggerType" : "Edit SurveyTriggerType"}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">Code should match backend trigger constants.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Code</label>
            <input
              value={formState.code}
              onChange={(e) => setFormState((prev) => ({ ...prev, code: e.target.value }))}
              placeholder="ON_REGISTER"
              readOnly={mode === "edit"}
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-800 outline-none transition-colors focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/20 read-only:bg-neutral-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Display Name</label>
            <input
              value={formState.displayName}
              onChange={(e) => setFormState((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="On Register"
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-800 outline-none transition-colors focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Description</label>
            <textarea
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Optional description"
              className="w-full resize-none rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-800 outline-none transition-colors focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/20"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={formState.isActive}
              onChange={(e) => setFormState((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-neutral-300 text-[#00bae2] focus:ring-[#00bae2]/30"
            />
            Active
          </label>

          {validationError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {validationError}
            </div>
          )}

          {serverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

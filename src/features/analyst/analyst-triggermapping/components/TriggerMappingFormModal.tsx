"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { TRIGGER_TYPE_OPTIONS } from "../api/types";
import type { SurveyTriggerMappingDto, TriggerType, CreateTriggerMappingRequest, EditTriggerMappingRequest } from "../api/types";

// Survey option for dropdown
export interface SurveyOption {
  id: number;
  title: string | null;
  code: string;
}

interface TriggerMappingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: SurveyTriggerMappingDto;
  surveys: SurveyOption[];
  isSubmitting: boolean;
  serverError?: string | null;
  onSubmit: (data: CreateTriggerMappingRequest | EditTriggerMappingRequest) => void;
}

interface FormState {
  surveyId: number | "";
  triggerType: TriggerType | "";
  maxAttempts: string;
  cooldownDays: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  surveyId: "",
  triggerType: "",
  maxAttempts: "",
  cooldownDays: "",
  isActive: true,
};

export function TriggerMappingFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
  surveys,
  isSubmitting,
  serverError,
  onSubmit,
}: TriggerMappingFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);

  // Sync form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === "edit") {
        setForm({
          surveyId: initialData.surveyId,
          triggerType: initialData.triggerType,
          maxAttempts: initialData.maxAttempts != null ? String(initialData.maxAttempts) : "",
          cooldownDays: initialData.cooldownDays != null ? String(initialData.cooldownDays) : "",
          isActive: initialData.isActive,
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.surveyId || !form.triggerType) return;

    const payload = {
      ...(mode === "edit" && initialData ? { id: initialData.id } : {}),
      surveyId: Number(form.surveyId),
      triggerType: form.triggerType as TriggerType,
      maxAttempts: form.maxAttempts !== "" ? Number(form.maxAttempts) : null,
      cooldownDays: form.cooldownDays !== "" ? Number(form.cooldownDays) : null,
      isActive: form.isActive,
    } as CreateTriggerMappingRequest | EditTriggerMappingRequest;

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              {mode === "create" ? "Add Trigger Mapping" : "Edit Trigger Mapping"}
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              {mode === "create"
                ? "Bind a survey to an automatic trigger event."
                : "Update the trigger mapping settings."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="mx-6 mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Survey */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Survey <span className="text-red-500">*</span>
            </label>
            <select
              value={form.surveyId}
              onChange={(e) => setForm({ ...form, surveyId: e.target.value === "" ? "" : Number(e.target.value) })}
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            >
              <option value="">Select a survey...</option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title ? `${s.title} (${s.code})` : s.code}
                </option>
              ))}
            </select>
          </div>

          {/* Trigger Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Trigger Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.triggerType}
              onChange={(e) => setForm({ ...form, triggerType: e.target.value as TriggerType | "" })}
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            >
              <option value="">Select trigger type...</option>
              {TRIGGER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-400">
              Each survey can have at most one mapping per trigger type.
            </p>
          </div>

          {/* Max Attempts & Cooldown Days – side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Max Attempts
              </label>
              <input
                type="number"
                min={1}
                value={form.maxAttempts}
                onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
                placeholder="Unlimited"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Cooldown (days)
              </label>
              <input
                type="number"
                min={0}
                value={form.cooldownDays}
                onChange={(e) => setForm({ ...form, cooldownDays: e.target.value })}
                placeholder="No cooldown"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              />
            </div>
          </div>

          {/* IsActive */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-neutral-700">Active</p>
              <p className="text-xs text-neutral-400">Enable this mapping immediately</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none"
              style={{ backgroundColor: form.isActive ? "#00bae2" : "#d1d5db" }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : mode === "create" ? (
                "Add Mapping"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

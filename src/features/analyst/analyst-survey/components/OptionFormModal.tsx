"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { SurveyQuestionOption, OptionFormData } from "../types";

interface OptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OptionFormData) => void;
  initialData?: SurveyQuestionOption;
  mode: "create" | "edit";
  existingValueKeys: string[];
}

export function OptionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  existingValueKeys,
}: OptionFormModalProps) {
  const [formData, setFormData] = useState<OptionFormData>({
    valueKey: initialData?.valueKey || "",
    displayText: initialData?.displayText || "",
    weight: initialData?.weight || 1,
    orderNo: initialData?.orderNo || 1,
    allowFreeText: initialData?.allowFreeText || false,
  });

  const [valueKeyError, setValueKeyError] = useState("");

  // Update form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        valueKey: initialData?.valueKey || "",
        displayText: initialData?.displayText || "",
        weight: initialData?.weight || 1,
        orderNo: initialData?.orderNo || 1,
        allowFreeText: initialData?.allowFreeText || false,
      });
      setValueKeyError("");
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate unique valueKey
    if (
      mode === "create" &&
      existingValueKeys.includes(formData.valueKey.toLowerCase())
    ) {
      setValueKeyError("ValueKey must be unique within this question");
      return;
    }

    if (
      mode === "edit" &&
      initialData &&
      formData.valueKey.toLowerCase() !== initialData.valueKey.toLowerCase() &&
      existingValueKeys.includes(formData.valueKey.toLowerCase())
    ) {
      setValueKeyError("ValueKey must be unique within this question");
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            {mode === "create" ? "Create Option" : "Edit Option"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Value Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.valueKey}
              onChange={(e) => {
                setFormData({ ...formData, valueKey: e.target.value });
                setValueKeyError("");
              }}
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:ring-4 ${
                valueKeyError
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                  : "border-neutral-200 focus:border-[#00bae2] focus:ring-[#00bae2]/10"
              }`}
              placeholder="e.g., visual, option_1"
              required
            />
            {valueKeyError && (
              <p className="mt-1 text-xs text-red-600">{valueKeyError}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Display Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.displayText}
              onChange={(e) => setFormData({ ...formData, displayText: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Weight <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Order No <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.orderNo}
                onChange={(e) => setFormData({ ...formData, orderNo: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowFreeText"
              checked={formData.allowFreeText}
              onChange={(e) => setFormData({ ...formData, allowFreeText: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-300 text-[#00bae2] focus:ring-[#00bae2]"
            />
            <label htmlFor="allowFreeText" className="text-sm font-medium text-neutral-700">
              Allow Free Text Input
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
            >
              {mode === "create" ? "Create Option" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

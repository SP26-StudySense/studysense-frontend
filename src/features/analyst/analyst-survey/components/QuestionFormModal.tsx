"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Skeleton } from "@/shared/ui";
import { useQuestion } from "../api/queries";
import type { SurveyQuestion, SurveyQuestionType, QuestionFormData } from "../types";

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionFormData) => void;
  questionId?: number; // For edit mode - fetch fresh data
  initialData?: SurveyQuestion; // Fallback data from list
  mode: "create" | "edit";
}

const mapTypeFromBackend = (type: SurveyQuestionType): QuestionFormData["questionType"] => {
  switch (type) {
    case 'SingleChoice': return 'single';
    case 'MultipleChoice': return 'multiple';
    case 'Scale': return 'scale';
    case 'ShortAnswer': return 'shortanswer';
    case 'FreeText': return 'freetext';
    default: return 'single';
  }
};

export function QuestionFormModal({
  isOpen,
  onClose,
  onSubmit,
  questionId,
  initialData,
  mode,
}: QuestionFormModalProps) {
  // Fetch fresh question data when editing
  const { data: freshQuestionData, isLoading: isLoadingQuestion } = useQuestion(
    questionId || 0,
    { enabled: mode === 'edit' && !!questionId }
  );

  // Use fresh data if available, otherwise fallback to initialData
  const questionData = freshQuestionData || initialData;

  const [formData, setFormData] = useState<QuestionFormData>({
    questionKey: questionData?.questionKey || "",
    questionText: questionData?.prompt || "",
    questionType: questionData ? mapTypeFromBackend(questionData.type) : 'single',
    isRequired: questionData?.isRequired || false,
    orderNo: questionData?.orderNo || 1,
    scaleMin: questionData?.scaleMin || null,
    scaleMax: questionData?.scaleMax || null,
  });

  // Update form data when fresh question data is loaded
  useEffect(() => {
    if (questionData) {
      setFormData({
        questionKey: questionData.questionKey,
        questionText: questionData.prompt,
        questionType: mapTypeFromBackend(questionData.type),
        isRequired: questionData.isRequired,
        orderNo: questionData.orderNo,
        scaleMin: questionData.scaleMin,
        scaleMax: questionData.scaleMax,
      });
    }
  }, [questionData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            {mode === "create" ? "Create Question" : "Edit Question"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading state when fetching question data */}
        {mode === 'edit' && isLoadingQuestion ? (
          <div className="space-y-4 py-3">
            <div>
              <Skeleton className="mb-2 h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 flex-1 rounded-xl" />
              <Skeleton className="h-10 flex-1 rounded-xl" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Key */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Question Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.questionKey}
              onChange={(e) => setFormData({ ...formData, questionKey: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="e.g., learning_style_visual"
              required
            />
          </div>

          {/* Question Text */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Question Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              rows={3}
              required
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Question Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.questionType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  questionType: e.target.value as QuestionFormData["questionType"],
                  // Reset scale values if not scale type
                  scaleMin: e.target.value === 'scale' ? formData.scaleMin : null,
                  scaleMax: e.target.value === 'scale' ? formData.scaleMax : null,
                })
              }
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            >
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
              <option value="scale">Scale</option>
              <option value="shortanswer">Short Answer</option>
              <option value="freetext">Free Text</option>
            </select>
          </div>

          {/* Scale Min/Max - Show only when type is Scale */}
          {formData.questionType === 'scale' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Scale Min <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.scaleMin || ""}
                  onChange={(e) => setFormData({ ...formData, scaleMin: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                  placeholder="e.g., 1"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Scale Max <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.scaleMax || ""}
                  onChange={(e) => setFormData({ ...formData, scaleMax: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                  placeholder="e.g., 10"
                  required
                />
              </div>
            </div>
          )}

          {/* Order Number */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Order Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.orderNo}
              onChange={(e) => setFormData({ ...formData, orderNo: Number(e.target.value) })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            />
          </div>

          {/* Is Required */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRequired"
              checked={formData.isRequired}
              onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-300 text-[#00bae2] focus:ring-[#00bae2]"
            />
            <label htmlFor="isRequired" className="text-sm font-medium text-neutral-700">
              Required Question
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
              {mode === "create" ? "Create Question" : "Save Changes"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

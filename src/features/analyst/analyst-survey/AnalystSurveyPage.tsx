"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Edit, Trash2, ChevronDown, ChevronRight, X, Loader2 } from "lucide-react";
import { ConfirmationModal } from "@/shared/ui";
import { useSurvey, useSurveyQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion, useCreateOption, useUpdateOption, useDeleteOption, useQuestionOptions, useFieldSemantics, useCreateFieldSemantic, useUpdateFieldSemantic, useDeleteFieldSemantic } from "./hooks";
import type {
  Survey,
  SurveyQuestion,
  SurveyQuestionType,
  SurveyQuestionOption,
  QuestionFormData,
  OptionFormData,
  SurveyFieldSemantic,
  FieldSemanticFormData,
} from "./types";

type ModalState =
  | { type: "none" }
  | { type: "createQuestion" }
  | { type: "editQuestion"; question: SurveyQuestion }
  | { type: "deleteQuestion"; id: number; text: string }
  | { type: "createOption"; questionId: number }
  | { type: "editOption"; questionId: number; option: SurveyQuestionOption }
  | { type: "deleteOption"; questionId: number; optionId: number; displayText: string }
  | { type: "createFieldSemantic"; questionId: number }
  | { type: "editFieldSemantic"; questionId: number; fieldSemantic: SurveyFieldSemantic }
  | { type: "deleteFieldSemantic"; questionId: number; fieldSemanticId: number; dimensionCode: string };

// Question Form Modal
function QuestionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionFormData) => void;
  initialData?: SurveyQuestion;
  mode: "create" | "edit";
}) {
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

  const [formData, setFormData] = useState<QuestionFormData>({
    questionKey: initialData?.questionKey || "",
    questionText: initialData?.prompt || "",
    questionType: initialData ? mapTypeFromBackend(initialData.type) : 'single',
    isRequired: initialData?.isRequired || false,
    orderNo: initialData?.orderNo || 1,
    scaleMin: initialData?.scaleMin || null,
    scaleMax: initialData?.scaleMax || null,
  });

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
              disabled={mode === "edit"}
            />
            {mode === "edit" && (
              <p className="mt-1 text-xs text-neutral-500">Question key cannot be changed</p>
            )}
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
      </div>
    </div>
  );
}

// Option Form Modal
function OptionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  existingValueKeys,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OptionFormData) => void;
  initialData?: SurveyQuestionOption;
  mode: "create" | "edit";
  existingValueKeys: string[];
}) {
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

// Field Semantic Form Modal
function FieldSemanticFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FieldSemanticFormData) => void;
  initialData?: SurveyFieldSemantic;
  mode: "create" | "edit";
}) {
  const [formData, setFormData] = useState<FieldSemanticFormData>({
    dimensionCode: initialData?.dimensionCode || "",
    evaluates: initialData?.evaluates || "",
    aiHint: initialData?.aiHint || "",
    weight: initialData?.weight || 0,
  });

  // Update form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        dimensionCode: initialData?.dimensionCode || "",
        evaluates: initialData?.evaluates || "",
        aiHint: initialData?.aiHint || "",
        weight: initialData?.weight || 0,
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            {mode === "create" ? "Create Field Semantic" : "Edit Field Semantic"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dimension Code */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Dimension Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.dimensionCode}
              onChange={(e) => setFormData({ ...formData, dimensionCode: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="e.g., learning_style_visual"
              required
            />
          </div>

          {/* Evaluates */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Evaluates <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.evaluates}
              onChange={(e) => setFormData({ ...formData, evaluates: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 resize-none"
              placeholder="Describe what this field evaluates..."
              rows={3}
              required
            />
          </div>

          {/* AI Hint */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              AI Hint <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.aiHint}
              onChange={(e) => setFormData({ ...formData, aiHint: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 resize-none"
              placeholder="Provide hints for AI processing..."
              rows={3}
              required
            />
          </div>

          {/* Weight */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Weight <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            />
            <p className="mt-1 text-xs text-neutral-500">Value between 0 and 1</p>
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
              {mode === "create" ? "Create Field Semantic" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Question Item Component with expand/collapse
function QuestionItem({
  question,
  onEditQuestion,
  onDeleteQuestion,
  onCreateOption,
  onEditOption,
  onDeleteOption,
  onCreateFieldSemantic,
  onEditFieldSemantic,
  onDeleteFieldSemantic,
  isExpanded,
  onToggle,
}: {
  question: SurveyQuestion;
  onEditQuestion: (q: SurveyQuestion) => void;
  onDeleteQuestion: (id: number, text: string) => void;
  onCreateOption: (questionId: number) => void;
  onEditOption: (questionId: number, option: SurveyQuestionOption) => void;
  onDeleteOption: (questionId: number, optionId: number, displayText: string) => void;
  onCreateFieldSemantic: (questionId: number) => void;
  onEditFieldSemantic: (questionId: number, fieldSemantic: SurveyFieldSemantic) => void;
  onDeleteFieldSemantic: (questionId: number, fieldSemanticId: number, dimensionCode: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasOptions = question.type === 'SingleChoice' || question.type === 'MultipleChoice';
  
  // Fetch options when expanded
  const { data: optionsData, isLoading: optionsLoading } = useQuestionOptions(
    isExpanded && hasOptions ? question.id : 0
  );
  
  const options = optionsData?.items || [];
  
  // Fetch field semantics when expanded
  const { data: semanticsData, isLoading: semanticsLoading } = useFieldSemantics(
    isExpanded ? question.id : 0
  );
  
  const semantics = semanticsData?.items || [];

  // Map question type to display
  const getQuestionTypeBadge = (type: SurveyQuestion["type"]) => {
    const styles = {
      SingleChoice: "bg-blue-100 text-blue-700",
      MultipleChoice: "bg-purple-100 text-purple-700",
      Scale: "bg-yellow-100 text-yellow-700",
      ShortAnswer: "bg-green-100 text-green-700",
      FreeText: "bg-orange-100 text-orange-700",
    };
    const labels = {
      SingleChoice: "Single Choice",
      MultipleChoice: "Multiple Choice",
      Scale: "Scale",
      ShortAnswer: "Short Answer",
      FreeText: "Free Text",
    };
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-700'}`}>
        {labels[type] || type}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      {/* Question Header */}
      <div className="flex items-start gap-4 p-4">
        {/* Expand/Collapse Button - Always show for all question types */}
        <button
          onClick={onToggle}
          className="mt-1 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>

        {/* Question Content */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-500">Q{question.orderNo}</span>
                {question.isRequired && (
                  <span className="text-xs text-red-500">Required</span>
                )}
                {getQuestionTypeBadge(question.type)}
              </div>
              <p className="mt-2 text-base font-medium text-neutral-900">
                {question.prompt}
              </p>
              <p className="mt-1 text-xs font-mono text-neutral-400">
                Key: {question.questionKey}
              </p>
              {question.type === 'Scale' && question.scaleMin !== null && question.scaleMax !== null && (
                <p className="mt-1 text-xs text-neutral-600">
                  Scale: {question.scaleMin} - {question.scaleMax}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {hasOptions && (
                <button
                  onClick={() => onCreateOption(question.id)}
                  className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  title="Add Option"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => onEditQuestion(question)}
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                title="Edit Question"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDeleteQuestion(question.id, question.prompt)}
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Delete Question"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Options List (Expanded) */}
      {isExpanded && hasOptions && (
        <div className="border-t border-neutral-200 bg-neutral-50 p-4">
          {optionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#00bae2]" />
            </div>
          ) : options.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No options yet. Click the + button to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between rounded-lg bg-white p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-neutral-500">
                        #{option.orderNo}
                      </span>
                      <span className="font-mono text-xs text-neutral-600">{option.valueKey}</span>
                      <span className="text-sm text-neutral-900">{option.displayText}</span>
                      {option.allowFreeText && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          Free Text
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">Weight: {option.weight}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditOption(question.id, option)}
                      className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      title="Edit Option"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteOption(question.id, option.id, option.displayText)}
                      className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Delete Option"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Field Semantics Section (Always show when expanded) */}
      {isExpanded && (
        <div className="border-t border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-neutral-900">Field Semantics</h4>
            <button
              onClick={() => onCreateFieldSemantic(question.id)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Field Semantic
            </button>
          </div>

          {semanticsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#00bae2]" />
            </div>
          ) : semantics.length === 0 ? (
            <div className="text-center py-6 text-neutral-500 text-sm">
              No field semantics yet. Click "Add Field Semantic" to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {semantics.map((semantic) => (
                <div
                  key={semantic.id}
                  className="rounded-lg bg-white p-4 border border-neutral-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-[#00bae2]">
                          {semantic.dimensionCode}
                        </span>
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          Weight: {semantic.weight}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-500">Evaluates:</p>
                        <p className="text-sm text-neutral-900">{semantic.evaluates}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-500">AI Hint:</p>
                        <p className="text-sm text-neutral-700 italic">{semantic.aiHint}</p>
                      </div>
                      <div className="text-xs text-neutral-400">
                        Created: {new Date(semantic.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => onEditFieldSemantic(question.id, semantic)}
                        className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        title="Edit Field Semantic"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteFieldSemantic(question.id, semantic.id, semantic.dimensionCode)}
                        className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete Field Semantic"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AnalystSurveyPage({ surveyId }: { surveyId: string }) {
  const router = useRouter();
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  // Fetch survey and questions from API
  const surveyIdNum = parseInt(surveyId, 10);
  const { data: surveyData, isLoading: surveyLoading, isError: surveyError } = useSurvey(surveyIdNum);
  const { data: questionsData, isLoading: questionsLoading, isError: questionsError } = useSurveyQuestions(surveyIdNum);

  // Mutations
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  const survey = surveyData;
  const questions = questionsData?.items || [];

  // Toggle question expansion
  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Map QuestionFormData to API format
  const mapQuestionTypeToApi = (type: string): 'SingleChoice' | 'MultipleChoice' | 'Scale' | 'ShortAnswer' | 'FreeText' => {
    switch (type) {
      case 'single': return 'SingleChoice';
      case 'multiple': return 'MultipleChoice';
      case 'scale': return 'Scale';
      case 'shortanswer': return 'ShortAnswer';
      case 'freetext': return 'FreeText';
      default: return 'SingleChoice';
    }
  };

  // Question Handlers
  const handleCreateQuestion = (data: QuestionFormData) => {
    createQuestionMutation.mutate({
      surveyId: surveyIdNum,
      questionKey: data.questionKey,
      prompt: data.questionText,
      type: mapQuestionTypeToApi(data.questionType),
      orderNo: data.orderNo,
      isRequired: data.isRequired,
      scaleMin: data.scaleMin,
      scaleMax: data.scaleMax,
    }, {
      onSuccess: () => setModalState({ type: "none" }),
    });
  };

  const handleUpdateQuestion = (data: QuestionFormData) => {
    if (modalState.type !== "editQuestion") return;
    
    updateQuestionMutation.mutate({
      id: modalState.question.id,
      surveyId: surveyIdNum,
      questionKey: data.questionKey,
      prompt: data.questionText,
      type: mapQuestionTypeToApi(data.questionType),
      orderNo: data.orderNo,
      isRequired: data.isRequired,
      scaleMin: data.scaleMin,
      scaleMax: data.scaleMax,
    }, {
      onSuccess: () => setModalState({ type: "none" }),
    });
  };

  const handleDeleteQuestion = () => {
    if (modalState.type !== "deleteQuestion") return;
    
    deleteQuestionMutation.mutate({
      id: modalState.id,
      surveyId: surveyIdNum,
    }, {
      onSuccess: () => setModalState({ type: "none" }),
    });
  };

  // Option Handlers
  const createOptionMutation = useCreateOption();
  const updateOptionMutation = useUpdateOption();
  const deleteOptionMutation = useDeleteOption();

  const handleCreateOption = (data: OptionFormData) => {
    if (modalState.type !== "createOption") return;
    
    createOptionMutation.mutate({
      questionId: modalState.questionId,
      valueKey: data.valueKey,
      displayText: data.displayText,
      weight: data.weight,
      orderNo: data.orderNo,
      allowFreeText: data.allowFreeText,
    }, {
      onSuccess: () => setModalState({ type: "none" }),
    });
  };

  const handleUpdateOption = (data: OptionFormData) => {
    if (modalState.type !== "editOption") return;
    
    updateOptionMutation.mutate({
      id: modalState.option.id,
      questionId: modalState.questionId,
      valueKey: data.valueKey,
      displayText: data.displayText,
      weight: data.weight,
      orderNo: data.orderNo,
      allowFreeText: data.allowFreeText,
    }, {
      onSuccess: () => setModalState({ type: "none" }),
    });
  };

  const handleDeleteOption = () => {
    if (modalState.type !== "deleteOption") return;
    
    deleteOptionMutation.mutate({
      id: modalState.optionId,
      questionId: modalState.questionId,
    }, {
      onSuccess: () => setModalState({ type: "none" }),
    });
  };

  // Field Semantic Handlers with API
  const createFieldSemanticMutation = useCreateFieldSemantic();
  const updateFieldSemanticMutation = useUpdateFieldSemantic();
  const deleteFieldSemanticMutation = useDeleteFieldSemantic();

  const handleCreateFieldSemantic = (data: FieldSemanticFormData) => {
    if (modalState.type !== "createFieldSemantic") return;
    
    createFieldSemanticMutation.mutate({
      surveyQuestionId: modalState.questionId,
      dimensionCode: data.dimensionCode,
      evaluates: data.evaluates,
      aiHint: data.aiHint,
      weight: data.weight,
      createdAt: new Date().toISOString(),
    }, {
      onSuccess: () => setModalState({ type: "none" }),
    });
  };

  const handleUpdateFieldSemantic = (data: FieldSemanticFormData) => {
    if (modalState.type !== "editFieldSemantic") return;
    
    updateFieldSemanticMutation.mutate({
      id: modalState.fieldSemantic.id,
      surveyQuestionId: modalState.questionId,
      dimensionCode: data.dimensionCode,
      evaluates: data.evaluates,
      aiHint: data.aiHint,
      weight: data.weight,
      createdAt: modalState.fieldSemantic.createdAt,
    }, {
      onSuccess: () => setModalState({ type: "none" }),
    });
  };

  const handleDeleteFieldSemantic = () => {
    if (modalState.type !== "deleteFieldSemantic") return;
    
    deleteFieldSemanticMutation.mutate({
      id: modalState.fieldSemanticId,
      questionId: modalState.questionId,
    }, {
      onSuccess: () => setModalState({ type: "none" }),
    });
  };

  // Sort questions by orderNo
  const sortedQuestions = useMemo(() => 
    [...questions].sort((a, b) => a.orderNo - b.orderNo),
    [questions]
  );

  // Loading state
  if (surveyLoading || questionsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00bae2]" />
          <p className="text-sm text-neutral-600">Loading survey details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (surveyError || questionsError || !survey) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600">Failed to load survey</p>
          <button
            onClick={() => router.push("/analyst-survey")}
            className="mt-3 text-sm text-[#00bae2] hover:underline"
          >
            ← Back to surveys
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/analyst-survey")}
            className="rounded-xl p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{survey.title || "Untitled Survey"}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-xs text-neutral-500">{survey.code}</span>
              <span className="text-xs text-neutral-400">•</span>
              <span className={`text-xs font-medium ${
                survey.status === 'Published' ? 'text-green-600' : 
                survey.status === 'Archived' ? 'text-red-600' : 
                'text-neutral-600'
              }`}>
                {survey.status}
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-600">{questions.length} questions</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setModalState({ type: "createQuestion" })}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Create Question
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {sortedQuestions.map((question) => (
          <QuestionItem
            key={question.id}
            question={question}
            isExpanded={expandedQuestions.has(question.id)}
            onToggle={() => toggleQuestion(question.id)}
            onEditQuestion={(q) => setModalState({ type: "editQuestion", question: q })}
            onDeleteQuestion={(id, text) =>
              setModalState({ type: "deleteQuestion", id, text })
            }
            onCreateOption={(questionId) => setModalState({ type: "createOption", questionId })}
            onEditOption={(questionId, option) =>
              setModalState({ type: "editOption", questionId, option })
            }
            onDeleteOption={(questionId, optionId, displayText) =>
              setModalState({ type: "deleteOption", questionId, optionId, displayText })
            }
            onCreateFieldSemantic={(questionId) => 
              setModalState({ type: "createFieldSemantic", questionId })
            }
            onEditFieldSemantic={(questionId, fieldSemantic) =>
              setModalState({ type: "editFieldSemantic", questionId, fieldSemantic })
            }
            onDeleteFieldSemantic={(questionId, fieldSemanticId, dimensionCode) =>
              setModalState({ type: "deleteFieldSemantic", questionId, fieldSemanticId, dimensionCode })
            }
          />
        ))}

        {sortedQuestions.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white py-12 text-center">
            <p className="text-sm text-neutral-600">No questions yet. Create your first question.</p>
          </div>
        )}
      </div>

      {/* All Modals */}

      {/* Create/Edit Question Modal */}
      <QuestionFormModal
        isOpen={modalState.type === "createQuestion" || modalState.type === "editQuestion"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={
          modalState.type === "createQuestion" ? handleCreateQuestion : handleUpdateQuestion
        }
        initialData={modalState.type === "editQuestion" ? modalState.question : undefined}
        mode={modalState.type === "createQuestion" ? "create" : "edit"}
      />

      {/* Delete Question Confirmation */}
      {modalState.type === "deleteQuestion" && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModalState({ type: "none" })}
          onConfirm={handleDeleteQuestion}
          title="Delete Question"
          description={
            <div>
              <p className="mb-3">Are you sure you want to delete this question?</p>
              <div className="rounded-lg bg-neutral-100 p-3">
                <p className="font-medium text-neutral-900">{modalState.text}</p>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                This will also delete all options for this question. This action cannot be undone.
              </p>
            </div>
          }
          confirmText="Delete Question"
          variant="danger"
        />
      )}

      {/* Create/Edit Option Modal */}
      <OptionFormModal
        isOpen={modalState.type === "createOption" || modalState.type === "editOption"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={modalState.type === "createOption" ? handleCreateOption : handleUpdateOption}
        initialData={modalState.type === "editOption" ? modalState.option : undefined}
        mode={modalState.type === "createOption" ? "create" : "edit"}
        existingValueKeys={[]}
      />

      {/* Delete Option Confirmation */}
      {modalState.type === "deleteOption" && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModalState({ type: "none" })}
          onConfirm={handleDeleteOption}
          title="Delete Option"
          description={
            <div>
              <p className="mb-3">Are you sure you want to delete this option?</p>
              <div className="rounded-lg bg-neutral-100 p-3">
                <p className="font-medium text-neutral-900">{modalState.displayText}</p>
              </div>
              <p className="mt-3 text-xs text-neutral-500">This action cannot be undone.</p>
            </div>
          }
          confirmText="Delete Option"
          variant="danger"
        />
      )}

      {/* Field Semantic Modals */}
      <FieldSemanticFormModal
        isOpen={modalState.type === "createFieldSemantic" || modalState.type === "editFieldSemantic"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={modalState.type === "createFieldSemantic" ? handleCreateFieldSemantic : handleUpdateFieldSemantic}
        initialData={modalState.type === "editFieldSemantic" ? modalState.fieldSemantic : undefined}
        mode={modalState.type === "createFieldSemantic" ? "create" : "edit"}
      />

      {modalState.type === "deleteFieldSemantic" && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModalState({ type: "none" })}
          onConfirm={handleDeleteFieldSemantic}
          title="Delete Field Semantic"
          description={
            <div>
              <p className="mb-3">Are you sure you want to delete this field semantic?</p>
              <div className="rounded-lg bg-neutral-100 p-3">
                <p className="font-mono font-medium text-neutral-900">{modalState.dimensionCode}</p>
              </div>
              <p className="mt-3 text-xs text-neutral-500">This action cannot be undone.</p>
            </div>
          }
          confirmText="Delete Field Semantic"
          variant="danger"
        />
      )}
    </div>
  );
}

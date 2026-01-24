"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Edit, Trash2, ChevronDown, ChevronRight, X } from "lucide-react";
import { ConfirmationModal } from "@/shared/ui";
import type {
  Survey,
  SurveyQuestion,
  SurveyQuestionOption,
  QuestionFormData,
  OptionFormData,
} from "./types";

// Mock data
const mockSurvey: Survey = {
  id: "1",
  title: "Learning Preferences Survey",
  description: "Help us understand your learning style and preferences",
  status: "active",
  createdAt: "2025-01-15",
  updatedAt: "2025-01-20",
  totalQuestions: 8,
};

const mockQuestions: SurveyQuestion[] = [
  {
    id: "q1",
    surveyId: "1",
    questionText: "What is your preferred learning style?",
    questionType: "single",
    isRequired: true,
    orderNo: 1,
    options: [
      {
        id: "opt1",
        questionId: "q1",
        valueKey: "visual",
        displayText: "Visual (videos, diagrams)",
        weight: 1,
        orderNo: 1,
        allowFreeText: false,
      },
      {
        id: "opt2",
        questionId: "q1",
        valueKey: "auditory",
        displayText: "Auditory (lectures, podcasts)",
        weight: 1,
        orderNo: 2,
        allowFreeText: false,
      },
      {
        id: "opt3",
        questionId: "q1",
        valueKey: "reading",
        displayText: "Reading/Writing",
        weight: 1,
        orderNo: 3,
        allowFreeText: false,
      },
      {
        id: "opt4",
        questionId: "q1",
        valueKey: "kinesthetic",
        displayText: "Kinesthetic (hands-on)",
        weight: 1,
        orderNo: 4,
        allowFreeText: false,
      },
    ],
  },
  {
    id: "q2",
    surveyId: "1",
    questionText: "How many hours per week can you dedicate to learning?",
    questionType: "single",
    isRequired: true,
    orderNo: 2,
    options: [
      {
        id: "opt5",
        questionId: "q2",
        valueKey: "1-5",
        displayText: "1-5 hours",
        weight: 1,
        orderNo: 1,
        allowFreeText: false,
      },
      {
        id: "opt6",
        questionId: "q2",
        valueKey: "6-10",
        displayText: "6-10 hours",
        weight: 2,
        orderNo: 2,
        allowFreeText: false,
      },
      {
        id: "opt7",
        questionId: "q2",
        valueKey: "11-20",
        displayText: "11-20 hours",
        weight: 3,
        orderNo: 3,
        allowFreeText: false,
      },
      {
        id: "opt8",
        questionId: "q2",
        valueKey: "20+",
        displayText: "More than 20 hours",
        weight: 4,
        orderNo: 4,
        allowFreeText: false,
      },
    ],
  },
  {
    id: "q3",
    surveyId: "1",
    questionText: "What are your career goals? (Optional)",
    questionType: "text",
    isRequired: false,
    orderNo: 3,
    options: [],
  },
];

type ModalState =
  | { type: "none" }
  | { type: "createQuestion" }
  | { type: "editQuestion"; question: SurveyQuestion }
  | { type: "deleteQuestion"; id: string; text: string }
  | { type: "createOption"; questionId: string }
  | { type: "editOption"; questionId: string; option: SurveyQuestionOption }
  | { type: "deleteOption"; questionId: string; optionId: string; displayText: string };

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
  const [formData, setFormData] = useState<QuestionFormData>({
    questionText: initialData?.questionText || "",
    questionType: initialData?.questionType || "single",
    isRequired: initialData?.isRequired || false,
    orderNo: initialData?.orderNo || 1,
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
                  })
                }
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              >
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
                <option value="text">Text</option>
                <option value="rating">Rating</option>
              </select>
            </div>

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

// Question Item Component with expand/collapse
function QuestionItem({
  question,
  onEditQuestion,
  onDeleteQuestion,
  onCreateOption,
  onEditOption,
  onDeleteOption,
}: {
  question: SurveyQuestion;
  onEditQuestion: (q: SurveyQuestion) => void;
  onDeleteQuestion: (id: string, text: string) => void;
  onCreateOption: (questionId: string) => void;
  onEditOption: (questionId: string, option: SurveyQuestionOption) => void;
  onDeleteOption: (questionId: string, optionId: string, displayText: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasOptions = question.options.length > 0;

  const getQuestionTypeBadge = (type: SurveyQuestion["questionType"]) => {
    const styles = {
      single: "bg-blue-100 text-blue-700",
      multiple: "bg-purple-100 text-purple-700",
      text: "bg-green-100 text-green-700",
      rating: "bg-orange-100 text-orange-700",
    };
    const labels = {
      single: "Single Choice",
      multiple: "Multiple Choice",
      text: "Text",
      rating: "Rating",
    };
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      {/* Question Header */}
      <div className="flex items-start gap-4 p-4">
        {/* Expand/Collapse Button */}
        {hasOptions && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Question Content */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-500">Q{question.orderNo}</span>
                {question.isRequired && (
                  <span className="text-xs text-red-500">Required</span>
                )}
                {getQuestionTypeBadge(question.questionType)}
              </div>
              <p className="mt-2 text-base font-medium text-neutral-900">
                {question.questionText}
              </p>
              {hasOptions && (
                <p className="mt-1 text-sm text-neutral-600">
                  {question.options.length} option{question.options.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {(question.questionType === "single" || question.questionType === "multiple") && (
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
                onClick={() => onDeleteQuestion(question.id, question.questionText)}
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
          <div className="space-y-2">
            {question.options.map((option) => (
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
        </div>
      )}
    </div>
  );
}

export function AdminSurveyPage({ surveyId }: { surveyId: string }) {
  const router = useRouter();
  const [survey] = useState<Survey>(mockSurvey);
  const [questions, setQuestions] = useState<SurveyQuestion[]>(mockQuestions);
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });

  // Question Handlers
  const handleCreateQuestion = (data: QuestionFormData) => {
    const newQuestion: SurveyQuestion = {
      id: `q-${Date.now()}`,
      surveyId,
      ...data,
      options: [],
    };
    setQuestions([...questions, newQuestion]);
    setModalState({ type: "none" });
  };

  const handleUpdateQuestion = (data: QuestionFormData) => {
    if (modalState.type !== "editQuestion") return;
    setQuestions(
      questions.map((q) =>
        q.id === modalState.question.id ? { ...q, ...data } : q
      )
    );
    setModalState({ type: "none" });
  };

  const handleDeleteQuestion = () => {
    if (modalState.type !== "deleteQuestion") return;
    setQuestions(questions.filter((q) => q.id !== modalState.id));
    setModalState({ type: "none" });
  };

  // Option Handlers
  const handleCreateOption = (data: OptionFormData) => {
    if (modalState.type !== "createOption") return;
    const newOption: SurveyQuestionOption = {
      id: `opt-${Date.now()}`,
      questionId: modalState.questionId,
      ...data,
    };
    setQuestions(
      questions.map((q) =>
        q.id === modalState.questionId
          ? { ...q, options: [...q.options, newOption] }
          : q
      )
    );
    setModalState({ type: "none" });
  };

  const handleUpdateOption = (data: OptionFormData) => {
    if (modalState.type !== "editOption") return;
    setQuestions(
      questions.map((q) =>
        q.id === modalState.questionId
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.id === modalState.option.id ? { ...opt, ...data } : opt
              ),
            }
          : q
      )
    );
    setModalState({ type: "none" });
  };

  const handleDeleteOption = () => {
    if (modalState.type !== "deleteOption") return;
    setQuestions(
      questions.map((q) =>
        q.id === modalState.questionId
          ? { ...q, options: q.options.filter((opt) => opt.id !== modalState.optionId) }
          : q
      )
    );
    setModalState({ type: "none" });
  };

  // Get existing valueKeys for validation
  const getExistingValueKeys = (questionId: string): string[] => {
    const question = questions.find((q) => q.id === questionId);
    return question ? question.options.map((opt) => opt.valueKey.toLowerCase()) : [];
  };

  // Sort questions by orderNo
  const sortedQuestions = [...questions].sort((a, b) => a.orderNo - b.orderNo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin-surveys")}
            className="rounded-xl p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{survey.title}</h1>
            <p className="mt-1 text-sm text-neutral-600">{survey.description}</p>
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
        existingValueKeys={
          modalState.type === "createOption" || modalState.type === "editOption"
            ? getExistingValueKeys(modalState.questionId)
            : []
        }
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
    </div>
  );
}

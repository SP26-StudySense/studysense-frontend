"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  CheckCircle2,
} from "lucide-react";
import { ConfirmationModal } from "@/shared/ui";
import type {
  Quiz,
  QuizQuestion,
  QuizQuestionOption,
  QuestionFormData,
  OptionFormData,
} from "./types";

const mockQuiz: Quiz = {
  id: "1",
  title: "JavaScript Fundamentals Quiz",
  description: "Assess core JavaScript concepts for beginners",
  category: "Programming",
  status: "published",
  totalQuestions: 3,
  timeLimitMinutes: 20,
  passScore: 70,
  createdAt: "2026-02-01",
  updatedAt: "2026-02-10",
};

const mockQuestions: QuizQuestion[] = [
  {
    id: "q1",
    quizId: "1",
    questionText: "Which keyword declares a block-scoped variable in JavaScript?",
    questionType: "single",
    difficulty: "easy",
    score: 10,
    orderNo: 1,
    options: [
      { id: "q1o1", questionId: "q1", optionText: "var", isCorrect: false, orderNo: 1 },
      { id: "q1o2", questionId: "q1", optionText: "let", isCorrect: true, orderNo: 2 },
      { id: "q1o3", questionId: "q1", optionText: "const", isCorrect: false, orderNo: 3 },
      {
        id: "q1o4",
        questionId: "q1",
        optionText: "function",
        isCorrect: false,
        orderNo: 4,
      },
    ],
  },
  {
    id: "q2",
    quizId: "1",
    questionText: "Which of the following are JavaScript primitive data types?",
    questionType: "multiple",
    difficulty: "medium",
    score: 15,
    orderNo: 2,
    options: [
      {
        id: "q2o1",
        questionId: "q2",
        optionText: "String",
        isCorrect: true,
        orderNo: 1,
      },
      {
        id: "q2o2",
        questionId: "q2",
        optionText: "Number",
        isCorrect: true,
        orderNo: 2,
      },
      {
        id: "q2o3",
        questionId: "q2",
        optionText: "Array",
        isCorrect: false,
        orderNo: 3,
      },
      {
        id: "q2o4",
        questionId: "q2",
        optionText: "Boolean",
        isCorrect: true,
        orderNo: 4,
      },
    ],
  },
  {
    id: "q3",
    quizId: "1",
    questionText: "What does JSON stand for?",
    questionType: "single",
    difficulty: "easy",
    score: 10,
    orderNo: 3,
    options: [
      {
        id: "q3o1",
        questionId: "q3",
        optionText: "Java Syntax Object Notation",
        isCorrect: false,
        orderNo: 1,
      },
      {
        id: "q3o2",
        questionId: "q3",
        optionText: "JavaScript Object Notation",
        isCorrect: true,
        orderNo: 2,
      },
      {
        id: "q3o3",
        questionId: "q3",
        optionText: "Java Structured Object Naming",
        isCorrect: false,
        orderNo: 3,
      },
    ],
  },
];

type ModalState =
  | { type: "none" }
  | { type: "createQuestion" }
  | { type: "editQuestion"; question: QuizQuestion }
  | { type: "deleteQuestion"; id: string; text: string }
  | { type: "createOption"; questionId: string }
  | { type: "editOption"; questionId: string; option: QuizQuestionOption }
  | { type: "deleteOption"; questionId: string; optionId: string; text: string };

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
  initialData?: QuizQuestion;
  mode: "create" | "edit";
}) {
  const [formData, setFormData] = useState<QuestionFormData>({
    questionText: initialData?.questionText || "",
    questionType: initialData?.questionType || "single",
    difficulty: initialData?.difficulty || "easy",
    score: initialData?.score || 10,
    orderNo: initialData?.orderNo || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              >
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Difficulty <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as QuestionFormData["difficulty"],
                  })
                }
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Score <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Order No. <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={formData.orderNo}
                onChange={(e) => setFormData({ ...formData, orderNo: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              />
            </div>
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

function OptionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OptionFormData) => void;
  initialData?: QuizQuestionOption;
  mode: "create" | "edit";
}) {
  const [formData, setFormData] = useState<OptionFormData>({
    optionText: initialData?.optionText || "",
    isCorrect: initialData?.isCorrect || false,
    orderNo: initialData?.orderNo || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
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
              Option Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.optionText}
              onChange={(e) => setFormData({ ...formData, optionText: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Order No. <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={formData.orderNo}
                onChange={(e) => setFormData({ ...formData, orderNo: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              />
            </div>

            <label className="flex items-center gap-2 pt-7 text-sm font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={formData.isCorrect}
                onChange={(e) => setFormData({ ...formData, isCorrect: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-[#00bae2] focus:ring-[#00bae2]"
              />
              Correct Answer
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

export function ContentQuizPage({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [quiz] = useState<Quiz>({ ...mockQuiz, id: quizId });
  const [questions, setQuestions] = useState<QuizQuestion[]>(mockQuestions);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    mockQuestions[0]?.id || null
  );
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });

  const handleCreateQuestion = (data: QuestionFormData) => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      quizId,
      ...data,
      options: [],
    };

    setQuestions([...questions, newQuestion].sort((a, b) => a.orderNo - b.orderNo));
    setExpandedQuestionId(newQuestion.id);
    setModalState({ type: "none" });
  };

  const handleUpdateQuestion = (data: QuestionFormData) => {
    if (modalState.type !== "editQuestion") return;

    setQuestions(
      questions
        .map((question) =>
          question.id === modalState.question.id ? { ...question, ...data } : question
        )
        .sort((a, b) => a.orderNo - b.orderNo)
    );
    setModalState({ type: "none" });
  };

  const handleDeleteQuestion = () => {
    if (modalState.type !== "deleteQuestion") return;

    const nextQuestions = questions.filter((question) => question.id !== modalState.id);
    setQuestions(nextQuestions);

    if (expandedQuestionId === modalState.id) {
      setExpandedQuestionId(nextQuestions[0]?.id || null);
    }

    setModalState({ type: "none" });
  };

  const handleCreateOption = (data: OptionFormData) => {
    if (modalState.type !== "createOption") return;

    setQuestions(
      questions.map((question) =>
        question.id === modalState.questionId
          ? {
              ...question,
              options: [
                ...question.options,
                {
                  id: `opt-${Date.now()}`,
                  questionId: question.id,
                  ...data,
                },
              ].sort((a, b) => a.orderNo - b.orderNo),
            }
          : question
      )
    );
    setModalState({ type: "none" });
  };

  const handleUpdateOption = (data: OptionFormData) => {
    if (modalState.type !== "editOption") return;

    setQuestions(
      questions.map((question) =>
        question.id === modalState.questionId
          ? {
              ...question,
              options: question.options
                .map((option) =>
                  option.id === modalState.option.id ? { ...option, ...data } : option
                )
                .sort((a, b) => a.orderNo - b.orderNo),
            }
          : question
      )
    );
    setModalState({ type: "none" });
  };

  const handleDeleteOption = () => {
    if (modalState.type !== "deleteOption") return;

    setQuestions(
      questions.map((question) =>
        question.id === modalState.questionId
          ? {
              ...question,
              options: question.options.filter((option) => option.id !== modalState.optionId),
            }
          : question
      )
    );
    setModalState({ type: "none" });
  };

  const getDifficultyBadge = (difficulty: QuizQuestion["difficulty"]) => {
    const styles = {
      easy: "bg-green-100 text-green-700",
      medium: "bg-amber-100 text-amber-700",
      hard: "bg-red-100 text-red-700",
    };

    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[difficulty]}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/content-quizzes")}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
          </button>

          <button
            onClick={() => setModalState({ type: "createQuestion" })}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{quiz.title}</h1>
          <p className="mt-1 text-sm text-neutral-600">{quiz.description}</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-neutral-700 md:grid-cols-4">
          <div className="rounded-xl bg-neutral-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-neutral-500">Category</p>
            <p className="mt-1 font-medium">{quiz.category}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-neutral-500">Questions</p>
            <p className="mt-1 font-medium">{questions.length}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-neutral-500">Time Limit</p>
            <p className="mt-1 font-medium">{quiz.timeLimitMinutes} min</p>
          </div>
          <div className="rounded-xl bg-neutral-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-neutral-500">Pass Score</p>
            <p className="mt-1 font-medium">{quiz.passScore}%</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question) => {
          const isExpanded = expandedQuestionId === question.id;
          return (
            <div key={question.id} className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <button
                onClick={() => setExpandedQuestionId(isExpanded ? null : question.id)}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="flex min-w-0 items-start gap-3">
                  {isExpanded ? (
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                  ) : (
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Q{question.orderNo}
                      </span>
                      {getDifficultyBadge(question.difficulty)}
                      <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        {question.score} pts
                      </span>
                    </div>
                    <p className="mt-2 font-medium text-neutral-900">{question.questionText}</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {question.questionType === "single"
                        ? "Single Choice"
                        : "Multiple Choice"} · {question.options.length} options
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalState({ type: "editQuestion", question });
                    }}
                    className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalState({
                        type: "deleteQuestion",
                        id: question.id,
                        text: question.questionText,
                      });
                    }}
                    className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-neutral-100 px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                      Answer Options
                    </h3>
                    <button
                      onClick={() =>
                        setModalState({ type: "createOption", questionId: question.id })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {question.options.length > 0 ? (
                      question.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-500">{option.orderNo}.</span>
                            <p className="text-sm text-neutral-800">{option.optionText}</p>
                            {option.isCorrect && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Correct
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setModalState({
                                  type: "editOption",
                                  questionId: question.id,
                                  option,
                                })
                              }
                              className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setModalState({
                                  type: "deleteOption",
                                  questionId: question.id,
                                  optionId: option.id,
                                  text: option.optionText,
                                })
                              }
                              className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
                        No options yet. Add options to complete this question.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <QuestionFormModal
        isOpen={modalState.type === "createQuestion"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={handleCreateQuestion}
        mode="create"
      />

      <QuestionFormModal
        isOpen={modalState.type === "editQuestion"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={handleUpdateQuestion}
        initialData={modalState.type === "editQuestion" ? modalState.question : undefined}
        mode="edit"
      />

      <OptionFormModal
        isOpen={modalState.type === "createOption"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={handleCreateOption}
        mode="create"
      />

      <OptionFormModal
        isOpen={modalState.type === "editOption"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={handleUpdateOption}
        initialData={modalState.type === "editOption" ? modalState.option : undefined}
        mode="edit"
      />

      <ConfirmationModal
        isOpen={modalState.type === "deleteQuestion"}
        onClose={() => setModalState({ type: "none" })}
        onConfirm={handleDeleteQuestion}
        title="Delete Question"
        description={
          modalState.type === "deleteQuestion"
            ? `Are you sure you want to delete this question: "${modalState.text}"?`
            : ""
        }
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={modalState.type === "deleteOption"}
        onClose={() => setModalState({ type: "none" })}
        onConfirm={handleDeleteOption}
        title="Delete Option"
        description={
          modalState.type === "deleteOption"
            ? `Are you sure you want to delete option "${modalState.text}"?`
            : ""
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Edit, Trash2, Eye, X, Clock, Trophy } from "lucide-react";
import { ConfirmationModal } from "@/shared/ui";
import type { Quiz, QuizFormData } from "./types";

const mockQuizzes: Quiz[] = [
  {
    id: "1",
    title: "JavaScript Fundamentals Quiz",
    description: "Assess core JavaScript concepts for beginners",
    category: "Programming",
    status: "published",
    totalQuestions: 10,
    timeLimitMinutes: 20,
    passScore: 70,
    createdAt: "2026-02-01",
    updatedAt: "2026-02-10",
  },
  {
    id: "2",
    title: "UI/UX Principles Checkpoint",
    description: "Validate understanding of modern design principles",
    category: "Design",
    status: "draft",
    totalQuestions: 8,
    timeLimitMinutes: 15,
    passScore: 65,
    createdAt: "2026-02-05",
    updatedAt: "2026-02-08",
  },
  {
    id: "3",
    title: "Database Basics Quiz",
    description: "Quick checkpoint for relational database knowledge",
    category: "Data",
    status: "archived",
    totalQuestions: 12,
    timeLimitMinutes: 25,
    passScore: 75,
    createdAt: "2026-01-20",
    updatedAt: "2026-02-02",
  },
];

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; quiz: Quiz }
  | { type: "delete"; id: string; title: string };

function QuizFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuizFormData) => void;
  initialData?: Quiz;
  mode: "create" | "edit";
}) {
  const [formData, setFormData] = useState<QuizFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    status: initialData?.status || "draft",
    timeLimitMinutes: initialData?.timeLimitMinutes || 15,
    passScore: initialData?.passScore || 70,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            {mode === "create" ? "Create New Quiz" : "Edit Quiz"}
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
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Quiz["status"] })
                }
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Time Limit (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={formData.timeLimitMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, timeLimitMinutes: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Pass Score (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.passScore}
                onChange={(e) => setFormData({ ...formData, passScore: Number(e.target.value) })}
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
              {mode === "create" ? "Create Quiz" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || quiz.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateQuiz = (data: QuizFormData) => {
    const today = new Date().toISOString().split("T")[0];
    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      ...data,
      totalQuestions: 0,
      createdAt: today,
      updatedAt: today,
    };

    setQuizzes([newQuiz, ...quizzes]);
    setModalState({ type: "none" });
  };

  const handleUpdateQuiz = (data: QuizFormData) => {
    if (modalState.type !== "edit") return;

    const today = new Date().toISOString().split("T")[0];
    setQuizzes(
      quizzes.map((quiz) =>
        quiz.id === modalState.quiz.id ? { ...quiz, ...data, updatedAt: today } : quiz
      )
    );
    setModalState({ type: "none" });
  };

  const handleDeleteQuiz = () => {
    if (modalState.type !== "delete") return;

    setQuizzes(quizzes.filter((quiz) => quiz.id !== modalState.id));
    setModalState({ type: "none" });
  };

  const getStatusBadge = (status: Quiz["status"]) => {
    const styles = {
      draft: "bg-neutral-100 text-neutral-700",
      published: "bg-green-100 text-green-700",
      archived: "bg-amber-100 text-amber-700",
    };

    return (
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Quiz Management</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Manage quiz sets, metadata, and question banks
          </p>
        </div>
        <button
          onClick={() => setModalState({ type: "create" })}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Create Quiz
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quizzes..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Quiz
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Questions
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Settings
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="transition-colors hover:bg-neutral-50/60">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-neutral-900">{quiz.title}</p>
                        <p className="mt-1 text-sm text-neutral-500">{quiz.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">{quiz.category}</td>
                    <td className="px-6 py-4">{getStatusBadge(quiz.status)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-700">{quiz.totalQuestions}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs text-neutral-600">
                        <p className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {quiz.timeLimitMinutes} min
                        </p>
                        <p className="inline-flex items-center gap-1">
                          <Trophy className="h-3.5 w-3.5" />
                          Pass {quiz.passScore}%
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/content-quizzes/${quiz.id}`}
                          className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setModalState({ type: "edit", quiz })}
                          className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setModalState({ type: "delete", id: quiz.id, title: quiz.title })
                          }
                          className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-500">
                    No quizzes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QuizFormModal
        isOpen={modalState.type === "create"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={handleCreateQuiz}
        mode="create"
      />

      <QuizFormModal
        isOpen={modalState.type === "edit"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={handleUpdateQuiz}
        initialData={modalState.type === "edit" ? modalState.quiz : undefined}
        mode="edit"
      />

      <ConfirmationModal
        isOpen={modalState.type === "delete"}
        onClose={() => setModalState({ type: "none" })}
        onConfirm={handleDeleteQuiz}
        title="Delete Quiz"
        description={
          modalState.type === "delete"
            ? `Are you sure you want to delete "${modalState.title}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

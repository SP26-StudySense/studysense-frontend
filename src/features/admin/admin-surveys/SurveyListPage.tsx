"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Edit, Trash2, Eye, X } from "lucide-react";
import { ConfirmationModal } from "@/shared/ui";
import type { Survey, SurveyFormData } from "./types";

// Mock data
const mockSurveys: Survey[] = [
  {
    id: "1",
    title: "Learning Preferences Survey",
    description: "Help us understand your learning style and preferences",
    status: "active",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-20",
    totalQuestions: 8,
  },
  {
    id: "2",
    title: "Course Feedback Survey",
    description: "Share your experience with our courses",
    status: "active",
    createdAt: "2025-01-10",
    updatedAt: "2025-01-18",
    totalQuestions: 12,
  },
  {
    id: "3",
    title: "Career Goals Assessment",
    description: "Tell us about your career aspirations",
    status: "draft",
    createdAt: "2025-01-05",
    updatedAt: "2025-01-05",
    totalQuestions: 6,
  },
];

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; survey: Survey }
  | { type: "delete"; id: string; title: string };

// Survey Form Modal Component
function SurveyFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SurveyFormData) => void;
  initialData?: Survey;
  mode: "create" | "edit";
}) {
  const [formData, setFormData] = useState<SurveyFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "draft",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            {mode === "create" ? "Create New Survey" : "Edit Survey"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              />
            </div>

            {/* Description */}
            <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Survey["status"] })
                }
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

          {/* Actions */}
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
              {mode === "create" ? "Create Survey" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SurveyListPage() {
  const [surveys, setSurveys] = useState<Survey[]>(mockSurveys);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });

  // Filter surveys
  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || survey.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateSurvey = (data: SurveyFormData) => {
    const newSurvey: Survey = {
      id: `survey-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      totalQuestions: 0,
    };
    setSurveys([newSurvey, ...surveys]);
    setModalState({ type: "none" });
  };

  const handleUpdateSurvey = (data: SurveyFormData) => {
    if (modalState.type !== "edit") return;
    setSurveys(
      surveys.map((s) =>
        s.id === modalState.survey.id
          ? { ...s, ...data, updatedAt: new Date().toISOString().split("T")[0] }
          : s
      )
    );
    setModalState({ type: "none" });
  };

  const handleDeleteSurvey = () => {
    if (modalState.type !== "delete") return;
    setSurveys(surveys.filter((s) => s.id !== modalState.id));
    setModalState({ type: "none" });
  };

  const getStatusBadge = (status: Survey["status"]) => {
    const styles = {
      draft: "bg-neutral-100 text-neutral-700",
      active: "bg-green-100 text-green-700",
      closed: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Survey Management</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Manage surveys, questions, and options
          </p>
        </div>
        <button
          onClick={() => setModalState({ type: "create" })}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Create Survey
        </button>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search surveys..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Surveys Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                  Survey
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                  Questions
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                  Updated
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredSurveys.map((survey) => (
                <tr key={survey.id} className="transition-colors hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-neutral-900">{survey.title}</div>
                      <div className="mt-1 text-sm text-neutral-600">
                        {survey.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(survey.status)}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-900">
                      {survey.totalQuestions} questions
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-600">{survey.updatedAt}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin-surveys/${survey.id}`}
                        className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setModalState({ type: "edit", survey })}
                        className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setModalState({ type: "delete", id: survey.id, title: survey.title })
                        }
                        className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSurveys.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-neutral-600">No surveys found</p>
          </div>
        )}
      </div>

      {filteredSurveys.length > 0 && (
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <div>
            Showing <span className="font-medium text-neutral-900">{filteredSurveys.length}</span>{" "}
            of <span className="font-medium text-neutral-900">{surveys.length}</span> surveys
          </div>
        </div>
      )}

      {/* All Modals */}

      {/* Create/Edit Survey Modal */}
      <SurveyFormModal
        isOpen={modalState.type === "create" || modalState.type === "edit"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={modalState.type === "create" ? handleCreateSurvey : handleUpdateSurvey}
        initialData={modalState.type === "edit" ? modalState.survey : undefined}
        mode={modalState.type === "create" ? "create" : "edit"}
      />

      {/* Delete Survey Confirmation */}
      {modalState.type === "delete" && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModalState({ type: "none" })}
          onConfirm={handleDeleteSurvey}
          title="Delete Survey"
          description={
            <div>
              <p className="mb-3">Are you sure you want to delete this survey?</p>
              <div className="rounded-lg bg-neutral-100 p-3">
                <p className="font-medium text-neutral-900">{modalState.title}</p>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                This will also delete all questions and options in this survey. This action cannot
                be undone.
              </p>
            </div>
          }
          confirmText="Delete Survey"
          variant="danger"
        />
      )}
    </div>
  );
}

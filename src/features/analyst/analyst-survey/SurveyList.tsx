"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { ConfirmationModal } from "@/shared/ui";
import { SurveyFormModal } from "./components";
import type { Survey, SurveyFormData } from "./types";
import { useSurveyManager } from "./hooks/use-survey-manager";

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; survey: Survey }
  | { type: "delete"; id: number; title: string };

export function SurveyList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);

  // High-level facade hook - simplified API
  const {
    surveys,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    error,
  } = useSurveyManager({ pageIndex, pageSize });

  const totalPages = pagination.totalPages;
  const totalCount = pagination.totalCount;

  // Filter surveys
  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      (survey.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      survey.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || survey.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers using facade hook's simplified API
  const handleCreateSurvey = async (data: SurveyFormData) => {
    try {
      await createSurvey(data);
      setModalState({ type: "none" });
    } catch (error) {
      // Error handling done by mutation hook (toast)
    }
  };

  const handleUpdateSurvey = async (data: SurveyFormData) => {
    if (modalState.type !== "edit") return;
    try {
      await updateSurvey(modalState.survey.id, data as any);
      setModalState({ type: "none" });
    } catch (error) {
      // Error handling done by mutation hook (toast)
    }
  };

  const handleDeleteSurvey = async () => {
    if (modalState.type !== "delete") return;
    try {
      await deleteSurvey(modalState.id);
      setModalState({ type: "none" });
    } catch (error) {
      // Error handling done by mutation hook (toast)
    }
  };

  const getStatusBadge = (status: Survey["status"]) => {
    const styles = {
      Draft: "bg-neutral-100 text-neutral-700",
      Published: "bg-green-100 text-green-700",
      Archived: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
      >
        {status}
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
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Surveys Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00bae2]" />
            <p className="mt-3 text-sm text-neutral-600">Loading surveys...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600">Failed to load surveys</p>
            <p className="mt-1 text-xs text-neutral-500">{error?.message}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-neutral-200 bg-neutral-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Survey
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Status
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
                        <div className="font-medium text-neutral-900">{survey.title || "Untitled"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-neutral-600">{survey.code}</span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(survey.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/analyst-survey/${survey.id}`}
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
                              setModalState({ type: "delete", id: survey.id, title: survey.title || survey.code })
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
          </>
        )}
      </div>

      {filteredSurveys.length > 0 && (
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <div>
            Showing <span className="font-medium text-neutral-900">{filteredSurveys.length}</span>{" "}
            of <span className="font-medium text-neutral-900">{totalCount}</span> surveys
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              disabled={pageIndex === 1}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Previous
            </button>
            <span className="flex items-center px-3 text-sm">
              Page {pageIndex} of {totalPages}
            </span>
            <button
              onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
              disabled={pageIndex === totalPages}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <SurveyFormModal
        isOpen={modalState.type === "create" || modalState.type === "edit"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={modalState.type === "create" ? handleCreateSurvey : handleUpdateSurvey}
        initialData={modalState.type === "edit" ? modalState.survey : undefined}
        mode={modalState.type === "create" ? "create" : "edit"}
      />

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

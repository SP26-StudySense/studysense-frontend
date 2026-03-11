"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Eye, Edit, Trash2, X, Sparkles, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { ConfirmationModal } from "@/shared/ui";
import { useManagerRoadmaps } from "../api/queries";
import { useDeleteRoadmap, useCreateRoadmapGraph } from "../api/mutations";
import type { GetRoadmapsParams, NodeContent, RoadmapNode, RoadmapStatus } from "../api/types";

type ModalState = 
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'delete'; roadmapId: number; title: string }
  | { type: 'aiGenerate' };

// Roadmap Form Modal Component
function RoadmapFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; subjectId: number }) => void;
  isSubmitting?: boolean;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: 1, // TODO: Get from user's assigned subject
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-neutral-200 shadow-2xl">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 m-0">
              Create New Roadmap
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Roadmap Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="Enter roadmap title"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 min-h-[100px]"
              placeholder="Enter roadmap description"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Roadmap'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// AI Generate Modal Component
function AIGenerateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; subjectId: number }) => void;
  isSubmitting?: boolean;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: 1, // TODO: Get from user's assigned subject
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-neutral-200 shadow-2xl">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 m-0">
                Generate Roadmap with AI
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 border border-purple-100">
            <p className="text-sm text-purple-900">
              <strong>AI-Powered Generation:</strong> Our AI will create a comprehensive learning roadmap based on your inputs, including nodes, connections, and recommended resources.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Roadmap Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="e.g., Complete React Development Path"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Learning Goal (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 min-h-[100px]"
              placeholder="Describe what learners should achieve with this roadmap..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate with AI
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RoadmapListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetRoadmapsParams>({
    pageIndex: 1,
    pageSize: 6,
    q: '',
    version: undefined,
    isLatest: undefined,
  });
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  // React Query hooks
  const { data : result, isLoading, isError} = useManagerRoadmaps(filters);
  const createRoadmapMutation = useCreateRoadmapGraph();
  const deleteRoadmapMutation = useDeleteRoadmap();
  const roadmapsData = result?.roadmaps;
  const handleFilterChange = (newFilters: Partial<GetRoadmapsParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, pageIndex: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, pageIndex: newPage }));
  };

  const handleCreateRoadmap = (data: { title: string; description: string; subjectId: number }) => {
    // createRoadmapMutation.mutate(
    //   {
    //     roadmap: {
    //       subjectId: data.subjectId,
    //       title: data.title,
    //       description: data.description,
    //     },
    //     nodes: [], // Empty roadmap initially
    //     edges: [],
    //   },
    //   {
    //     onSuccess: () => {
    //       setModalState({ type: 'none' });
    //     },
    //   }
    // );
  };
  const handleAIGenerate = (data: { title: string; description: string; subjectId: number }) => {
    // TODO: Call AI generation API endpoint
    console.log("AI Generate:", data);
    // createRoadmapMutation.mutate(
    //   {
    //     roadmap: {
    //       subjectId: data.subjectId,
    //       title: data.title,
    //       description: data.description,
    //     },
    //     nodes: [], // Will be populated by AI
    //     edges: [],
    //   },
    //   {
    //     onSuccess: () => {
    //       setModalState({ type: 'none' });
    //     },
    //   }
    // );
  };

  const handleDeleteRoadmap = () => {
    if (modalState.type !== 'delete') return;
    
    deleteRoadmapMutation.mutate(
      { roadmapId: modalState.roadmapId },
      {
        onSuccess: () => {
          setModalState({ type: 'none' });
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#00bae2]" />
          <p className="text-sm text-neutral-500">Loading roadmaps...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-neutral-900">Failed to load roadmaps</h2>
          <p className="mt-1 text-sm text-neutral-500">Please try again later</p>
        </div>
      </div>
    );
  }

  const totalCount = roadmapsData?.totalCount || 0;
  const totalPages = roadmapsData?.totalPages || 0;
  const currentPage = roadmapsData?.pageIndex || 1;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">My Roadmaps</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {totalCount} roadmap{totalCount !== 1 ? 's' : ''} • Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push('/content-roadmaps/generate')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            AI Generate
          </button>
          <button
            onClick={() => setModalState({ type: 'create' })}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create Manual
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search roadmaps..."
            value={filters.q || ''}
            onChange={(e) => handleFilterChange({ q: e.target.value })}
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filters.version || ''}
            onChange={(e) => handleFilterChange({ version: e.target.value ? Number(e.target.value) : undefined })}
            className="h-10 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
          >
            <option value="">All Versions</option>
            <option value="1">Version 1</option>
            <option value="2">Version 2</option>
            <option value="3">Version 3</option>
          </select>

          <select
            value={filters.isLatest === undefined ? '' : filters.isLatest.toString()}
            onChange={(e) => handleFilterChange({ isLatest: e.target.value === '' ? undefined : e.target.value === 'true' })}
            className="h-10 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
          >
            <option value="">All</option>
            <option value="true">Latest Only</option>
            <option value="false">Old Versions</option>
          </select>
        </div>
      </div>

      {/* Roadmaps Grid */}
      {roadmapsData?.items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <p className="text-neutral-600">No roadmaps found. Create your first roadmap!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roadmapsData?.items.map((roadmap) => (
            <div
              key={roadmap.id}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
            >
              {/* Status & Version Badge */}
              <div className="absolute right-4 top-4 flex gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    roadmap.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : roadmap.status === 'Draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {roadmap.status}
                </span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                  v{roadmap.version}
                </span>
              </div>

              {/* Content */}
              <div className="mb-4 mt-6">
                <h3 className="mb-2 text-lg font-bold text-neutral-900 group-hover:text-[#00bae2] transition-colors">
                  {roadmap.title}
                </h3>
                <p className="line-clamp-2 text-sm text-neutral-600">
                  {roadmap.description || 'No description'}
                </p>
              </div>

              {/* Stats */}
              <div className="mb-4 flex items-center gap-4 text-xs text-neutral-500">
                <div>Created at {new Date(roadmap.createdAt).toLocaleDateString()}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/content-roadmaps/${roadmap.id}`}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-center text-xs font-medium text-neutral-700 transition-all hover:bg-neutral-50"
                >
                  <Eye className="inline h-3.5 w-3.5 mr-1" />
                  View
                </Link>
                <button
                  onClick={() => setModalState({ type: 'delete', roadmapId: roadmap.id, title: roadmap.title })}
                  className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition-all hover:bg-red-50"
                  disabled={deleteRoadmapMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
                  currentPage === i
                    ? 'bg-gradient-to-r from-[#fec5fb] to-[#00bae2] text-neutral-900'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modals */}
      <RoadmapFormModal
        isOpen={modalState.type === 'create'}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={handleCreateRoadmap}
        isSubmitting={createRoadmapMutation.isPending}
      />

      <AIGenerateModal
        isOpen={modalState.type === 'aiGenerate'}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={handleAIGenerate}
        isSubmitting={createRoadmapMutation.isPending}
      />

      <ConfirmationModal
        isOpen={modalState.type === 'delete'}
        onClose={() => setModalState({ type: 'none' })}
        onConfirm={handleDeleteRoadmap}
        title="Delete Roadmap"
        description={`Are you sure you want to delete "${modalState.type === 'delete' ? modalState.title : ''}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

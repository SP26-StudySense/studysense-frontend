"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, Plus, Eye, Trash2, X, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ConfirmationModal } from "@/shared/ui";
import { ApiException } from "@/shared/api/errors";
import { toast } from "@/shared/lib";
import { formatDateInUserTimeZone } from "@/shared/lib/date-time";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ContentManagerLoading } from "../components";
import { useManagerRoadmaps, useSubjectsByContentManager } from "../api/queries";
import { useDeleteRoadmap, useCreateRoadmap, useUpdateRoadmap } from "../api/mutations";
import { RoadmapStatus, type GetManagerRoadmapsParams, type LearningSubject } from "../api/types";

type ModalState = 
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'delete'; roadmapId: number; title: string }
  | { type: 'publish'; roadmapId: number; title: string; description: string }
  | { type: 'disable'; roadmapId: number; title: string }
  | { type: 'aiGenerate' };

// Roadmap Form Modal Component
function RoadmapFormModal({
  isOpen,
  onClose,
  onSubmit,
  subjects,
  isSubjectsLoading,
  isSubjectsError,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; subjectId: number }) => void;
  subjects: LearningSubject[];
  isSubjectsLoading?: boolean;
  isSubjectsError?: boolean;
  isSubmitting?: boolean;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: 0,
  });

  useEffect(() => {
    if (!isOpen) return;

    setFormData((prev) => ({
      ...prev,
      subjectId: prev.subjectId || subjects[0]?.id || 1,
    }));
  }, [isOpen, subjects]);

  useEffect(() => {
    if (isOpen) return;

    setFormData({
      title: '',
      description: '',
      subjectId: subjects[0]?.id || 1,
    });
  }, [isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subjectId) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  if (typeof document === "undefined") return null;

  return createPortal(
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
              Subject <span className="text-red-500">*</span>
            </label>
            {subjects.length > 0 ? (
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
                disabled={isSubmitting || isSubjectsLoading}
                required
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input
                  type="number"
                  min={1}
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
                  placeholder="Enter subject id"
                  required
                  disabled={isSubmitting || isSubjectsLoading}
                />
                {isSubjectsError && (
                  <p className="mt-2 text-xs text-amber-600">
                    Failed to load assigned subjects. You can still create roadmap by entering subject ID manually.
                  </p>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Roadmap Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
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
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 min-h-[100px] disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
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
              disabled={isSubmitting || isSubjectsLoading}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Creating...
                </span>
              ) : (
                'Create Roadmap'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
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
    subjectId: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  if (typeof document === "undefined") return null;

  return createPortal(
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
                  <LoadingSpinner size="sm" />
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
    </div>,
    document.body
  );
}

function PublishRoadmapModal({
  isOpen,
  initialTitle,
  initialDescription,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  initialTitle: string;
  initialDescription: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialDescription, initialTitle, isOpen]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-neutral-200 shadow-2xl">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 m-0">Publish Roadmap</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
        </div>

        <form
          className="p-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !description.trim()) return;
            onSubmit({ title: title.trim(), description: description.trim() });
          }}
        >
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="Roadmap title"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 min-h-[100px]"
              placeholder="Roadmap description"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-2">
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
              disabled={isSubmitting || !title.trim() || !description.trim()}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Publishing...
                </span>
              ) : (
                'Publish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export function RoadmapListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetManagerRoadmapsParams>({
    pageIndex: 1,
    pageSize: 6,
    keyword: '',
    subjectId: undefined,
    status: undefined,
  });
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  // React Query hooks
  const { data : result, isLoading, isFetching, isError, refetch } = useManagerRoadmaps(filters);
  const {
    data: managerSubjectsResult,
    isLoading: isSubjectsLoading,
    isError: isSubjectsError,
  } = useSubjectsByContentManager({
    retry: false,
  });
  const createRoadmapMutation = useCreateRoadmap();
  const updateRoadmapMutation = useUpdateRoadmap();
  const deleteRoadmapMutation = useDeleteRoadmap();
  const managerSubjects = managerSubjectsResult?.subjects ?? [];
  const roadmapsData = result?.roadmaps;

  useEffect(() => {
    if (!isSubjectsError) return;
    toast.warning("Cannot load assigned subjects right now. Please input Subject ID manually.");
  }, [isSubjectsError]);

  const handleFilterChange = (newFilters: Partial<GetManagerRoadmapsParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, pageIndex: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setFilters((prev) => ({ ...prev, pageIndex: newPage }));
  };

  const handleCreateRoadmap = (data: { title: string; description: string; subjectId: number }) => {
    createRoadmapMutation.mutate({ ...data, status: RoadmapStatus.Draft }, {
      onSuccess: () => {
        setModalState({ type: 'none' });
        toast.success("Roadmap created successfully.");
        refetch();
      },
      onError: (error) => {
        toast.apiError(error, "Failed to create roadmap");
      },
    });
  };
  const handleAIGenerate = (data: { title: string; description: string; subjectId: number }) => {
    // Placeholder: list page currently routes to dedicated AI generation screen.
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

  const handlePublishRoadmap = (data: { title: string; description: string }) => {
    if (modalState.type !== 'publish') return;

    updateRoadmapMutation.mutate(
      {
        id: modalState.roadmapId,
        title: data.title,
        description: data.description,
        status: RoadmapStatus.Active,
      },
      {
        onSuccess: () => {
          setModalState({ type: 'none' });
          toast.success('Roadmap published successfully.');
          refetch();
        },
        onError: (error) => {
          toast.apiError(error, 'Failed to publish roadmap');
        },
      }
    );
  };

  const handleDisableRoadmap = () => {
    if (modalState.type !== 'disable') return;

    updateRoadmapMutation.mutate(
      {
        id: modalState.roadmapId,
        status: RoadmapStatus.Disabled,
      },
      {
        onSuccess: () => {
          setModalState({ type: 'none' });
          toast.success('Roadmap disabled successfully.');
          refetch();
        },
        onError: (error) => {
          toast.apiError(error, 'Failed to disable roadmap');
        },
      }
    );
  };

  const handleDeleteRoadmap = () => {
    if (modalState.type !== 'delete') return;
    
    deleteRoadmapMutation.mutate(
      { roadmapId: modalState.roadmapId },
      {
        onSuccess: () => {
          setModalState({ type: 'none' });
          toast.success("Roadmap deleted successfully.");
          refetch();
        },
        onError: (error) => {
          if (error instanceof ApiException && error.status === 404) {
            setModalState({ type: 'none' });
            toast.info("Roadmap does not exist or was already deleted.");
            refetch();
            return;
          }
          toast.apiError(error, "Failed to delete roadmap");
        },
      }
    );
  };

  const totalCount = roadmapsData?.totalCount || 0;
  const totalPages = roadmapsData?.totalPages || 1;
  const currentPage = roadmapsData?.pageIndex || 1;

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

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

  const getStatusLabel = (status: number | string) => {
    if (typeof status === "string") {
      return status;
    }

    switch (status) {
      case 0:
        return RoadmapStatus.Draft;
      case 1:
        return RoadmapStatus.Active;
      case 2:
        return RoadmapStatus.Disabled;
      default:
        return "Unknown";
    }
  };

  const getStatusBadgeClassName = (status: number | string) => {
    const normalized = getStatusLabel(status);
    if (normalized === RoadmapStatus.Active) return "bg-green-100 text-green-700";
    if (normalized === RoadmapStatus.Draft) return "bg-yellow-100 text-yellow-700";
    if (normalized === RoadmapStatus.Disabled) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:items-start sm:justify-between lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">My Roadmaps</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {totalCount} roadmap{totalCount !== 1 ? 's' : ''} • Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push('/content-roadmaps/generate')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            AI Generate
          </button>
          <button
            onClick={() => setModalState({ type: 'create' })}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create Manual
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <div className="relative w-full sm:w-[420px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search roadmaps..."
            value={filters.keyword || ''}
            onChange={(e) => handleFilterChange({ keyword: e.target.value })}
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
          />
        </div>

        <div className="flex gap-2">
            <select
              value={filters.subjectId ?? ''}
              onChange={(e) => handleFilterChange({ subjectId: e.target.value ? Number(e.target.value) : undefined })}
              className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
            >
              <option value="">All Subjects</option>
              {managerSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange({ status: (e.target.value || undefined) as RoadmapStatus | undefined })}
            className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
          >
            <option value="">All Status</option>
            <option value={RoadmapStatus.Draft}>Draft</option>
            <option value={RoadmapStatus.Active}>Active</option>
              <option value={RoadmapStatus.Disabled}>Disabled</option>
          </select>
        </div>
      </div>

      {/* Roadmaps Grid */}
      {isLoading && !roadmapsData ? (
        <ContentManagerLoading
          variant="section"
          size="lg"
          className="rounded-2xl"
        />
      ) : roadmapsData?.items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <p className="text-neutral-600">No roadmaps found. Create your first roadmap!</p>
        </div>
      ) : (
        <div className="relative">
          {isFetching && roadmapsData && (
            <ContentManagerLoading
              variant="overlay"
              size="lg"
              className="rounded-2xl"
            />
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roadmapsData?.items.map((roadmap) => {
              const normalizedStatus = getStatusLabel(roadmap.status);

              return (
              <div
                key={roadmap.id}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
              >
              {/* Status & Version Badge */}
              <div className="absolute right-4 top-4 flex gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClassName(roadmap.status)}`}
                >
                  {normalizedStatus}
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
                <div>Created at {formatDateInUserTimeZone(roadmap.createdAt)}</div>
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

                {normalizedStatus === RoadmapStatus.Draft && (
                  <button
                    onClick={() => setModalState({
                      type: 'publish',
                      roadmapId: roadmap.id,
                      title: roadmap.title,
                      description: roadmap.description || '',
                    })}
                    className="rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-medium text-green-700 transition-all hover:bg-green-50"
                    disabled={updateRoadmapMutation.isPending}
                  >
                    Publish
                  </button>
                )}

                {normalizedStatus === RoadmapStatus.Active && (
                  <button
                    onClick={() => setModalState({ type: 'disable', roadmapId: roadmap.id, title: roadmap.title })}
                    className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-medium text-orange-700 transition-all hover:bg-orange-50"
                    disabled={updateRoadmapMutation.isPending}
                  >
                    Disable
                  </button>
                )}
              </div>
              </div>
            );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
                  currentPage === pageNumber
                    ? 'bg-gradient-to-r from-[#fec5fb] to-[#00bae2] text-neutral-900'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
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
        subjects={managerSubjects}
        isSubjectsLoading={isSubjectsLoading}
        isSubjectsError={isSubjectsError}
        isSubmitting={createRoadmapMutation.isPending}
      />

      <AIGenerateModal
        isOpen={modalState.type === 'aiGenerate'}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={handleAIGenerate}
        isSubmitting={createRoadmapMutation.isPending}
      />

      <PublishRoadmapModal
        isOpen={modalState.type === 'publish'}
        initialTitle={modalState.type === 'publish' ? modalState.title : ''}
        initialDescription={modalState.type === 'publish' ? modalState.description : ''}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={handlePublishRoadmap}
        isSubmitting={updateRoadmapMutation.isPending}
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

      <ConfirmationModal
        isOpen={modalState.type === 'disable'}
        onClose={() => setModalState({ type: 'none' })}
        onConfirm={handleDisableRoadmap}
        title="Disable Roadmap"
        description={`Are you sure you want to disable "${modalState.type === 'disable' ? modalState.title : ''}"?`}
        confirmText="Disable"
        variant="default"
      />
    </div>
  );
}

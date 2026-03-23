"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Save,
  X,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Edit2,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Link2,
  CircleDot,
} from "lucide-react";
import { CMSRoadmapGraph } from "../components/CMSRoadmapGraph";
import { useRoadmapDetail, useNodeContents, useQuizzesByNode } from "../api/queries";
import { useCreateQuiz, useDeleteQuiz, useSyncRoadmapGraph } from "../api/mutations";
import { toast } from "@/shared/lib";
import type {
  RoadmapDetail,
  RoadmapNode,
  RoadmapEdge,
  RoadmapMetadata,
  NodeContent,
  NodeDifficulty,
  EdgeType,
  ContentType,
} from "../api/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNodeKey(node: RoadmapNode): string {
  return node.id != null ? String(node.id) : node.clientId!;
}

function resolveEdgeEndKey(side: "from" | "to", edge: RoadmapEdge): string | null {
  if (side === "from") {
    if (edge.fromNodeId != null) return String(edge.fromNodeId);
    return edge.fromNodeClientId ?? null;
  }
  if (edge.toNodeId != null) return String(edge.toNodeId);
  return edge.toNodeClientId ?? null;
}

const DIFFICULTY_OPTIONS= ["Beginner", "Intermediate", "Advanced"];
const EDGE_TYPE_OPTIONS= ["Prerequisite", "Recommended", "Next"];
const CONTENT_TYPE_OPTIONS = [
  "Video", "Article", "Book", "Course", "Exercise", "Quiz", "Project",
];

const EDGE_TYPE_STYLES: Record<EdgeType, string> = {
  Prerequisite: "bg-red-100 text-red-700",
  Recommended: "bg-amber-100 text-amber-700",
  Next: "bg-blue-100 text-blue-700",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
};

// ─── NodeDetailSection ────────────────────────────────────────────────────────

interface NodeDetailSectionProps {
  node: RoadmapNode;
  roadmapId: number;
  onUpdate: (updates: Partial<RoadmapNode>) => void;
  onDeleteNode: () => void;
  onContentsLoaded?: (nodeId: number) => void;
}

function NodeDetailSection({
  node,
  roadmapId,
  onUpdate,
  onDeleteNode,
  onContentsLoaded,
}: NodeDetailSectionProps) {
  const router = useRouter();
  const nodeId = typeof node.id === "number" ? node.id : null;
  const createQuizMutation = useCreateQuiz();
  const deleteQuizMutation = useDeleteQuiz();

  // Fetch quizzes for this node (only persisted nodes)
  const {
    data: quizzesData,
    isLoading: isLoadingQuizzes,
  } = useQuizzesByNode(nodeId ?? 0, 1, 10, { enabled: !!nodeId });

  // Fetch contents from API (only for persisted nodes)
  const { data: apiContents, isLoading: isLoadingContents } = useNodeContents(
    roadmapId,
    nodeId ?? 0,
    { enabled: !!(roadmapId && nodeId) }
  );

  // Track if we've already merged API contents into local state for this node
  const mergedForNodeIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (apiContents && nodeId && mergedForNodeIdRef.current !== nodeId) {
      mergedForNodeIdRef.current = nodeId;
      onContentsLoaded?.(nodeId);
      // Preserve any unsaved (id=null) local contents, merge with API data
      const localOnly = (node.contents ?? []).filter((c) => c.id === null);
      onUpdate({ contents: [...apiContents, ...localOnly] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiContents, nodeId]);

  // Basic info editing
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [basicInfoForm, setBasicInfoForm] = useState({
    title: node.title,
    description: node.description,
    difficulty: node.difficulty,
    estimatedHours: node.estimatedHours,
  });
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: `${node.title} Quiz`,
    description: "",
    totalScore: 10,
    level: "Beginner",
    passingScore: 5,
  });
  const [deletingQuizId, setDeletingQuizId] = useState<number | null>(null);

  // When the node changes (different node selected), reset form
  const prevNodeKeyRef = useRef(getNodeKey(node));
  const currentKey = getNodeKey(node);
  if (prevNodeKeyRef.current !== currentKey) {
    prevNodeKeyRef.current = currentKey;
    setIsEditingBasicInfo(false);
    setBasicInfoForm({
      title: node.title,
      description: node.description,
      difficulty: node.difficulty,
      estimatedHours: node.estimatedHours,
    });
    setIsCreateQuizOpen(false);
    setQuizForm({
      title: `${node.title} Quiz`,
      description: "",
      totalScore: 10,
      level: "Beginner",
      passingScore: 5,
    });
  }

  const handleOpenCreateQuiz = () => {
    if (!nodeId) {
      toast.warning("Please save roadmap first", {
        description: "Create quiz is available for persisted nodes only.",
      });
      return;
    }
    setQuizForm({
      title: `${node.title} Quiz`,
      description: "",
      totalScore: 10,
      level: "Beginner",
      passingScore: 5,
    });
    setIsCreateQuizOpen(true);
  };

  const handleSubmitCreateQuiz = async () => {
    if (!nodeId) return;
    try {
      await createQuizMutation.mutateAsync({
        createQuizNode: {
          roadmapNodeId: nodeId,
          title: quizForm.title.trim() || null,
          description: quizForm.description.trim() || null,
          totalScore:
            Number.isFinite(quizForm.totalScore) && quizForm.totalScore > 0
              ? quizForm.totalScore
              : null,
          level: quizForm.level || "Beginner",
          passingScore:
            Number.isFinite(quizForm.passingScore) && quizForm.passingScore > 0
              ? quizForm.passingScore
              : 1,
        },
      });
      toast.success("Quiz created successfully");
      setIsCreateQuizOpen(false);
    } catch {
      toast.error("Failed to create quiz", {
        description: "Please check input and try again.",
      });
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!nodeId) return;
    const confirmed = window.confirm("Are you sure you want to delete this quiz?");
    if (!confirmed) return;

    setDeletingQuizId(quizId);
    try {
      await deleteQuizMutation.mutateAsync({
        quizId,
        roadmapNodeId: nodeId,
      });
      toast.success("Quiz deleted successfully");
    } catch {
      toast.error("Failed to delete quiz", {
        description: "Please try again.",
      });
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleSaveBasicInfo = () => {
    onUpdate(basicInfoForm);
    setIsEditingBasicInfo(false);
  };

  const handleCancelBasicInfo = () => {
    setBasicInfoForm({
      title: node.title,
      description: node.description,
      difficulty: node.difficulty,
      estimatedHours: node.estimatedHours,
    });
    setIsEditingBasicInfo(false);
  };

  // Contents editing
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [contentForm, setContentForm] = useState<Partial<NodeContent>>({
    contentType: "Video" as ContentType,
    title: "",
    description: "",
    url: "",
    duration: 0,
    isRequired: true,
  });

  // Per-content edit state
  const [editingContentId, setEditingContentId] = useState<number | string | null>(null);
  const [editContentForm, setEditContentForm] = useState<Partial<NodeContent>>({});

  const contents = node.contents ?? [];

  const handleAddContent = () => {
    if (!contentForm.title || !contentForm.url) return;
    const newContent: NodeContent = {
      id: null,
      clientId: `temp-content-${Date.now()}-${Math.random()}`,
      nodeId: nodeId ?? undefined,
      contentType: contentForm.contentType!,
      title: contentForm.title!,
      description: contentForm.description ?? "",
      url: contentForm.url!,
      duration: contentForm.duration,
      orderNo: contents.length,
      isRequired: contentForm.isRequired!,
    };
    onUpdate({ contents: [...contents, newContent] });
    setContentForm({
      contentType: "Video" as ContentType,
      title: "",
      description: "",
      url: "",
      duration: 0,
      isRequired: true,
    });
    setIsAddingContent(false);
  };

  const handleDeleteContent = (contentId: number | string) => {
    const updated = contents.filter((c) => {
      const cId = c.id ?? c.clientId;
      return cId !== contentId;
    });
    onUpdate({ contents: updated });
  };

  const handleStartEditContent = (content: NodeContent) => {
    const cId = content.id ?? content.clientId!;
    setEditingContentId(cId);
    setEditContentForm({ ...content });
  };

  const handleCancelEditContent = () => {
    setEditingContentId(null);
    setEditContentForm({});
  };

  const handleSaveEditContent = () => {
    if (!editingContentId) return;
    const updated = contents.map((c) => {
      const cId = c.id ?? c.clientId!;
      if (cId !== editingContentId) return c;
      return { ...c, ...editContentForm } as NodeContent;
    });
    onUpdate({ contents: updated });
    setEditingContentId(null);
    setEditContentForm({});
  };

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleDot className="h-5 w-5 text-[#00bae2]" />
          <h3 className="text-base font-bold text-neutral-900">
            Node Detail
          </h3>
          <span className="text-sm text-neutral-500">— {node.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateQuiz}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {createQuizMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Create Quiz
          </button>
          <button
            onClick={onDeleteNode}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Node
          </button>
        </div>
      </div>

      {isCreateQuizOpen && (
        <div className="rounded-xl border border-[#00bae2]/20 bg-[#00bae2]/5 p-4 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-neutral-900">Create Quiz</h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Create a quiz for this roadmap node.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={quizForm.title}
                onChange={(e) =>
                  setQuizForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                placeholder="Quiz title"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Description
              </label>
              <textarea
                value={quizForm.description}
                onChange={(e) =>
                  setQuizForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10 min-h-[80px]"
                placeholder="Quiz description"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Total Score
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={quizForm.totalScore}
                onChange={(e) =>
                  setQuizForm((prev) => ({
                    ...prev,
                    totalScore: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Level
              </label>
              <select
                value={quizForm.level}
                onChange={(e) =>
                  setQuizForm((prev) => ({
                    ...prev,
                    level: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Passing Score
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={quizForm.passingScore}
                onChange={(e) =>
                  setQuizForm((prev) => ({
                    ...prev,
                    passingScore: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreateQuizOpen(false)}
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitCreateQuiz}
              disabled={createQuizMutation.isPending}
              className="flex-1 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              {createQuizMutation.isPending ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-neutral-900">Basic Information</h4>
          {!isEditingBasicInfo && (
            <button
              onClick={() => setIsEditingBasicInfo(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#00bae2] hover:bg-[#00bae2]/5 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
        </div>

        {isEditingBasicInfo ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={basicInfoForm.title}
                onChange={(e) =>
                  setBasicInfoForm({ ...basicInfoForm, title: e.target.value })
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all"
                placeholder="Node title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Description
              </label>
              <textarea
                value={basicInfoForm.description}
                onChange={(e) =>
                  setBasicInfoForm({
                    ...basicInfoForm,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all min-h-[80px]"
                placeholder="Describe what learners will achieve"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Difficulty
                </label>
                <select
                  value={basicInfoForm.difficulty}
                  onChange={(e) =>
                    setBasicInfoForm({
                      ...basicInfoForm,
                      difficulty: e.target.value as NodeDifficulty,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all"
                >
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={basicInfoForm.estimatedHours}
                  onChange={(e) =>
                    setBasicInfoForm({
                      ...basicInfoForm,
                      estimatedHours: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCancelBasicInfo}
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <X className="inline h-4 w-4 mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSaveBasicInfo}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
              >
                <Check className="inline h-4 w-4 mr-1" />
                Apply
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-0.5">Title</p>
                <p className="text-sm text-neutral-900 font-medium">{node.title}</p>
              </div>
              <div className="flex gap-3">
                <div>
                  <p className="text-xs font-medium text-neutral-500 mb-0.5">Difficulty</p>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      DIFFICULTY_STYLES[node.difficulty] ??
                      "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {node.difficulty}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 mb-0.5">Hours</p>
                  <p className="text-sm text-neutral-900">{node.estimatedHours}h</p>
                </div>
              </div>
            </div>
            {node.description && (
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-0.5">Description</p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {node.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Learning Contents */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-neutral-900">
            Learning Contents
            <span className="ml-2 text-xs font-normal text-neutral-500">
              ({contents.length})
            </span>
          </h4>
          <button
            onClick={() => setIsAddingContent(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Content
          </button>
        </div>

        {isLoadingContents && nodeId && (
          <div className="flex items-center gap-2 py-4 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#00bae2]" />
            Loading contents from server...
          </div>
        )}

        {/* Add Content Form */}
        {isAddingContent && (
          <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Type
                </label>
                <select
                  value={contentForm.contentType}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      contentType: e.target.value as ContentType,
                    })
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                >
                  {CONTENT_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contentForm.title}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                  placeholder="Content title"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={contentForm.url}
                onChange={(e) =>
                  setContentForm({ ...contentForm, url: e.target.value })
                }
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={contentForm.description}
                onChange={(e) =>
                  setContentForm({ ...contentForm, description: e.target.value })
                }
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                placeholder="Brief description"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Duration (min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={contentForm.duration ?? 0}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      duration: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                />
              </div>
              <label className="flex items-center gap-2 pb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contentForm.isRequired}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, isRequired: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-[#00bae2]"
                />
                <span className="text-sm text-neutral-700">Required</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddingContent(false)}
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContent}
                disabled={!contentForm.title || !contentForm.url}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Content
              </button>
            </div>
          </div>
        )}

        {/* Contents List */}
        {!isLoadingContents && contents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center">
            <p className="text-sm text-neutral-500">No learning contents yet</p>
            <button
              onClick={() => setIsAddingContent(true)}
              className="mt-1.5 text-sm text-[#00bae2] hover:underline"
            >
              Add your first content
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {contents.map((content) => {
              const cId = content.id ?? content.clientId!;
              const isEditing = editingContentId === cId;
              // A content is "unsaved" if it is new (id=null) OR if it was
              // loaded from the server but its fields differ from the server copy.
              const isUnsaved =
                content.id == null ||
                (apiContents != null &&
                  apiContents.some(
                    (orig) =>
                      orig.id === content.id &&
                      (orig.title !== content.title ||
                        orig.description !== content.description ||
                        orig.url !== content.url ||
                        orig.contentType !== content.contentType ||
                        orig.duration !== content.duration ||
                        orig.estimatedMinutes !== content.estimatedMinutes ||
                        orig.isRequired !== content.isRequired)
                  ));

              if (isEditing) {
                return (
                  <div
                    key={cId}
                    className="rounded-xl border-2 border-[#00bae2]/40 bg-[#00bae2]/5 p-4 space-y-3"
                  >
                    <p className="text-xs font-semibold text-[#00bae2]">Editing content</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">Type</label>
                        <select
                          value={editContentForm.contentType}
                          onChange={(e) => setEditContentForm({ ...editContentForm, contentType: e.target.value as ContentType })}
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                        >
                          {CONTENT_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">Title <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={editContentForm.title ?? ""}
                          onChange={(e) => setEditContentForm({ ...editContentForm, title: e.target.value })}
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">URL <span className="text-red-500">*</span></label>
                      <input
                        type="url"
                        value={editContentForm.url ?? ""}
                        onChange={(e) => setEditContentForm({ ...editContentForm, url: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={editContentForm.description ?? ""}
                        onChange={(e) => setEditContentForm({ ...editContentForm, description: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                      />
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-neutral-700 mb-1">Duration (min)</label>
                        <input
                          type="number"
                          min="0"
                          value={editContentForm.duration ?? 0}
                          onChange={(e) => setEditContentForm({ ...editContentForm, duration: Number(e.target.value) })}
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-neutral-700 mb-1">Est. Minutes</label>
                        <input
                          type="number"
                          min="0"
                          value={editContentForm.estimatedMinutes ?? 0}
                          onChange={(e) => setEditContentForm({ ...editContentForm, estimatedMinutes: Number(e.target.value) })}
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                        />
                      </div>
                      <label className="flex items-center gap-2 pb-2 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={editContentForm.isRequired ?? false}
                          onChange={(e) => setEditContentForm({ ...editContentForm, isRequired: e.target.checked })}
                          className="h-4 w-4 rounded border-neutral-300"
                        />
                        <span className="text-sm text-neutral-700">Required</span>
                      </label>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleCancelEditContent}
                        className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEditContent}
                        disabled={!editContentForm.title || !editContentForm.url}
                        className="flex-1 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-2 text-xs font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="inline h-3.5 w-3.5 mr-1" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={cId}
                  className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors group"
                >
                  {/* Badges row */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                      {content.contentType}
                    </span>
                    {content.isRequired && (
                      <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                        Required
                      </span>
                    )}
                    {isUnsaved && (
                      <span className="rounded-md bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                        Unsaved
                      </span>
                    )}
                    {/* Action buttons — visible on hover */}
                    <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleStartEditContent(content)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#00bae2] hover:bg-[#00bae2]/5 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteContent(cId)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Content title */}
                  <p className="text-sm font-semibold text-neutral-900">
                    {content.title}
                  </p>

                  {/* Description */}
                  {content.description && (
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      {content.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {content.duration != null && content.duration > 0 && (
                      <span className="text-[11px] text-neutral-400">
                        Duration: {content.duration} min
                      </span>
                    )}
                    {content.estimatedMinutes != null && content.estimatedMinutes > 0 && (
                      <span className="text-[11px] text-neutral-400">
                        Est: {content.estimatedMinutes} min
                      </span>
                    )}
                    {content.url && (
                      <a
                        href={content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[11px] text-[#00bae2] hover:underline ml-auto"
                      >
                        Open Resource
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quizzes */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-neutral-900">
            Quizzes
            {quizzesData && (
              <span className="ml-2 text-xs font-normal text-neutral-500">
                ({quizzesData.totalCount})
              </span>
            )}
          </h4>
          <button
            onClick={handleOpenCreateQuiz}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Quiz
          </button>
        </div>

        {isLoadingQuizzes && nodeId && (
          <div className="flex items-center gap-2 py-4 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#00bae2]" />
            Loading quizzes...
          </div>
        )}

        {!isLoadingQuizzes && (!quizzesData?.items?.length) ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center">
            <p className="text-sm text-neutral-500">No quizzes yet</p>
            <button
              onClick={handleOpenCreateQuiz}
              className="mt-1.5 text-sm text-[#00bae2] hover:underline"
            >
              Create the first quiz
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {quizzesData?.items.map((quiz) => (
              <div
                key={quiz.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="rounded-md bg-[#00bae2]/10 px-2 py-0.5 text-[10px] font-medium text-[#00bae2]">
                    Quiz
                  </span>
                  {quiz.level && (
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      {quiz.level}
                    </span>
                  )}
                  {quiz.totalScore != null && (
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                      {quiz.totalScore} pts
                    </span>
                  )}
                  {quiz.passingScore != null && (
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      Pass: {quiz.passingScore}
                    </span>
                  )}
                  <button
                    onClick={() =>
                      router.push(
                        `/content-roadmaps/quizzes/${quiz.id}?roadmapId=${roadmapId}&roadmapNodeId=${quiz.roadmapNodeId}`
                      )
                    }
                    className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#00bae2] hover:bg-[#00bae2]/5 transition-colors"
                  >
                    View Detail
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    disabled={deletingQuizId === quiz.id || deleteQuizMutation.isPending}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingQuizId === quiz.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Delete
                  </button>
                </div>
                <p className="text-sm font-semibold text-neutral-900">
                  {quiz.title ?? "Untitled Quiz"}
                </p>
                {quiz.description && (
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {quiz.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ConnectorPanel ───────────────────────────────────────────────────────────

interface ConnectorPanelProps {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  roadmapId: number;
  selectedNodeId: number | string | null;
  onAddEdge: (
    fromId: number | string,
    toId: number | string,
    edgeType: EdgeType
  ) => void;
  onDeleteEdge: (edgeId: number | string) => void;
}

function ConnectorPanel({
  nodes,
  edges,
  roadmapId,
  selectedNodeId,
  onAddEdge,
  onDeleteEdge,
}: ConnectorPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<{
    fromKey: string;
    toKey: string;
    edgeType: EdgeType;
  }>({
    fromKey: selectedNodeId != null ? String(selectedNodeId) : "",
    toKey: "",
    edgeType: "Next" as EdgeType,
  });

  // When selected node changes, update the form's "from" default
  useEffect(() => {
    if (selectedNodeId != null) {
      setForm((f) => ({ ...f, fromKey: String(selectedNodeId) }));
    }
  }, [selectedNodeId]);

  const selectedKey = selectedNodeId != null ? String(selectedNodeId) : null;

  const displayedEdges = selectedKey
    ? edges.filter((e) => {
        const fromKey = resolveEdgeEndKey("from", e);
        const toKey = resolveEdgeEndKey("to", e);
        return fromKey === selectedKey || toKey === selectedKey;
      })
    : edges;

  const getNodeName = (key: string | null) => {
    if (!key) return "Unknown";
    return (
      nodes.find((n) => getNodeKey(n) === key)?.title ?? `Node(${key})`
    );
  };

  const handleSubmit = () => {
    if (!form.fromKey || !form.toKey || form.fromKey === form.toKey) return;
    // Resolve from key back to numeric id or string clientId
    const fromNode = nodes.find((n) => getNodeKey(n) === form.fromKey);
    const toNode = nodes.find((n) => getNodeKey(n) === form.toKey);
    if (!fromNode || !toNode) return;

    const fromId = fromNode.id != null ? fromNode.id : fromNode.clientId!;
    const toId = toNode.id != null ? toNode.id : toNode.clientId!;
    onAddEdge(fromId, toId, form.edgeType);
    setIsAdding(false);
    setForm((f) => ({
      ...f,
      toKey: "",
      fromKey: selectedKey ?? "",
    }));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
            <Link2 className="h-4 w-4 text-[#00bae2]" />
            Connectors
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {selectedKey
              ? `Filtered: ${getNodeName(selectedKey)}`
              : `All edges (${edges.length})`}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {/* Add Edge Form */}
      {isAdding && (
        <div className="p-4 border-b border-neutral-100 space-y-3 bg-neutral-50">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              From Node
            </label>
            <select
              value={form.fromKey}
              onChange={(e) => setForm({ ...form, fromKey: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
            >
              <option value="">Select...</option>
              {nodes.map((n) => (
                <option key={getNodeKey(n)} value={getNodeKey(n)}>
                  {n.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              To Node
            </label>
            <select
              value={form.toKey}
              onChange={(e) => setForm({ ...form, toKey: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
            >
              <option value="">Select...</option>
              {nodes
                .filter((n) => getNodeKey(n) !== form.fromKey)
                .map((n) => (
                  <option key={getNodeKey(n)} value={getNodeKey(n)}>
                    {n.title}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Type
            </label>
            <select
              value={form.edgeType}
              onChange={(e) =>
                setForm({ ...form, edgeType: e.target.value as EdgeType })
              }
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
            >
              {EDGE_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.fromKey || !form.toKey}
              className="flex-1 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-2 text-xs font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Connector
            </button>
          </div>
        </div>
      )}

      {/* Edge list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {displayedEdges.length === 0 ? (
          <div className="py-10 text-center">
            <Link2 className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
            <p className="text-xs text-neutral-500">
              {selectedKey ? "No connectors for this node" : "No connectors yet"}
            </p>
          </div>
        ) : (
          displayedEdges.map((edge) => {
            const edgeId = edge.id ?? edge.clientId!;
            const fromKey = resolveEdgeEndKey("from", edge);
            const toKey = resolveEdgeEndKey("to", edge);

            return (
              <div
                key={edgeId}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 group hover:border-neutral-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-700 min-w-0">
                    <span className="truncate max-w-[90px] font-medium">
                      {getNodeName(fromKey)}
                    </span>
                    <span className="text-neutral-400 shrink-0">→</span>
                    <span className="truncate max-w-[90px] font-medium">
                      {getNodeName(toKey)}
                    </span>
                  </div>
                  <span
                    className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      EDGE_TYPE_STYLES[edge.edgeType] ??
                      "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {edge.edgeType}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteEdge(edgeId)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-all shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── RoadmapDetailPage ────────────────────────────────────────────────────────

function generateClientId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId = Number(params.id);

  // ── Data ──
  const {
    data: roadmapData,
    isLoading,
    error,
  } = useRoadmapDetail(roadmapId);
  const syncRoadmapMutation = useSyncRoadmapGraph();

  // ── Edit state ──
  const [editedData, setEditedData] = useState<RoadmapDetail | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── UI state ──
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [metadataForm, setMetadataForm] = useState({ title: "", description: "" });
  const [selectedNodeId, setSelectedNodeId] = useState<number | string | null>(null);

  // Track which nodes had their contents loaded from the API
  const loadedNodeIdsRef = useRef<Set<number>>(new Set());

  // Ref for the graph column — used to attach a native wheel listener so that
  // scrolling inside the graph editor zooms only the graph and does NOT scroll
  // the outer page.
  const graphColRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = graphColRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => { e.preventDefault(); };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Initialize edited data when roadmap loads
  useEffect(() => {
    if (roadmapData) {
      setEditedData(roadmapData);
    }
  }, [roadmapData]);

  // Sync metadata form when entering edit mode
  useEffect(() => {
    if (isEditingMetadata && editedData) {
      setMetadataForm({
        title: editedData.roadmap.title,
        description: (editedData.roadmap as RoadmapMetadata).description ?? "",
      });
    }
  }, [isEditingMetadata, editedData]);

  // ── Node helpers ──
  const updateNodes = useCallback(
    (nodes: RoadmapNode[]) => {
      if (!editedData) return;
      setEditedData({ ...editedData, nodes });
      setHasUnsavedChanges(true);
    },
    [editedData]
  );

  const updateEdges = useCallback(
    (edges: RoadmapEdge[]) => {
      if (!editedData) return;
      setEditedData({ ...editedData, edges });
      setHasUnsavedChanges(true);
    },
    [editedData]
  );

  const handleNodeUpdate = useCallback(
    (nodeId: number | string, updates: Partial<RoadmapNode>) => {
      if (!editedData) return;
      const newNodes = editedData.nodes.map((n) => {
        const key = getNodeKey(n);
        return key === String(nodeId) ? { ...n, ...updates } : n;
      });
      updateNodes(newNodes);
    },
    [editedData, updateNodes]
  );

  const handleAddNode = useCallback(() => {
    if (!editedData) return;
    const newNode: RoadmapNode = {
      id: null,
      clientId: generateClientId(),
      roadmapId,
      title: "New Node",
      description: "",
      difficulty: "Beginner" as NodeDifficulty,
      estimatedHours: 1,
      orderNo: editedData.nodes.length,
      contents: [],
    };
    const newNodes = [...editedData.nodes, newNode];
    updateNodes(newNodes);
    setSelectedNodeId(newNode.clientId!);
  }, [editedData, roadmapId, updateNodes]);

  const handleDeleteNode = useCallback(
    (nodeId: number | string) => {
      if (!editedData) return;
      const newNodes = editedData.nodes.filter(
        (n) => getNodeKey(n) !== String(nodeId)
      );
      const newEdges = editedData.edges.filter((e) => {
        const fromKey = resolveEdgeEndKey("from", e);
        const toKey = resolveEdgeEndKey("to", e);
        return fromKey !== String(nodeId) && toKey !== String(nodeId);
      });
      // Combine both updates in a single setEditedData call to avoid React
      // batching causing the second call to overwrite the first.
      setEditedData({ ...editedData, nodes: newNodes, edges: newEdges });
      setHasUnsavedChanges(true);
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
    },
    [editedData, selectedNodeId]
  );

  const handleAddEdge = useCallback(
    (fromId: number | string, toId: number | string, edgeType: EdgeType) => {
      if (!editedData) return;
      const newEdge: RoadmapEdge = {
        id: null,
        clientId: generateClientId(),
        roadmapId,
        fromNodeId: typeof fromId === "number" ? fromId : undefined,
        fromNodeClientId: typeof fromId === "string" ? fromId : undefined,
        toNodeId: typeof toId === "number" ? toId : undefined,
        toNodeClientId: typeof toId === "string" ? toId : undefined,
        edgeType,
        orderNo: editedData.edges.length,
      };
      updateEdges([...editedData.edges, newEdge]);
    },
    [editedData, roadmapId, updateEdges]
  );

  const handleDeleteEdge = useCallback(
    (edgeId: number | string) => {
      if (!editedData) return;
      const newEdges = editedData.edges.filter((e) => {
        const id = e.id ?? e.clientId!;
        return id !== edgeId;
      });
      updateEdges(newEdges);
    },
    [editedData, updateEdges]
  );

  // ── Metadata save/cancel ──
  const handleSaveMetadata = () => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      roadmap: { ...editedData.roadmap, ...metadataForm },
    });
    setHasUnsavedChanges(true);
    setIsEditingMetadata(false);
  };

  // ── Save all to server ──
  // Collect contents that are "changed" for the API payload:
  // - Contents from any node whose contents were API-loaded this session
  //   (covers edits, deletions, and new additions on those nodes)
  // - Contents from new (client-only) nodes that have locally-added entries
  // Nodes whose contents were never loaded are skipped entirely so that the
  // server does not delete their contents.
  const collectContents = (nodes: RoadmapNode[]): NodeContent[] => {
    const result: NodeContent[] = [];
    nodes.forEach((node) => {
      const nId = typeof node.id === "number" ? node.id : undefined;
      const nClientId = nId == null ? (node.clientId ?? undefined) : undefined;
      // Determine if this node's contents were touched in this session
      const wasLoaded = nId != null && loadedNodeIdsRef.current.has(nId);
      const hasContents = node.contents && node.contents.length > 0;
      // Skip nodes that were never visited AND have no local contents
      if (!hasContents && !wasLoaded) return;
      // If visited but all contents deleted — nothing to add to flat array
      // (the absence of this nodeId's contents in the payload signals deletion)
      if (!node.contents?.length) return;
      node.contents.forEach((c) => {
        result.push({
          ...c,
          nodeId: nId ?? c.nodeId,
          nodeClientId: nClientId ?? c.nodeClientId,
        });
      });
    });
    return result;
  };

  const handleSave = async () => {
    if (!editedData || !hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      // Strip nested contents from node objects and send them as a separate
      // flat array as required by the SyncRoadmapGraphRequest schema.
      const flatContents = collectContents(editedData.nodes);
      const nodesWithoutContents = editedData.nodes.map(
        ({ contents: _contents, ...rest }) => rest as RoadmapNode
      );

      await syncRoadmapMutation.mutateAsync({
        roadmapId,
        roadmap: {
          title: editedData.roadmap.title,
          description: (editedData.roadmap as RoadmapMetadata).description,
        },
        nodes: nodesWithoutContents,
        edges: editedData.edges,
        contents: flatContents,
      });
      setHasUnsavedChanges(false);
      toast.success("Roadmap saved successfully!", {
        description: "All changes have been synced.",
      });
    } catch {
      toast.error("Failed to save roadmap", {
        description: "Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (roadmapData) {
      setEditedData(roadmapData);
      setHasUnsavedChanges(false);
      setIsEditingMetadata(false);
      toast.info("Changes discarded", {
        description: "Reverted to the last saved version.",
      });
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    router.push("/content-roadmaps");
  };

  // Find selected node object
  const selectedNode = editedData?.nodes.find(
    (n) => getNodeKey(n) === String(selectedNodeId)
  );

  const roadmapMeta = editedData?.roadmap as RoadmapMetadata | undefined;

  // ── Loading / Error states ──
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00bae2]" />
          <p className="text-sm text-neutral-500">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Failed to load roadmap
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {error?.message ?? "Please try again later"}
          </p>
          <button
            onClick={handleBack}
            className="mt-4 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!editedData) return null;

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Roadmap Detail
            </h1>
            <p className="text-sm text-neutral-500">{editedData.roadmap.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <>
              <button
                onClick={handleDiscard}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Unsaved Changes Warning ── */}
      {hasUnsavedChanges && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0" />
            <p className="text-sm font-medium text-yellow-900">
              You have unsaved changes.{" "}
              <span className="font-normal text-yellow-700">
                Remember to save before leaving.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── Roadmap Information ── */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Roadmap Information
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Basic metadata about this roadmap
            </p>
          </div>
          {!isEditingMetadata && (
            <button
              onClick={() => setIsEditingMetadata(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[#00bae2] hover:bg-[#00bae2]/5 transition-colors border border-[#00bae2]/20"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>

        <div className="p-6">
          {isEditingMetadata ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={metadataForm.title}
                  onChange={(e) =>
                    setMetadataForm({ ...metadataForm, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all"
                  placeholder="Enter roadmap title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  value={metadataForm.description}
                  onChange={(e) =>
                    setMetadataForm({
                      ...metadataForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all min-h-[90px]"
                  placeholder="Describe this learning roadmap"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingMetadata(false)}
                  className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveMetadata}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
                >
                  <Check className="h-4 w-4" />
                  Apply
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">Title</p>
                <p className="text-sm font-semibold text-neutral-900">
                  {editedData.roadmap.title}
                </p>
              </div>
              <div className="sm:col-span-1 lg:col-span-2">
                <p className="text-xs font-medium text-neutral-500 mb-1">
                  Description
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {roadmapMeta?.description || (
                    <span className="text-neutral-400 italic">No description</span>
                  )}
                </p>
              </div>
              {roadmapMeta?.status && (
                <div>
                  <p className="text-xs font-medium text-neutral-500 mb-1">Status</p>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      roadmapMeta.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : roadmapMeta.status === "Draft"
                        ? "bg-neutral-100 text-neutral-600"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {roadmapMeta.status}
                  </span>
                </div>
              )}
              <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-6 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="font-medium text-neutral-700">
                    {editedData.nodes.length}
                  </span>{" "}
                  nodes
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="font-medium text-neutral-700">
                    {editedData.edges.length}
                  </span>{" "}
                  connectors
                </div>
                {roadmapMeta?.version != null && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    Version{" "}
                    <span className="font-medium text-neutral-700">
                      {roadmapMeta.version}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Graph Editor ── */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Graph Editor
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Visualize and manage nodes and connections
            </p>
          </div>
          <button
            onClick={handleAddNode}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Node
          </button>
        </div>

        <div className="grid grid-cols-5 h-[520px]">
          {/* Left: Graph */}
          <div ref={graphColRef} className="col-span-3 p-4 border-r border-neutral-100 h-full">
            <CMSRoadmapGraph
              nodes={editedData.nodes}
              edges={editedData.edges}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
              className="h-full"
            />
          </div>

          {/* Right: Connectors */}
          <div className="col-span-2 h-full overflow-hidden">
            <ConnectorPanel
              nodes={editedData.nodes}
              edges={editedData.edges}
              roadmapId={roadmapId}
              selectedNodeId={selectedNodeId}
              onAddEdge={handleAddEdge}
              onDeleteEdge={handleDeleteEdge}
            />
          </div>
        </div>
      </div>

      {/* ── Node Detail (below graph, visible when node selected) ── */}
      {selectedNode && (
        <div
          key={getNodeKey(selectedNode)}
          className="rounded-2xl border border-[#00bae2]/30 bg-white shadow-sm p-6 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <NodeDetailSection
            node={selectedNode}
            roadmapId={roadmapId}
            onUpdate={(updates) =>
              handleNodeUpdate(
                selectedNode.id ?? selectedNode.clientId!,
                updates
              )
            }
            onDeleteNode={() =>
              handleDeleteNode(selectedNode.id ?? selectedNode.clientId!)
            }
            onContentsLoaded={(nodeId) => {
              loadedNodeIdsRef.current.add(nodeId);
            }}
          />
        </div>
      )}

      {/* ── Empty state hint ── */}
      {!selectedNode && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <CircleDot className="mx-auto h-10 w-10 text-neutral-300 mb-3" />
          <p className="text-sm font-medium text-neutral-500">
            Click on a node in the graph to view and edit its details
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Node contents, basic information, and more will appear here
          </p>
        </div>
      )}
    </div>
  );
}

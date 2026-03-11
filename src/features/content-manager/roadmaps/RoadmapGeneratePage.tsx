"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/shared/lib";
import {
  ArrowLeft,
  BookOpen,
  CircleDot,
  Clock,
  Edit2,
  ExternalLink,
  Link as LinkIcon,
  Plus,
  Save,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CMSRoadmapGraph } from "../components/CMSRoadmapGraph";
import { useCreateRoadmapGraph } from "../api/mutations";
import { useGenerateRoadmapAI } from "../api/queries";
import type {
  RoadmapNode,
  RoadmapEdge,
  RoadmapDetail,
  NodeContent,
  EdgeType,
  NodeDifficulty,
  ContentType,
  RoadmapStatus,
  GenerateRoadmapRequest,
  AIRoadmapGraph,
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

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const EDGE_TYPE_OPTIONS = ["Prerequisite", "Recommended", "Next"];
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

// ─── Helper to convert AI data to RoadmapDetail ──────────────────────────────

function convertAIToRoadmapDetail(aiData: AIRoadmapGraph): RoadmapDetail {
  // Convert AI nodes to RoadmapNode format
  const nodes: RoadmapNode[] = aiData.nodes.map((aiNode) => ({
    id: null,
    clientId: aiNode.clientId,
    title: aiNode.title,
    description: aiNode.description,
    difficulty: aiNode.difficulty,
    estimatedHours: 1,
    orderNo: aiNode.orderNo ?? 0,
    contents: [],
  }));

  // Convert AI contents and attach to nodes
  aiData.contents.forEach((aiContent) => {
    const node = nodes.find((n) => n.clientId === aiContent.nodeClientId);
    if (node) {
      const content: NodeContent = {
        id: null,
        clientId: aiContent.clientId,
        nodeClientId: aiContent.nodeClientId,
        contentType: aiContent.contentType,
        title: aiContent.title,
        description: aiContent.description,
        url: aiContent.url ?? "",
        estimatedMinutes: aiContent.estimatedMinutes ?? 0,
        duration: aiContent.estimatedMinutes ?? 0,
        orderNo: aiContent.orderNo ?? 0,
        isRequired: aiContent.isRequired,
      };
      if (!node.contents) node.contents = [];
      node.contents.push(content);
    }
  });

  // Convert AI edges to RoadmapEdge format
  const edges: RoadmapEdge[] = aiData.edges.map((aiEdge, index) => ({
    id: null,
    clientId: `edge-${index}-${Date.now()}`,
    fromNodeClientId: aiEdge.fromNodeClientId,
    toNodeClientId: aiEdge.toNodeClientId,
    edgeType: aiEdge.edgeType,
    orderNo: aiEdge.orderNo ?? index,
  }));

  return {
    roadmap: {
      id: null,
      subjectId: aiData.roadmap.subjectId,
      title: aiData.roadmap.title,
      description: aiData.roadmap.description ?? "",
      status: "Draft" as RoadmapStatus,
    },
    nodes,
    edges,
  };
}

// ─── NodeDetailSection ────────────────────────────────────────────────────────

interface NodeDetailSectionProps {
  node: RoadmapNode;
  onUpdate: (updates: Partial<RoadmapNode>) => void;
  onDeleteNode: () => void;
}

function NodeDetailSection({
  node,
  onUpdate,
  onDeleteNode,
}: NodeDetailSectionProps) {
  // Basic info editing
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [basicInfoForm, setBasicInfoForm] = useState({
    title: node.title,
    description: node.description,
    difficulty: node.difficulty,
    estimatedHours: node.estimatedHours,
  });

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
  }

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
      nodeClientId: node.clientId,
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
          <h2 className="text-xl font-semibold text-neutral-900">
            Node Details
          </h2>
        </div>
        <button
          onClick={onDeleteNode}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete Node
        </button>
      </div>

      {/* Basic Information */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-900">
            Basic Information
          </h3>
          {!isEditingBasicInfo ? (
            <button
              onClick={() => setIsEditingBasicInfo(true)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[#00bae2] hover:bg-[#00bae2]/5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelBasicInfo}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSaveBasicInfo}
                className="flex items-center gap-2 rounded-lg bg-[#00bae2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#00bae2]/90"
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </button>
            </div>
          )}
        </div>

        {!isEditingBasicInfo ? (
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium text-neutral-500 mb-1">Title</div>
              <div className="text-sm text-neutral-900">{node.title}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-500 mb-1">Description</div>
              <div className="text-sm text-neutral-700">{node.description || "No description"}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-medium text-neutral-500 mb-1">Difficulty</div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_STYLES[node.difficulty]}`}>
                  {node.difficulty}
                </span>
              </div>
              <div>
                <div className="text-xs font-medium text-neutral-500 mb-1">Estimated Hours</div>
                <div className="text-sm text-neutral-900">{node.estimatedHours}h</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={basicInfoForm.title}
                onChange={(e) => setBasicInfoForm({ ...basicInfoForm, title: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                value={basicInfoForm.description}
                onChange={(e) => setBasicInfoForm({ ...basicInfoForm, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2] focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Difficulty *
                </label>
                <select
                  value={basicInfoForm.difficulty}
                  onChange={(e) => setBasicInfoForm({ ...basicInfoForm, difficulty: e.target.value as NodeDifficulty })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2] focus:border-transparent"
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Estimated Hours *
                </label>
                <input
                  type="number"
                  min="1"
                  value={basicInfoForm.estimatedHours}
                  onChange={(e) => setBasicInfoForm({ ...basicInfoForm, estimatedHours: Number(e.target.value) })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learning Contents */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-900">
            Learning Contents
          </h3>
          {!isAddingContent && (
            <button
              onClick={() => setIsAddingContent(true)}
              className="flex items-center gap-2 rounded-lg bg-[#00bae2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#00bae2]/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Content
            </button>
          )}
        </div>

        {/* Add Content Form */}
        {isAddingContent && (
          <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Content Type *
                </label>
                <select
                  value={contentForm.contentType}
                  onChange={(e) => setContentForm({ ...contentForm, contentType: e.target.value as ContentType })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
                >
                  {CONTENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={contentForm.duration}
                  onChange={(e) => setContentForm({ ...contentForm, duration: Number(e.target.value) })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={contentForm.title}
                onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                value={contentForm.description}
                onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={contentForm.url}
                onChange={(e) => setContentForm({ ...contentForm, url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRequired"
                checked={contentForm.isRequired}
                onChange={(e) => setContentForm({ ...contentForm, isRequired: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-[#00bae2] focus:ring-[#00bae2]"
              />
              <label htmlFor="isRequired" className="text-sm text-neutral-700">
                Required content
              </label>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setIsAddingContent(false);
                  setContentForm({
                    contentType: "Video" as ContentType,
                    title: "",
                    description: "",
                    url: "",
                    duration: 0,
                    isRequired: true,
                  });
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                onClick={handleAddContent}
                className="flex items-center gap-2 rounded-lg bg-[#00bae2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#00bae2]/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </div>
        )}

        {/* Contents List */}
        <div className="space-y-3">
          {contents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-500">
                No learning contents yet. Add your first content to get started.
              </p>
            </div>
          ) : (
            contents.map((content) => {
              const cId = content.id ?? content.clientId!;
              const isEditing = editingContentId === cId;

              return (
                <div
                  key={cId}
                  className="rounded-lg border border-neutral-200 bg-white p-4"
                >
                  {!isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center rounded-full bg-[#00bae2]/10 px-2 py-0.5 text-xs font-medium text-[#00bae2]">
                              {content.contentType}
                            </span>
                            {content.isRequired && (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                Required
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-medium text-neutral-900">{content.title}</h4>
                          {content.description && (
                            <p className="text-xs text-neutral-600 mt-1">{content.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEditContent(content)}
                            className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(cId)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        {content.url && (
                          <a
                            href={content.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-[#00bae2]"
                          >
                            <LinkIcon className="h-3 w-3" />
                            Link
                          </a>
                        )}
                        {(content.duration ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {content.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 mb-1">
                            Content Type *
                          </label>
                          <select
                            value={editContentForm.contentType}
                            onChange={(e) => setEditContentForm({ ...editContentForm, contentType: e.target.value as ContentType })}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
                          >
                            {CONTENT_TYPE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 mb-1">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editContentForm.duration}
                            onChange={(e) => setEditContentForm({ ...editContentForm, duration: Number(e.target.value) })}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={editContentForm.title}
                          onChange={(e) => setEditContentForm({ ...editContentForm, title: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={editContentForm.description}
                          onChange={(e) => setEditContentForm({ ...editContentForm, description: e.target.value })}
                          rows={2}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          URL *
                        </label>
                        <input
                          type="url"
                          value={editContentForm.url}
                          onChange={(e) => setEditContentForm({ ...editContentForm, url: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`isRequired-${cId}`}
                          checked={editContentForm.isRequired}
                          onChange={(e) => setEditContentForm({ ...editContentForm, isRequired: e.target.checked })}
                          className="h-4 w-4 rounded border-neutral-300 text-[#00bae2] focus:ring-[#00bae2]"
                        />
                        <label htmlFor={`isRequired-${cId}`} className="text-sm text-neutral-700">
                          Required content
                        </label>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={handleCancelEditContent}
                          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEditContent}
                          className="flex items-center gap-2 rounded-lg bg-[#00bae2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#00bae2]/90"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ConnectorPanel ───────────────────────────────────────────────────────────

interface ConnectorPanelProps {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
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
        <h3 className="text-sm font-semibold text-neutral-900">Connections</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#00bae2] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#00bae2]/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>

      {/* Add Edge Form */}
      {isAdding && (
        <div className="p-4 border-b border-neutral-100 space-y-3 bg-neutral-50">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              From Node *
            </label>
            <select
              value={form.fromKey}
              onChange={(e) => setForm({ ...form, fromKey: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
            >
              <option value="">Select node...</option>
              {nodes.map((n) => {
                const key = getNodeKey(n);
                return (
                  <option key={key} value={key}>
                    {n.title}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              To Node *
            </label>
            <select
              value={form.toKey}
              onChange={(e) => setForm({ ...form, toKey: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
            >
              <option value="">Select node...</option>
              {nodes.map((n) => {
                const key = getNodeKey(n);
                return (
                  <option key={key} value={key}>
                    {n.title}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Edge Type *
            </label>
            <select
              value={form.edgeType}
              onChange={(e) => setForm({ ...form, edgeType: e.target.value as EdgeType })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2]"
            >
              {EDGE_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-lg bg-[#00bae2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#00bae2]/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Edge list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {displayedEdges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <LinkIcon className="h-8 w-8 text-neutral-300 mb-2" />
            <p className="text-xs text-neutral-500">No connections yet</p>
          </div>
        ) : (
          displayedEdges.map((edge) => {
            const edgeId = edge.id ?? edge.clientId!;
            const fromKey = resolveEdgeEndKey("from", edge);
            const toKey = resolveEdgeEndKey("to", edge);

            return (
              <div
                key={edgeId}
                className="rounded-lg border border-neutral-200 bg-white p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${EDGE_TYPE_STYLES[edge.edgeType]}`}>
                    {edge.edgeType}
                  </span>
                  <button
                    onClick={() => onDeleteEdge(edgeId)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-xs text-neutral-600 space-y-1">
                  <div>
                    <span className="text-neutral-500">From:</span>{" "}
                    <span className="font-medium">{getNodeName(fromKey)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">To:</span>{" "}
                    <span className="font-medium">{getNodeName(toKey)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── GeneratePopup ────────────────────────────────────────────────────────────

interface GeneratePopupProps {
  onSubmit: (message: string) => void;
  onCancel: () => void;
}

function GeneratePopup({ onSubmit, onCancel }: GeneratePopupProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-neutral-900/60 via-neutral-900/50 to-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-300">
        {/* Header with gradient icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Generate Roadmap with AI</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Let AI create your learning path</p>
          </div>
        </div>
        
        {/* Description card */}
        <div className="mb-6 rounded-xl bg-gradient-to-br from-[#00bae2]/5 to-purple-500/5 border border-[#00bae2]/20 p-4">
          <p className="text-sm text-neutral-700 leading-relaxed">
            Describe the learning roadmap you want to create. Include the topic, target skill level, and any specific requirements or learning objectives.
          </p>
        </div>

        {/* Message input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-neutral-900 mb-3">
            Your Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: Create a Python roadmap for beginners covering variables, data types, loops, functions, and object-oriented programming. Include practical exercises and real-world projects."
            rows={6}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2] focus:border-transparent placeholder:text-neutral-400 transition-all resize-none"
            autoFocus
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-neutral-500">Tip: Be specific to get better results</p>
            <p className="text-xs text-neutral-400">{message.length} characters</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-neutral-200 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RoadmapGeneratePage ──────────────────────────────────────────────────────

function generateClientId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function RoadmapGeneratePage() {
  const router = useRouter();
  
  // Generation state
  const [showPopup, setShowPopup] = useState(true);
  const [generateRequest, setGenerateRequest] = useState<GenerateRoadmapRequest>({ message: "" });
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Data query using manual trigger
  const { data: aiData, isLoading: isGenerating, error: generateError } = useGenerateRoadmapAI(
    generateRequest,
    { 
      enabled: !!generateRequest.message && !hasGenerated,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  // ── Edit state ──
  const [editedData, setEditedData] = useState<RoadmapDetail | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // ── UI state ──
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [metadataForm, setMetadataForm] = useState({ title: "", description: "" });
  const [selectedNodeId, setSelectedNodeId] = useState<number | string | null>(null);

  // Ref for the graph column — prevent scroll propagation
  const graphColRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = graphColRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => { e.preventDefault(); };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Initialize edited data when AI generates the roadmap
  useEffect(() => {
    if (aiData?.success && aiData.rawroadmap) {
      const converted = convertAIToRoadmapDetail(aiData.rawroadmap);
      setEditedData(converted);
      setHasGenerated(true);
    }
  }, [aiData]);

  // Sync metadata form when entering edit mode
  useEffect(() => {
    if (isEditingMetadata && editedData) {
      setMetadataForm({
        title: editedData.roadmap.title,
        description: editedData.roadmap.description ?? "",
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
  }, [editedData, updateNodes]);

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
        fromNodeId: typeof fromId === "number" ? fromId : undefined,
        fromNodeClientId: typeof fromId === "string" ? fromId : undefined,
        toNodeId: typeof toId === "number" ? toId : undefined,
        toNodeClientId: typeof toId === "string" ? toId : undefined,
        edgeType,
        orderNo: editedData.edges.length,
      };
      updateEdges([...editedData.edges, newEdge]);
    },
    [editedData, updateEdges]
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

  // ── Generate popup handlers ──
  const handleGenerate = (message: string) => {
    setGenerateRequest({ message });
    setShowPopup(false);
  };

  const handleCancelGenerate = () => {
    router.push("/content-roadmaps");
  };

  // ── Create roadmap mutation ──
  const createRoadmapMutation = useCreateRoadmapGraph();

  const handleCreateRoadmap = async () => {
    if (!editedData) return;
    setIsCreating(true);
    try {
      // Flatten contents from nodes
      const flatContents: NodeContent[] = [];
      editedData.nodes.forEach((node) => {
        if (node.contents) {
          node.contents.forEach((c) => {
            flatContents.push({
              ...c,
              nodeClientId: node.clientId,
            });
          });
        }
      });

      // Remove contents from nodes (API expects flat array)
      const nodesWithoutContents = editedData.nodes.map(
        ({ contents: _contents, ...rest }) => rest as RoadmapNode
      );

      const result = await createRoadmapMutation.mutateAsync({
        roadmap: {
          subjectId: editedData.roadmap.subjectId,
          title: editedData.roadmap.title,
          description: editedData.roadmap.description,
        },
        nodes: nodesWithoutContents,
        edges: editedData.edges,
        contents: flatContents,
      });

      toast.success("Roadmap created successfully!", {
        description: "Your AI-generated roadmap has been saved.",
      });
      
      // Navigate to the newly created roadmap detail page
      router.push(`/content-roadmaps/${result.roadmapId}`);
    } catch {
      toast.error("Failed to create roadmap", {
        description: "Please try again later.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
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

  // ── Loading / Error states ──
  if (showPopup) {
    return <GeneratePopup onSubmit={handleGenerate} onCancel={handleCancelGenerate} />;
  }

  if (isGenerating) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center max-w-md">
          {/* Animated gradient circle */}
          <div className="relative mx-auto mb-8">
            <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          
          {/* Loading text */}
          <h3 className="text-xl font-bold text-neutral-900 mb-2">Generating Your Roadmap</h3>
          <p className="text-neutral-600 mb-1">AI is creating your personalized learning path...</p>
          <p className="text-sm text-neutral-500">This may take 10-30 seconds</p>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="h-2 w-2 rounded-full bg-[#00bae2] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 rounded-full bg-[#00bae2] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 rounded-full bg-[#00bae2] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (generateError && !isGenerating) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="text-center max-w-lg">
          {/* Error icon */}
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-50 border-4 border-red-200 mb-6">
            <X className="h-10 w-10 text-red-600" />
          </div>
          
          {/* Error message */}
          <h3 className="text-2xl font-bold text-neutral-900 mb-3">
            Generation Failed
          </h3>
          <p className="text-neutral-600 mb-2">
            We couldn't generate your roadmap. This might be due to:
          </p>
          <ul className="text-sm text-neutral-500 mb-6 space-y-1">
            <li>• Network connection issues</li>
            <li>• Server temporarily unavailable</li>
            <li>• Invalid or unclear prompt</li>
          </ul>
          
          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setHasGenerated(false);
                setShowPopup(true);
                setGenerateRequest({ message: "" });
              }}
              className="flex items-center gap-2 rounded-xl border-2 border-[#00bae2] px-5 py-2.5 text-sm font-medium text-[#00bae2] hover:bg-[#00bae2]/5 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={() => router.push("/content-roadmaps")}
              className="rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
            >
              Back to Roadmaps
            </button>
          </div>
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
            onClick={handleCancel}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              AI Roadmap Generator
            </h1>
            <p className="text-sm text-neutral-500">Review and customize your AI-generated roadmap</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={isCreating}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Discard
          </button>
          <button
            onClick={handleCreateRoadmap}
            disabled={isCreating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <div className="h-4 w-4">
                  <LoadingSpinner size="sm" />
                </div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Roadmap
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── AI Generated Badge ── */}
      <div className="relative overflow-hidden rounded-2xl border border-gradient-to-r from-purple-500/20 to-pink-500/20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-5">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-base font-bold text-neutral-900">
                AI-Generated Roadmap
              </p>
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 border border-yellow-200">
                Draft
              </span>
            </div>
            <p className="text-sm text-neutral-600">
              Review and customize the content before saving to your roadmaps
            </p>
          </div>
        </div>
      </div>

      {/* ── Roadmap Information ── */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Roadmap Information
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">Basic details about your roadmap</p>
            </div>
            {!isEditingMetadata ? (
              <button
                onClick={() => setIsEditingMetadata(true)}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingMetadata(false)}
                  className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveMetadata}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {!isEditingMetadata ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Title</div>
                <div className="text-base font-semibold text-neutral-900">{editedData.roadmap.title}</div>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Description</div>
                <div className="text-sm text-neutral-700 leading-relaxed">{editedData.roadmap.description || "No description provided"}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={metadataForm.title}
                  onChange={(e) => setMetadataForm({ ...metadataForm, title: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2] focus:border-transparent transition-all"
                  placeholder="Enter roadmap title..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Description
                </label>
                <textarea
                  value={metadataForm.description}
                  onChange={(e) => setMetadataForm({ ...metadataForm, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bae2] focus:border-transparent transition-all resize-none"
                  placeholder="Describe what this roadmap covers..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Graph Editor ── */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Learning Path Graph
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">Visual representation of your roadmap structure</p>
            </div>
            <button
              onClick={handleAddNode}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Node
            </button>
          </div>
        </div>

        <div ref={graphColRef} className="grid grid-cols-[1fr_300px] h-[600px]">
          <div className="border-r border-neutral-100">
            <CMSRoadmapGraph
              nodes={editedData.nodes}
              edges={editedData.edges}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
            />
          </div>
          <div className="bg-neutral-50">
            <ConnectorPanel
              nodes={editedData.nodes}
              edges={editedData.edges}
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
          className="rounded-2xl border-2 border-[#00bae2]/30 bg-white shadow-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <NodeDetailSection
            node={selectedNode}
            onUpdate={(updates) =>
              handleNodeUpdate(
                selectedNode.id ?? selectedNode.clientId!,
                updates
              )
            }
            onDeleteNode={() =>
              handleDeleteNode(selectedNode.id ?? selectedNode.clientId!)
            }
          />
        </div>
      )}

      {/* ── Empty state hint ── */}
      {!selectedNode && (
        <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-gradient-to-br from-neutral-50 to-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <CircleDot className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 mb-2">
            No Node Selected
          </h3>
          <p className="text-sm text-neutral-600 mb-1">
            Click on a node in the graph above to view and edit its details
          </p>
          <p className="text-xs text-neutral-500">
            You can edit node information, add learning contents, and more
          </p>
        </div>
      )}
    </div>
  );
}

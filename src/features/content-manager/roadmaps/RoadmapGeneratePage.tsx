"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "@/shared/lib";
import { ContentManagerLoading } from "../components";
import {
  ArrowLeft,
  BookOpen,
  Check,
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
          <h3 className="text-base font-bold text-neutral-900">
            Node Detail
          </h3>
          <span className="text-sm text-neutral-500">— {node.title}</span>
        </div>
        <button
          onClick={onDeleteNode}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-200"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Node
        </button>
      </div>

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
                onChange={(e) => setBasicInfoForm({ ...basicInfoForm, title: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all"
                placeholder="Node title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Description
              </label>
              <textarea
                value={basicInfoForm.description}
                onChange={(e) => setBasicInfoForm({ ...basicInfoForm, description: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all min-h-[80px]"
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
                  onChange={(e) => setBasicInfoForm({ ...basicInfoForm, difficulty: e.target.value as NodeDifficulty })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all"
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
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
                  onChange={(e) => setBasicInfoForm({ ...basicInfoForm, estimatedHours: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all"
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
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
        <div>
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
            <LinkIcon className="h-4 w-4 text-[#00bae2]" />
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
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
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
            <LinkIcon className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
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

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/70 backdrop-blur-sm p-4 sm:p-6 md:p-8 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
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
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 placeholder:text-neutral-400 transition-all resize-none"
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
    </div>,
    document.body
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
      retry: false,
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
      <ContentManagerLoading
        variant="page"
        title="Generating your roadmap..."
        description="AI is creating your personalized learning path. This may take 10-30 seconds."
      />
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
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all"
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
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 transition-all resize-none"
                  placeholder="Describe what this roadmap covers..."
                />
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

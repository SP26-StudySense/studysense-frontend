"use client";

import { useState } from "react";
import { Plus, Trash2, Save, X, ExternalLink, GripVertical } from "lucide-react";
import type { 
  RoadmapNode, 
  RoadmapEdge, 
  NodeContent, 
  NodeDifficulty, 
  EdgeType,
  ContentType 
} from "../api/types";

interface ManageRoadmapNodeProps {
  node: RoadmapNode;
  allNodes: RoadmapNode[];
  edges: RoadmapEdge[];
  onUpdate: (updates: Partial<RoadmapNode>) => void;
  onAddEdge: (fromNodeId: number | string, toNodeId: number | string, edgeType: EdgeType) => void;
  onDeleteEdge: (edgeId: number | string) => void;
}

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;
const EDGE_TYPE_OPTIONS = ["Prerequisite", "Recommended", "Next"] as const;
const CONTENT_TYPE_OPTIONS = [
  "Video",
  "Article",
  "Book",
  "Course",
  "Exercise",
  "Quiz",
  "Project",
] as const;

export function ManageRoadmapNode({
  node,
  allNodes,
  edges,
  onUpdate,
  onAddEdge,
  onDeleteEdge,
}: ManageRoadmapNodeProps) {
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isAddingEdge, setIsAddingEdge] = useState(false);

  const [basicInfoForm, setBasicInfoForm] = useState({
    title: node.title,
    description: node.description,
    difficulty: node.difficulty,
    estimatedHours: node.estimatedHours,
  });

  const [contentForm, setContentForm] = useState<Partial<NodeContent>>({
    contentType: "Video" as ContentType,
    title: "",
    description: "",
    url: "",
    duration: 0,
    isRequired: true,
  });

  const [edgeForm, setEdgeForm] = useState<{
    targetNodeId: number | string | null;
    edgeType: EdgeType;
    label: string;
  }>({
    targetNodeId: null,
    edgeType: "Next" as EdgeType,
    label: "",
  });

  const nodeId = node.id || node.clientId!;
  const contents = node.contents || [];

  // Get connected edges
  const incomingEdges = edges.filter((edge) => {
    const toMatch = edge.toNodeId === nodeId || edge.toNodeClientId === nodeId;
    return toMatch;
  });
  
  const outgoingEdges = edges.filter((edge) => {
    const fromMatch = edge.fromNodeId === nodeId || edge.fromNodeClientId === nodeId;
    return fromMatch;
  });

  // Get node by ID (support both database ID and client ID)
  const getNodeById = (id: number | string | undefined) => {
    if (!id) return null;
    return allNodes.find((n) => {
      const matchId = n.id ? n.id === id : n.clientId === id;
      return matchId;
    });
  };

  // Handle basic info update
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

  // Handle content add
  const handleAddContent = () => {
    if (!contentForm.title || !contentForm.url) return;

    const newContent: NodeContent = {
      id: null,
      clientId: `temp-content-${Date.now()}`,
      nodeId: typeof nodeId === 'number' ? nodeId : undefined,
      contentType: contentForm.contentType!,
      title: contentForm.title!,
      description: contentForm.description || "",
      url: contentForm.url!,
      estimatedMinutes: contentForm.estimatedMinutes  ,
      duration: contentForm.duration,
      orderNo: contents.length,
      isRequired: contentForm.isRequired!,
    };

    onUpdate({
      contents: [...contents, newContent],
    });

    // Reset form
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

  // Handle content delete
  const handleDeleteContent = (contentId: number | string) => {
    const newContents = contents.filter((c) => {
      const matchId = c.id ? c.id === contentId : c.clientId === contentId;
      return !matchId;
    });
    onUpdate({ contents: newContents });
  };

  // Handle edge add
  const handleAddEdgeSubmit = () => {
    if (!edgeForm.targetNodeId) return;
    onAddEdge(nodeId, edgeForm.targetNodeId, edgeForm.edgeType);
    setEdgeForm({
      targetNodeId: null,
      edgeType: "Next" as EdgeType,
      label: "",
    });
    setIsAddingEdge(false);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">Basic Information</h3>
          {!isEditingBasicInfo && (
            <button
              onClick={() => setIsEditingBasicInfo(true)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#00bae2] hover:bg-[#00bae2]/5 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingBasicInfo ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={basicInfoForm.title}
                onChange={(e) => setBasicInfoForm({ ...basicInfoForm, title: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                placeholder="Enter node title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={basicInfoForm.description}
                onChange={(e) => setBasicInfoForm({ ...basicInfoForm, description: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 min-h-[100px]"
                placeholder="Enter description"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={basicInfoForm.difficulty}
                  onChange={(e) => setBasicInfoForm({ ...basicInfoForm, difficulty: e.target.value as NodeDifficulty })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                >
                  {DIFFICULTY_OPTIONS.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={basicInfoForm.estimatedHours}
                  onChange={(e) => setBasicInfoForm({ ...basicInfoForm, estimatedHours: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCancelBasicInfo}
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <X className="inline h-4 w-4 mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSaveBasicInfo}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
              >
                <Save className="inline h-4 w-4 mr-1" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-neutral-700">Title</p>
              <p className="text-sm text-neutral-900">{node.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">Description</p>
              <p className="text-sm text-neutral-600">{node.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-neutral-700">Difficulty</p>
                <span className={`inline-block mt-1 rounded-full px-3 py-1 text-xs font-medium ${
                  node.difficulty === 'Beginner' 
                    ? 'bg-green-100 text-green-700'
                    : node.difficulty === 'Intermediate'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {node.difficulty}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700">Estimated Hours</p>
                <p className="text-sm text-neutral-900">{node.estimatedHours}h</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contents Section */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">
            Learning Contents ({contents.length})
          </h3>
          <button
            onClick={() => setIsAddingContent(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-1.5 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Content
          </button>
        </div>

        {/* Add Content Form */}
        {isAddingContent && (
          <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Content Type
                </label>
                <select
                  value={contentForm.contentType}
                  onChange={(e) => setContentForm({ ...contentForm, contentType: e.target.value as ContentType })}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                >
                  {CONTENT_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                  placeholder="Content title"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={contentForm.description}
                onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                placeholder="Brief description"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Content URL
                </label>
                <input
                  type="url"
                  value={contentForm.url}
                  onChange={(e) => setContentForm({ ...contentForm, url: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={contentForm.duration || 0}
                  onChange={(e) => setContentForm({ ...contentForm, duration: Number(e.target.value) })}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={contentForm.isRequired}
                  onChange={(e) => setContentForm({ ...contentForm, isRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-[#00bae2] focus:ring-[#00bae2]"
                />
                <label htmlFor="isRequired" className="text-sm text-neutral-700">
                  Required
                </label>
              </div>
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
                className="flex-1 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
              >
                Add Content
              </button>
            </div>
          </div>
        )}

        {/* Contents List */}
        {contents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center">
            <p className="text-sm text-neutral-500">No learning contents yet</p>
            <button
              onClick={() => setIsAddingContent(true)}
              className="mt-2 text-sm text-[#00bae2] hover:underline"
            >
              Add your first content
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {contents.map((content) => {
              const contentId = content.id || content.clientId!;
              return (
                <div
                  key={contentId}
                  className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors"
                >
                  <GripVertical className="h-4 w-4 text-neutral-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                            {content.contentType}
                          </span>
                          {content.isRequired && (
                            <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-medium text-neutral-900">{content.title}</p>
                        {content.description && (
                          <p className="mt-0.5 text-sm text-neutral-600">{content.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                          {content.duration && <span>{content.duration} min</span>}
                          <a
                            href={content.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[#00bae2] hover:underline"
                          >
                            View Resource
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteContent(contentId)}
                        className="text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connections Section */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">Connections</h3>
          <button
            onClick={() => setIsAddingEdge(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-1.5 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Connection
          </button>
        </div>

        {/* Add Edge Form */}
        {isAddingEdge && (
          <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Connect to Node
              </label>
              <select
                value={edgeForm.targetNodeId || ''}
                onChange={(e) => setEdgeForm({ ...edgeForm, targetNodeId: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
              >
                <option value="">Select a node...</option>
                {allNodes
                  .filter((n) => {
                    const nId = n.id || n.clientId!;
                    return nId !== nodeId;
                  })
                  .map((n) => {
                    const nId = n.id || n.clientId!;
                    return (
                      <option key={nId} value={nId}>
                        {n.title}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Connection Type
              </label>
              <select
                value={edgeForm.edgeType}
                onChange={(e) => setEdgeForm({ ...edgeForm, edgeType: e.target.value as EdgeType })}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
              >
                {EDGE_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsAddingEdge(false)}
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEdgeSubmit}
                disabled={!edgeForm.targetNodeId}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Connection
              </button>
            </div>
          </div>
        )}

        {/* Outgoing Connections */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-neutral-700">Outgoing ({outgoingEdges.length})</h4>
          {outgoingEdges.length === 0 ? (
            <p className="text-sm text-neutral-500">No outgoing connections</p>
          ) : (
            <div className="space-y-2">
              {outgoingEdges.map((edge) => {
                const edgeId = edge.id || edge.clientId!;
                const targetNode = getNodeById(edge.toNodeId || edge.toNodeClientId);
                return (
                  <div
                    key={edgeId}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        edge.edgeType === 'Prerequisite'
                          ? 'bg-red-100 text-red-700'
                          : edge.edgeType === 'Recommended'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {edge.edgeType}
                      </span>
                      <span className="text-sm text-neutral-900">
                        → {targetNode?.title || 'Unknown Node'}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteEdge(edgeId)}
                      className="text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Incoming Connections */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-neutral-700">Incoming ({incomingEdges.length})</h4>
          {incomingEdges.length === 0 ? (
            <p className="text-sm text-neutral-500">No incoming connections</p>
          ) : (
            <div className="space-y-2">
              {incomingEdges.map((edge) => {
                const edgeId = edge.id || edge.clientId!;
                const sourceNode = getNodeById(edge.fromNodeId || edge.fromNodeClientId);
                return (
                  <div
                    key={edgeId}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        edge.edgeType === 'Prerequisite'
                          ? 'bg-red-100 text-red-700'
                          : edge.edgeType === 'Recommended'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {edge.edgeType}
                      </span>
                      <span className="text-sm text-neutral-900">
                        {sourceNode?.title || 'Unknown Node'} →
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteEdge(edgeId)}
                      className="text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Search, Filter, Plus, Edit, Trash2, X, ArrowLeft, GitBranch } from "lucide-react";
import { useRouter } from "next/navigation";
import { RoadmapGraph, RoadmapEdge } from "@/features/roadmaps/components/RoadmapGraph";
import { RoadmapNodeData, DifficultyLevel } from "@/features/roadmaps/components/RoadmapNode";
import { NodeDetailData, NodeResource, NodeTask } from "@/features/roadmaps/components/NodeDetailPanel";
import { ConfirmationModal } from "@/shared/ui";

// Type definitions for modals
type ModalState = 
  | { type: 'none' }
  | { type: 'createNode' }
  | { type: 'editNode'; node: RoadmapNodeData }
  | { type: 'deleteNode'; id: string; name: string }
  | { type: 'createResource' }
  | { type: 'editResource'; resource: NodeResource }
  | { type: 'deleteResource'; id: string; name: string }
  | { type: 'createTask' }
  | { type: 'editTask'; task: NodeTask }
  | { type: 'deleteTask'; id: string; name: string }
  | { type: 'createEdge' };

type ResourceType = 'docs' | 'article' | 'video';

interface AdminRoadmapPageProps {
  initialNodes?: RoadmapNodeData[];
  initialEdges?: RoadmapEdge[];
}

// Node Form Modal Component
function NodeFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<RoadmapNodeData>) => void;
  initialData?: RoadmapNodeData;
  mode: 'create' | 'edit';
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: '',
    duration: initialData?.duration || 60,
    difficulty: initialData?.difficulty || 'beginner' as DifficultyLevel,
    x: initialData?.x || 100,
    y: initialData?.y || 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-neutral-200 shadow-2xl">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">
              {mode === 'create' ? 'Add New Node' : 'Edit Node'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="Enter node title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Duration (min)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Position X
              </label>
              <input
                type="number"
                value={formData.x}
                onChange={(e) => setFormData({ ...formData, x: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Position Y
              </label>
              <input
                type="number"
                value={formData.y}
                onChange={(e) => setFormData({ ...formData, y: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
            >
              {mode === 'create' ? 'Create Node' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Resource Form Modal Component
function ResourceFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<NodeResource, 'id'>) => void;
  initialData?: NodeResource;
  mode: 'create' | 'edit';
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    type: initialData?.type || 'docs' as ResourceType,
    url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white border border-neutral-200 shadow-2xl">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">
              {mode === 'create' ? 'Add Resource' : 'Edit Resource'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="Enter resource title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
            >
              <option value="docs">Documentation</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
            >
              {mode === 'create' ? 'Add Resource' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Task Form Modal Component
function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<NodeTask, 'id'>) => void;
  initialData?: NodeTask;
  mode: 'create' | 'edit';
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    isCompleted: initialData?.isCompleted || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white border border-neutral-200 shadow-2xl">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">
              {mode === 'create' ? 'Add Task' : 'Edit Task'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="Enter task description"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="taskCompleted"
              checked={formData.isCompleted}
              onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-300 text-[#00bae2] focus:ring-[#00bae2]/10"
            />
            <label htmlFor="taskCompleted" className="text-sm text-neutral-700">
              Mark as completed
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
            >
              {mode === 'create' ? 'Add Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edge Form Modal Component
function EdgeFormModal({
  isOpen,
  onClose,
  onSubmit,
  nodes,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { from: string; to: string }) => void;
  nodes: RoadmapNodeData[];
}) {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from || !formData.to) return;
    if (formData.from === formData.to) {
      alert("Cannot create edge from node to itself");
      return;
    }
    onSubmit(formData);
    onClose();
    setFormData({ from: '', to: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white border border-neutral-200 shadow-2xl">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">Create Edge</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Source Node <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            >
              <option value="">Select source node</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Target Node <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              required
            >
              <option value="">Select target node</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.title}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
            This will create a connection from the source node to the target node in the roadmap.
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
            >
              Create Edge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Extended detail panel with admin actions
function AdminNodeDetailPanel({ 
  node, 
  onClose,
  onEditNode,
  onDeleteNode,
  onAddResource,
  onEditResource,
  onDeleteResource,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: { 
  node: NodeDetailData | null;
  onClose: () => void;
  onEditNode?: () => void;
  onDeleteNode?: () => void;
  onAddResource?: () => void;
  onEditResource?: (resource: NodeResource) => void;
  onDeleteResource?: (resourceId: string) => void;
  onAddTask?: () => void;
  onEditTask?: (task: NodeTask) => void;
  onDeleteTask?: (taskId: string) => void;
}) {
  if (!node) return null;

  const difficultyConfig = {
    beginner: { label: 'Beginner', color: 'bg-emerald-100 text-emerald-700' },
    intermediate: { label: 'Intermediate', color: 'bg-amber-100 text-amber-700' },
    advanced: { label: 'Advanced', color: 'bg-red-100 text-red-700' },
  };

  const resourceIcons = {
    docs: 'FileText',
    article: 'BookOpen',
    video: 'Video',
  };

  const difficulty = difficultyConfig[node.difficulty];
  const progress = node.totalTasks > 0 ? (node.completedTasks / node.totalTasks) * 100 : 0;

  return (
    <div className="w-96 rounded-3xl bg-white/90 backdrop-blur-xl border border-neutral-200/60 shadow-2xl shadow-neutral-900/10 flex flex-col max-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              {node.title}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${difficulty.color}`}>
                {difficulty.label}
              </span>
              <span className="flex items-center gap-1 text-sm text-neutral-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                {node.duration} min
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
          {node.description}
        </p>

        {/* Admin Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={onEditNode}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
          >
            <Edit className="h-4 w-4" />
            Edit Node
          </button>
          <button
            onClick={onDeleteNode}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-neutral-900">Progress</h3>
            <span className="text-sm text-neutral-500">
              {node.completedTasks}/{node.totalTasks} tasks ({Math.round(progress)}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00bae2] to-[#00a0c6] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Prerequisites */}
        {node.prerequisites.length > 0 && (
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Prerequisites</h3>
            <div className="space-y-2">
              {node.prerequisites.map((prereq, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                  <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  {prereq}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-neutral-900">Resources</h3>
            <button
              onClick={onAddResource}
              className="text-[#00bae2] hover:text-[#0099bb] transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {node.resources.map(resource => (
              <div key={resource.id} className="group flex items-center gap-3 rounded-xl bg-neutral-50 p-3 hover:bg-neutral-100 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                  <svg className="h-4 w-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{resource.title}</p>
                  <p className="text-xs text-neutral-500 capitalize">{resource.type}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditResource?.(resource)}
                    className="p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5 text-neutral-600" />
                  </button>
                  <button
                    onClick={() => onDeleteResource?.(resource.id)}
                    className="p-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-neutral-900">Tasks</h3>
            <button
              onClick={onAddTask}
              className="text-[#00bae2] hover:text-[#0099bb] transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {node.tasks.map(task => (
              <div key={task.id} className="group flex items-center gap-3 text-sm">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  task.isCompleted ? "bg-[#00bae2] border-[#00bae2] text-white" : "border-neutral-300"
                }`}>
                  {task.isCompleted && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`flex-1 ${task.isCompleted ? "text-neutral-400" : "text-neutral-700"}`}>
                  {task.title}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditTask?.(task)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5 text-neutral-600" />
                  </button>
                  <button
                    onClick={() => onDeleteTask?.(task.id)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminRoadmapPage({
  initialNodes = [],
  initialEdges = [],
}: AdminRoadmapPageProps) {
  const router = useRouter();
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  // Mock node details
  const MOCK_NODE_DETAILS: Record<string, Omit<NodeDetailData, keyof RoadmapNodeData>> = {
    '9': {
      description: 'Master React hooks including useState, useEffect, useContext, useReducer, and custom hooks.',
      prerequisites: ['React Fundamentals'],
      resources: [
        { id: 'r1', title: 'Hooks API Reference', type: 'docs' },
        { id: 'r2', title: 'useEffect Complete Guide', type: 'article' },
        { id: 'r3', title: 'Building Custom Hooks', type: 'video' },
      ],
      tasks: [
        { id: 't1', title: 'Master useState and useReducer', isCompleted: false },
        { id: 't2', title: 'Understand useEffect lifecycle', isCompleted: false },
        { id: 't3', title: 'Use useContext for state sharing', isCompleted: false },
        { id: 't4', title: 'Create custom reusable hooks', isCompleted: false },
      ],
    },
  };

  const handleNodeSelect = (node: RoadmapNodeData) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  const getNodeDetail = (node: RoadmapNodeData | null): NodeDetailData | null => {
    if (!node) return null;
    const details = MOCK_NODE_DETAILS[node.id] || {
      description: `Learn the fundamentals of ${node.title} and build practical skills.`,
      prerequisites: [],
      resources: [],
      tasks: Array.from({ length: node.totalTasks }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i + 1}`,
        isCompleted: i < node.completedTasks,
      })),
    };
    return { ...node, ...details };
  };

  const handleAddNode = () => {
    setModalState({ type: 'createNode' });
  };

  const handleEditNode = () => {
    if (selectedNode) {
      setModalState({ type: 'editNode', node: selectedNode });
    }
  };

  const handleDeleteNodeClick = () => {
    if (selectedNode) {
      setModalState({ type: 'deleteNode', id: selectedNode.id, name: selectedNode.title });
    }
  };

  const handleNodeSubmit = (data: Partial<RoadmapNodeData>) => {
    console.log("Node data:", data);
    setModalState({ type: 'none' });
  };

  const handleConfirmDelete = () => {
    console.log("Delete confirmed:", modalState);
    if (modalState.type === 'deleteNode') {
      setSelectedNode(null);
    }
    setModalState({ type: 'none' });
  };

  const handleAddResource = () => {
    setModalState({ type: 'createResource' });
  };

  const handleEditResource = (resource: NodeResource) => {
    setModalState({ type: 'editResource', resource });
  };

  const handleDeleteResource = (resourceId: string) => {
    const resource = getNodeDetail(selectedNode)?.resources.find(r => r.id === resourceId);
    if (resource) {
      setModalState({ type: 'deleteResource', id: resourceId, name: resource.title });
    }
  };

  const handleResourceSubmit = (data: Omit<NodeResource, 'id'>) => {
    console.log("Resource data:", data);
    setModalState({ type: 'none' });
  };

  const handleAddTask = () => {
    setModalState({ type: 'createTask' });
  };

  const handleEditTask = (task: NodeTask) => {
    setModalState({ type: 'editTask', task });
  };

  const handleDeleteTask = (taskId: string) => {
    const task = getNodeDetail(selectedNode)?.tasks.find(t => t.id === taskId);
    if (task) {
      setModalState({ type: 'deleteTask', id: taskId, name: task.title });
    }
  };

  const handleTaskSubmit = (data: Omit<NodeTask, 'id'>) => {
    console.log("Task data:", data);
    setModalState({ type: 'none' });
  };

  const handleCreateEdge = (data: { from: string; to: string }) => {
    console.log("Create edge:", data);
    setModalState({ type: 'none' });
  };

  const handleBackToList = () => {
    router.push('/admin-roadmaps');
  };

  return (
    <>
      <div className="flex gap-6 h-[calc(100vh-160px)]">
        {/* Left - Graph */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Action Bar - All Buttons in One Row */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Roadmaps
            </button>
            <button
              onClick={handleAddNode}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-5 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Create Node
            </button>
            <button
              onClick={() => setModalState({ type: 'createEdge' })}
              className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition-all"
            >
              <GitBranch className="h-4 w-4" />
              Create Edge
            </button>
          </div>

          {/* Graph */}
          <RoadmapGraph
            nodes={initialNodes}
            edges={initialEdges}
            selectedNodeId={selectedNode?.id || null}
            onNodeSelect={handleNodeSelect}
            className="flex-1"
          />
        </div>

        {/* Right - Detail Panel with Admin Actions */}
        {selectedNode && (
          <AdminNodeDetailPanel
            node={getNodeDetail(selectedNode)}
            onClose={handleClosePanel}
            onEditNode={handleEditNode}
            onDeleteNode={handleDeleteNodeClick}
            onAddResource={handleAddResource}
            onEditResource={handleEditResource}
            onDeleteResource={handleDeleteResource}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </div>

      {/* All Modals */}
      
      {/* Node Create/Edit Modal */}
      <NodeFormModal
        isOpen={modalState.type === 'createNode' || modalState.type === 'editNode'}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={handleNodeSubmit}
        initialData={modalState.type === 'editNode' ? modalState.node : undefined}
        mode={modalState.type === 'createNode' ? 'create' : 'edit'}
      />

      {/* Resource Create/Edit Modal */}
      <ResourceFormModal
        isOpen={modalState.type === 'createResource' || modalState.type === 'editResource'}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={handleResourceSubmit}
        initialData={modalState.type === 'editResource' ? modalState.resource : undefined}
        mode={modalState.type === 'createResource' ? 'create' : 'edit'}
      />

      {/* Task Create/Edit Modal */}
      <TaskFormModal
        isOpen={modalState.type === 'createTask' || modalState.type === 'editTask'}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={handleTaskSubmit}
        initialData={modalState.type === 'editTask' ? modalState.task : undefined}
        mode={modalState.type === 'createTask' ? 'create' : 'edit'}
      />

      {/* Edge Create Modal */}
      <EdgeFormModal
        isOpen={modalState.type === 'createEdge'}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={handleCreateEdge}
        nodes={initialNodes}
      />

      {/* Delete Confirmation Modals */}
      {(modalState.type === 'deleteNode' || modalState.type === 'deleteResource' || modalState.type === 'deleteTask') && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModalState({ type: 'none' })}
          onConfirm={handleConfirmDelete}
          title={`Delete ${modalState.type === 'deleteNode' ? 'Node' : modalState.type === 'deleteResource' ? 'Resource' : 'Task'}`}
          description={
            <div>
              <p className="mb-3">
                Are you sure you want to delete this {modalState.type === 'deleteNode' ? 'node' : modalState.type === 'deleteResource' ? 'resource' : 'task'}?
              </p>
              <div className="rounded-lg bg-neutral-100 p-3">
                <p className="font-medium text-neutral-900">{modalState.name}</p>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                This action cannot be undone.
              </p>
            </div>
          }
          confirmText="Delete"
          variant="danger"
        />
      )}
    </>
  );
}
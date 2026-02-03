"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, ExternalLink, Clock, Star } from "lucide-react";
import { NodeContentItemDTO } from "../types";

interface NodeContentPanelProps {
  nodeId: number;
  nodeTitle: string;
  contents: NodeContentItemDTO[];
  onAdd: (content: Omit<NodeContentItemDTO, 'id' | 'nodeId'>) => void;
  onUpdate: (id: number, content: Partial<NodeContentItemDTO>) => void;
  onDelete: (id: number) => void;
}

type ModalState = 
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; content: NodeContentItemDTO };

const CONTENT_TYPES = [
  { value: 'Course', label: 'Course', icon: '📚' },
  { value: 'Exercise', label: 'Exercise', icon: '✏️' },
  { value: 'Video', label: 'Video', icon: '🎥' },
  { value: 'Article', label: 'Article', icon: '📄' },
  { value: 'Documentation', label: 'Documentation', icon: '📖' },
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

function ContentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: NodeContentItemDTO;
  mode: 'add' | 'edit';
}) {
  const [formData, setFormData] = useState({
    contentType: initialData?.contentType || 'Video',
    title: initialData?.title || '',
    url: initialData?.url || '',
    description: initialData?.description || '',
    estimatedMinutes: initialData?.estimatedMinutes || 30,
    difficulty: initialData?.difficulty || 'Beginner',
    isRequired: initialData?.isRequired ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-neutral-200 shadow-2xl">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 m-0">
              {mode === 'add' ? 'Add Content' : 'Edit Content'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Content Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              >
                {CONTENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="Enter content title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              URL
            </label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="https://example.com/resource"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 min-h-[80px]"
              placeholder="Describe what this content covers..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                min="1"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-[#00bae2] focus:ring-[#00bae2]"
                />
                <span className="text-sm font-medium text-neutral-700">Required Content</span>
              </label>
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
              {mode === 'add' ? 'Add Content' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NodeContentPanel({
  nodeId,
  nodeTitle,
  contents,
  onAdd,
  onUpdate,
  onDelete,
}: NodeContentPanelProps) {
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  const handleAdd = (data: any) => {
    onAdd({
      ...data,
      orderNo: contents.length + 1,
    });
    setModalState({ type: 'none' });
  };

  const handleEdit = (data: any) => {
    if (modalState.type === 'edit') {
      onUpdate(modalState.content.id, data);
    }
    setModalState({ type: 'none' });
  };

  const getContentIcon = (type: string) => {
    const found = CONTENT_TYPES.find(t => t.value === type);
    return found?.icon || '📄';
  };

  const sortedContents = [...contents].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">{nodeTitle}</h3>
          <p className="text-sm text-neutral-600">{contents.length} content item{contents.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModalState({ type: 'add' })}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add Content
        </button>
      </div>

      {/* Contents List */}
      {sortedContents.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
          <p className="text-sm text-neutral-600">No content added yet. Click "Add Content" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedContents.map((content) => (
            <div
              key={content.id}
              className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#fec5fb] to-[#00bae2] text-xl">
                  {getContentIcon(content.contentType)}
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-neutral-900 truncate">{content.title}</h4>
                      <p className="text-xs text-neutral-500">{content.contentType}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {content.isRequired && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          <Star className="inline h-3 w-3 mb-0.5" /> Required
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        content.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                        content.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {content.difficulty}
                      </span>
                    </div>
                  </div>

                  {content.description && (
                    <p className="text-sm text-neutral-600 mb-2 line-clamp-2">{content.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    {content.estimatedMinutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {content.estimatedMinutes} min
                      </div>
                    )}
                    {content.url && (
                      <a
                        href={content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#00bae2] hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open Link
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setModalState({ type: 'edit', content })}
                    className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${content.title}"?`)) {
                        onDelete(content.id);
                      }
                    }}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ContentFormModal
        isOpen={modalState.type === 'add'}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={handleAdd}
        mode="add"
      />

      <ContentFormModal
        isOpen={modalState.type === 'edit'}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={handleEdit}
        initialData={modalState.type === 'edit' ? modalState.content : undefined}
        mode="edit"
      />
    </div>
  );
}

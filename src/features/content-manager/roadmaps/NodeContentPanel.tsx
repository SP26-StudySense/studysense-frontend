"use client";

import { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, X, ExternalLink, Clock, Star, Edit, Trash } from "lucide-react";
import { NodeContentItemDTO, NodeDifficulty } from "../types";

interface NodeContentPanelProps {
  nodeId: number;
  nodeTitle: string;
  nodeDescription?: string | null;
  nodeDifficulty?: NodeDifficulty | string | null;
  contents: NodeContentItemDTO[];
  onAdd: (content: Omit<NodeContentItemDTO, 'id' | 'nodeId'>) => void;
  onUpdate: (id: number, content: Partial<NodeContentItemDTO>) => void;
  onDelete: (id: number) => void;
  onUpdateNode: (updates: { title?: string; difficulty?: string | number; description?: string | null }) => void;
  onDeleteNode: () => void;
}

type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; content: NodeContentItemDTO }
  | { type: 'editNode' };

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
      <div className="w-full max-w-full sm:max-w-2xl rounded-3xl bg-white border border-neutral-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-neutral-100 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 m-0">
              {mode === 'add' ? 'Add Content' : 'Edit Content'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-neutral-700 mb-2">Difficulty</label>
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">Title <span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">URL</label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="https://example.com/resource"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 min-h-[80px]"
              placeholder="Describe what this content covers..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Estimated Time (minutes)</label>
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md">
              {mode === 'add' ? 'Add Content' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NodeEditModal({
  isOpen,
  onClose,
  onSubmit,
  nodeTitle,
  nodeDescription,
  nodeDifficulty,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; difficulty: string }) => void;
  nodeTitle: string;
  nodeDescription?: string | null;
  nodeDifficulty?: NodeDifficulty | string | null;
}) {
  const [formData, setFormData] = useState({
    title: nodeTitle,
    description: nodeDescription || '',
    difficulty: String(nodeDifficulty || 'Beginner'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-full sm:max-w-lg rounded-3xl bg-white border border-neutral-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-neutral-100 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 m-0">Edit Node</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Node Title <span className="text-red-500">*</span>
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

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 min-h-[100px]"
              placeholder="Describe what this node covers..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Difficulty</label>
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md">
              Save Changes
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
  nodeDescription,
  nodeDifficulty,
  contents,
  onAdd,
  onUpdate,
  onDelete,
  onUpdateNode,
  onDeleteNode,
}: NodeContentPanelProps) {
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [activeType, setActiveType] = useState<'All' | (typeof CONTENT_TYPES)[number]['value']>('All');

  const handleAdd = (data: any) => {
    onAdd({ ...data, orderNo: contents.length + 1 });
    setModalState({ type: 'none' });
  };

  const handleEdit = (data: any) => {
    if (modalState.type === 'edit') onUpdate(modalState.content.id, data);
    setModalState({ type: 'none' });
  };

  const handleEditNode = (data: { title: string; description: string; difficulty: string }) => {
    onUpdateNode(data);
    setModalState({ type: 'none' });
  };

  const getContentIcon = (type: string) => CONTENT_TYPES.find(t => t.value === type)?.icon || '📄';

  const sorted = useMemo(
    () => [...contents].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0)),
    [contents]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, NodeContentItemDTO[]>();
    for (const item of sorted) {
      const key = item.contentType || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [sorted]);

  const renderList = (list: NodeContentItemDTO[]) => (
    <div className="space-y-3">
      {list.map((content) => (
        <div key={content.id} className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#fec5fb] to-[#00bae2] text-xl">
              {getContentIcon(content.contentType)}
            </div>
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
                  <a href={content.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#00bae2] hover:underline">
                    <ExternalLink className="h-3 w-3" />
                    Open Link
                  </a>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setModalState({ type: 'edit', content })} className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 transition-colors">
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => { if (confirm(`Delete "${content.title}"?`)) onDelete(content.id); }}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const filtered = activeType === 'All' ? sorted : sorted.filter(c => c.contentType === activeType);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">{nodeTitle}</h3>
          <p className="text-sm text-neutral-600">{contents.length} content item{contents.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalState({ type: 'editNode' })}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
            title="Edit Node"
          >
            <Edit className="inline h-3.5 w-3.5 mr-1" />
            Edit Node
          </button>
          <button
            onClick={() => { if (confirm('Delete this node and its connections?')) onDeleteNode(); }}
            className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
            title="Delete Node"
          >
            <Trash className="inline h-3.5 w-3.5 mr-1" />
            Delete Node
          </button>
          <button
            onClick={() => setModalState({ type: 'add' })}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Content
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', ...CONTENT_TYPES.map(t => t.value)].map((t) => {
          const isActive = activeType === t;
          const count = t === 'All'
            ? contents.length
            : contents.filter(c => c.contentType === t).length;
          return (
            <button
              key={t}
              onClick={() => setActiveType(t as any)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                isActive ? 'bg-[#00bae2]/10 border-[#00bae2] text-[#00bae2]' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {t} {count > 0 ? `(${count})` : ''}
            </button>
          );
        })}
      </div>

      {activeType === 'All' ? (
        <div className="space-y-6">
          {CONTENT_TYPES.map((ct) => {
            const list = grouped.get(ct.value) || [];
            if (list.length === 0) return null;
            return (
              <div key={ct.value} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ct.icon}</span>
                  <h4 className="text-sm font-semibold text-neutral-800">{ct.label}</h4>
                  <span className="text-xs text-neutral-500">• {list.length}</span>
                </div>
                {renderList(list)}
              </div>
            );
          })}
          {[...grouped.entries()].map(([type, list]) => {
            if (CONTENT_TYPES.find(ct => ct.value === type)) return null;
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📄</span>
                  <h4 className="text-sm font-semibold text-neutral-800">{type}</h4>
                  <span className="text-xs text-neutral-500">• {list.length}</span>
                </div>
                {renderList(list)}
              </div>
            );
          })}
        </div>
      ) : (
        renderList(filtered)
      )}

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
      <NodeEditModal
        isOpen={modalState.type === 'editNode'}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={handleEditNode}
        nodeTitle={nodeTitle}
        nodeDescription={nodeDescription}
        nodeDifficulty={nodeDifficulty}
      />
    </div>
  );
}

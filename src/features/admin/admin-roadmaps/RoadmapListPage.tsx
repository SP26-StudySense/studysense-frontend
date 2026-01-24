"use client";

import { useState } from "react";
import { Search, Filter, Plus, Eye, Edit, Trash2, X } from "lucide-react";
import Link from "next/link";
import { ConfirmationModal } from "@/shared/ui";

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  subjectId: string;
  subjectName: string;
  totalNodes: number;
  createdAt: string;
  updatedAt: string;
}

interface RoadmapListPageProps {
  initialRoadmaps?: Roadmap[];
}

type ModalState = 
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; roadmap: Roadmap }
  | { type: 'delete'; id: string; title: string };

// Roadmap Form Modal Component
function RoadmapFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Roadmap>) => void;
  initialData?: Roadmap;
  mode: 'create' | 'edit';
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || '1',
    subjectId: initialData?.subjectId || '1',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  // Mock categories and subjects
  const categories = [
    { id: '1', name: 'Programming' },
    { id: '2', name: 'Design' },
  ];

  const subjects = [
    { id: '1', name: 'Frontend Development' },
    { id: '2', name: 'UI/UX Design' },
    { id: '3', name: 'Backend Development' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-neutral-200 shadow-2xl">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">
              {mode === 'create' ? 'Create New Roadmap' : 'Edit Roadmap'}
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
              Roadmap Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
              placeholder="Enter roadmap title"
              required
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                required
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name}
                  </option>
                ))}
              </select>
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
              {mode === 'create' ? 'Create Roadmap' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RoadmapListPage({ initialRoadmaps = [] }: RoadmapListPageProps) {
  const [roadmaps] = useState<Roadmap[]>(initialRoadmaps);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  // Mock categories and subjects for filter
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "1", name: "Programming" },
    { id: "2", name: "Design" },
  ];

  const subjects = [
    { id: "all", name: "All Subjects" },
    { id: "1", name: "Frontend Development" },
    { id: "2", name: "UI/UX Design" },
  ];

  const filteredRoadmaps = roadmaps.filter((roadmap) => {
    const matchesSearch = roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         roadmap.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || roadmap.categoryId === selectedCategory;
    const matchesSubject = selectedSubject === "all" || roadmap.subjectId === selectedSubject;
    return matchesSearch && matchesCategory && matchesSubject;
  });

  const handleCreateRoadmap = (data: Partial<Roadmap>) => {
    console.log("Create roadmap:", data);
    setModalState({ type: 'none' });
  };

  const handleUpdateRoadmap = (data: Partial<Roadmap>) => {
    console.log("Update roadmap:", data);
    setModalState({ type: 'none' });
  };

  const handleDeleteRoadmap = () => {
    console.log("Delete roadmap:", modalState);
    setModalState({ type: 'none' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Roadmap Management</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Manage learning roadmaps, nodes, and content
          </p>
        </div>
        <button 
          onClick={() => setModalState({ type: 'create' })}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-6 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Create Roadmap
        </button>
      </div>

      {/* Search & Filters */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-neutral-200/60 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search roadmaps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-11 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
            >
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  {subj.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Roadmap List */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-neutral-200/60 shadow-sm overflow-hidden">
        {filteredRoadmaps.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
              <Search className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No roadmaps found</h3>
            <p className="text-sm text-neutral-600">
              {searchQuery || selectedCategory !== "all" || selectedSubject !== "all"
                ? "Try adjusting your filters or search query"
                : "Create your first roadmap to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Roadmap
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Nodes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Updated
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {filteredRoadmaps.map((roadmap) => (
                  <tr key={roadmap.id} className="group hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-neutral-900">{roadmap.title}</div>
                        <div className="text-sm text-neutral-600 line-clamp-1">
                          {roadmap.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {roadmap.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                        {roadmap.subjectName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {roadmap.totalNodes} nodes
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(roadmap.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin-roadmaps/${roadmap.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                        <button 
                          onClick={() => setModalState({ type: 'edit', roadmap })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button 
                          onClick={() => setModalState({ type: 'delete', id: roadmap.id, title: roadmap.title })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      {filteredRoadmaps.length > 0 && (
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <div>
            Showing <span className="font-medium text-neutral-900">{filteredRoadmaps.length}</span> of{" "}
            <span className="font-medium text-neutral-900">{roadmaps.length}</span> roadmaps
          </div>
        </div>
      )}

      {/* All Modals */}
      
      {/* Create/Edit Roadmap Modal */}
      <RoadmapFormModal
        isOpen={modalState.type === 'create' || modalState.type === 'edit'}
        onClose={() => setModalState({ type: 'none' })}
        onSubmit={modalState.type === 'create' ? handleCreateRoadmap : handleUpdateRoadmap}
        initialData={modalState.type === 'edit' ? modalState.roadmap : undefined}
        mode={modalState.type === 'create' ? 'create' : 'edit'}
      />

      {/* Delete Roadmap Confirmation */}
      {modalState.type === 'delete' && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModalState({ type: 'none' })}
          onConfirm={handleDeleteRoadmap}
          title="Delete Roadmap"
          description={
            <div>
              <p className="mb-3">
                Are you sure you want to delete this roadmap?
              </p>
              <div className="rounded-lg bg-neutral-100 p-3">
                <p className="font-medium text-neutral-900">{modalState.title}</p>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                This will also delete all nodes, resources, and tasks in this roadmap. This action cannot be undone.
              </p>
            </div>
          }
          confirmText="Delete Roadmap"
          variant="danger"
        />
      )}
    </div>
  );
}

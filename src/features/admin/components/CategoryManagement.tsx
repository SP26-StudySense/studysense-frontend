"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, X } from "lucide-react";
import { ConfirmationModal } from "@/shared/ui";

interface Subject {
  id: string;
  name: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
}

interface CategoryManagementProps {
  categories: Category[];
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onAddSubject?: (categoryId: string) => void;
  onEditSubject?: (categoryId: string, subject: Subject) => void;
  onDeleteSubject?: (categoryId: string, subjectId: string) => void;
}

type FormModalType = 
  | { type: 'category-create' }
  | { type: 'category-edit'; category: Category }
  | { type: 'subject-create'; categoryId: string }
  | { type: 'subject-edit'; categoryId: string; subject: Subject }
  | null;

type DeleteConfirmType =
  | { type: 'category'; id: string; name: string }
  | { type: 'subject'; categoryId: string; id: string; name: string }
  | null;

export function CategoryManagement({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}: CategoryManagementProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [formModal, setFormModal] = useState<FormModalType>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmType>(null);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategoryClick = () => {
    setFormModal({ type: 'category-create' });
  };

  const handleEditCategoryClick = (category: Category) => {
    setFormModal({ type: 'category-edit', category });
  };

  const handleDeleteCategoryClick = (category: Category) => {
    setDeleteConfirm({ type: 'category', id: category.id, name: category.name });
  };

  const handleAddSubjectClick = (categoryId: string) => {
    setFormModal({ type: 'subject-create', categoryId });
  };

  const handleEditSubjectClick = (categoryId: string, subject: Subject) => {
    setFormModal({ type: 'subject-edit', categoryId, subject });
  };

  const handleDeleteSubjectClick = (categoryId: string, subject: Subject) => {
    setDeleteConfirm({ 
      type: 'subject', 
      categoryId, 
      id: subject.id, 
      name: subject.name 
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formModal) return;

    if (formModal.type === 'category-create') {
      onAddCategory?.();
    } else if (formModal.type === 'category-edit') {
      onEditCategory?.(formModal.category);
    } else if (formModal.type === 'subject-create') {
      onAddSubject?.(formModal.categoryId);
    } else if (formModal.type === 'subject-edit') {
      onEditSubject?.(formModal.categoryId, formModal.subject);
    }

    setFormModal(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'category') {
      onDeleteCategory?.(deleteConfirm.id);
    } else {
      onDeleteSubject?.(deleteConfirm.categoryId, deleteConfirm.id);
    }

    setDeleteConfirm(null);
  };

  const getFormModalContent = () => {
    if (!formModal) return null;

    let title = '';
    let isCategory = false;
    let isEdit = false;
    let initialName = '';
    let initialDescription = '';

    if (formModal.type === 'category-create') {
      title = 'Create New Category';
      isCategory = true;
    } else if (formModal.type === 'category-edit') {
      title = 'Edit Category';
      isCategory = true;
      isEdit = true;
      initialName = formModal.category.name;
      initialDescription = formModal.category.description;
    } else if (formModal.type === 'subject-create') {
      title = 'Create New Subject';
    } else if (formModal.type === 'subject-edit') {
      title = 'Edit Subject';
      isEdit = true;
      initialName = formModal.subject.name;
      initialDescription = formModal.subject.description;
    }

    return { title, isCategory, isEdit, initialName, initialDescription };
  };

  const formModalContent = getFormModalContent();

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">
              Manage categories and subjects hierarchy
            </p>
          </div>
          <button
            onClick={handleAddCategoryClick}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div
                key={category.id}
                className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-neutral-200/60 p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="rounded-lg p-1 transition-colors hover:bg-neutral-100"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-neutral-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-neutral-600" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                      {category.subjects.length} subjects
                    </span>
                    <button
                      onClick={() => handleAddSubjectClick(category.id)}
                      className="rounded-lg p-2 text-[#00bae2] transition-all hover:bg-[#00bae2]/10"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditCategoryClick(category)}
                      className="rounded-lg p-2 text-neutral-600 transition-all hover:bg-neutral-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategoryClick(category)}
                      className="rounded-lg p-2 text-red-600 transition-all hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subjects List */}
                {isExpanded && (
                  <div className="divide-y divide-neutral-200/60">
                    {category.subjects.length === 0 ? (
                      <div className="px-12 py-8 text-center text-sm text-neutral-500">
                        No subjects yet. Click the + button to add one.
                      </div>
                    ) : (
                      category.subjects.map((subject) => (
                        <div
                          key={subject.id}
                          className="flex items-center justify-between px-12 py-4 transition-colors hover:bg-neutral-50/50"
                        >
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              {subject.name}
                            </h4>
                            <p className="text-sm text-neutral-600">
                              {subject.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleEditSubjectClick(category.id, subject)
                              }
                              className="rounded-lg p-2 text-neutral-600 transition-all hover:bg-neutral-100"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteSubjectClick(category.id, subject)
                              }
                              className="rounded-lg p-2 text-red-600 transition-all hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {categories.length === 0 && (
            <div className="rounded-2xl border border-neutral-200/60 bg-white/80 p-12 text-center shadow-sm backdrop-blur-xl">
              <p className="text-sm text-neutral-500">
                No categories yet. Click &quot;Add Category&quot; to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal (Create/Edit) */}
      {formModal && formModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
            onClick={() => setFormModal(null)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200/60 bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                {formModalContent.title}
              </h3>
              <button
                onClick={() => setFormModal(null)}
                className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  {formModalContent.isCategory ? 'Category' : 'Subject'} Name
                </label>
                <input
                  type="text"
                  defaultValue={formModalContent.initialName}
                  placeholder={`Enter ${formModalContent.isCategory ? 'category' : 'subject'} name`}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Description
                </label>
                <textarea
                  defaultValue={formModalContent.initialDescription}
                  placeholder="Enter description"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormModal(null)}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
                >
                  {formModalContent.isEdit ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          title={`Delete ${deleteConfirm.type === 'category' ? 'Category' : 'Subject'}`}
          description={
            <div>
              <p className="mb-3">
                Are you sure you want to delete this {deleteConfirm.type}?
              </p>
              <div className="rounded-lg bg-neutral-100 p-3">
                <p className="font-medium text-neutral-900">{deleteConfirm.name}</p>
                <p className="text-xs text-neutral-600">
                  {deleteConfirm.type === 'category' 
                    ? 'This will also delete all subjects under this category.'
                    : 'This action cannot be undone.'}
                </p>
              </div>
            </div>
          }
          confirmText="Delete"
          variant="danger"
        />
      )}
    </>
  );
}


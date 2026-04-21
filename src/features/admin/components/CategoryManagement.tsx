"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, X } from "lucide-react";
import { ConfirmationModal, Skeleton } from "@/shared/ui";

interface Subject {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  subjects: Subject[];
}

interface CategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
}

interface SubjectFormData {
  name: string;
  description: string;
  isActive: boolean;
}

interface CategoryManagementProps {
  categories: Category[];
  isLoading?: boolean;
  serverError?: string | null;
  onAddCategory?: (data: CategoryFormData) => Promise<void> | void;
  onEditCategory?: (categoryId: string, data: CategoryFormData) => Promise<void> | void;
  onDeleteCategory?: (categoryId: string) => Promise<void> | void;
  onAddSubject?: (categoryId: string, data: SubjectFormData) => Promise<void> | void;
  onEditSubject?: (
    categoryId: string,
    subjectId: string,
    data: SubjectFormData
  ) => Promise<void> | void;
  onDeleteSubject?: (categoryId: string, subjectId: string) => Promise<void> | void;
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
  isLoading = false,
  serverError = null,
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
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [isActiveInput, setIsActiveInput] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setNameInput("");
    setDescriptionInput("");
    setIsActiveInput(true);
    setFormModal({ type: 'category-create' });
  };

  const handleEditCategoryClick = (category: Category) => {
    setNameInput(category.name);
    setDescriptionInput(category.description);
    setIsActiveInput(category.isActive);
    setFormModal({ type: 'category-edit', category });
  };

  const handleDeleteCategoryClick = (category: Category) => {
    setDeleteConfirm({ type: 'category', id: category.id, name: category.name });
  };

  const handleAddSubjectClick = (categoryId: string) => {
    setNameInput("");
    setDescriptionInput("");
    setIsActiveInput(true);
    setFormModal({ type: 'subject-create', categoryId });
  };

  const handleEditSubjectClick = (categoryId: string, subject: Subject) => {
    setNameInput(subject.name);
    setDescriptionInput(subject.description);
    setIsActiveInput(subject.isActive);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formModal) return;

    setIsSubmitting(true);

    const trimmedName = nameInput.trim();
    const trimmedDescription = descriptionInput.trim();

    if (!trimmedName) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (formModal.type === 'category-create') {
        await onAddCategory?.({
          name: trimmedName,
          description: trimmedDescription,
          isActive: isActiveInput,
        });
      } else if (formModal.type === 'category-edit') {
        await onEditCategory?.(formModal.category.id, {
          name: trimmedName,
          description: trimmedDescription,
          isActive: isActiveInput,
        });
      } else if (formModal.type === 'subject-create') {
        await onAddSubject?.(formModal.categoryId, {
          name: trimmedName,
          description: trimmedDescription,
          isActive: isActiveInput,
        });
      } else if (formModal.type === 'subject-edit') {
        await onEditSubject?.(formModal.categoryId, formModal.subject.id, {
          name: trimmedName,
          description: trimmedDescription,
          isActive: isActiveInput,
        });
      }

      setFormModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setIsSubmitting(true);

    try {
      if (deleteConfirm.type === 'category') {
        await onDeleteCategory?.(deleteConfirm.id);
      } else {
        await onDeleteSubject?.(deleteConfirm.categoryId, deleteConfirm.id);
      }
    } finally {
      setIsSubmitting(false);
      setDeleteConfirm(null);
    }
  };

  const getFormModalContent = () => {
    if (!formModal) return null;

    let title = '';
    let isCategory = false;
    let isEdit = false;
    if (formModal.type === 'category-create') {
      title = 'Create New Category';
      isCategory = true;
    } else if (formModal.type === 'category-edit') {
      title = 'Edit Category';
      isCategory = true;
      isEdit = true;
    } else if (formModal.type === 'subject-create') {
      title = 'Create New Subject';
    } else if (formModal.type === 'subject-edit') {
      title = 'Edit Subject';
      isEdit = true;
    }

    return { title, isCategory, isEdit };
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
          {serverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`category-skeleton-${index}`}
                  className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between border-b border-neutral-200/60 p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-72" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
                    {!category.isActive && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        Inactive
                      </span>
                    )}
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
                            {!subject.isActive && (
                              <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                Inactive
                              </span>
                            )}
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

          {!isLoading && categories.length === 0 && (
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
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
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
                  value={descriptionInput}
                  onChange={(event) => setDescriptionInput(event.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={isActiveInput}
                  onChange={(event) => setIsActiveInput(event.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                Active {formModalContent.isCategory ? "category" : "subject"}
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormModal(null)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : formModalContent.isEdit
                      ? 'Save Changes'
                      : 'Create'}
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
          confirmText={isSubmitting ? "Deleting..." : "Delete"}
          variant="danger"
        />
      )}
    </>
  );
}


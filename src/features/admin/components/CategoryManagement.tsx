"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";

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

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600">
            Manage categories and subjects hierarchy
          </p>
        </div>
        <button
          onClick={onAddCategory}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#ff9bf5] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
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
                    onClick={() => onAddSubject?.(category.id)}
                    className="rounded-lg p-2 text-[#fec5fb] transition-all hover:bg-[#fec5fb]/10"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditCategory?.(category)}
                    className="rounded-lg p-2 text-neutral-600 transition-all hover:bg-neutral-100"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory?.(category.id)}
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
                              onEditSubject?.(category.id, subject)
                            }
                            className="rounded-lg p-2 text-neutral-600 transition-all hover:bg-neutral-100"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              onDeleteSubject?.(category.id, subject.id)
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
  );
}

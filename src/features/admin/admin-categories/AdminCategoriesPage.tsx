"use client";

import { CategoryManagement } from "../components";

export interface Category {
  id: string;
  name: string;
  description: string;
  subjects: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

interface AdminCategoriesPageProps {
  categories?: Category[];
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onAddSubject?: (categoryId: string) => void;
  onEditSubject?: (categoryId: string, subject: any) => void;
  onDeleteSubject?: (categoryId: string, subjectId: string) => void;
}

export function AdminCategoriesPage({
  categories = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}: AdminCategoriesPageProps) {
  return (
    <CategoryManagement
      categories={categories}
      onAddCategory={onAddCategory}
      onEditCategory={onEditCategory}
      onDeleteCategory={onDeleteCategory}
      onAddSubject={onAddSubject}
      onEditSubject={onEditSubject}
      onDeleteSubject={onDeleteSubject}
    />
  );
}

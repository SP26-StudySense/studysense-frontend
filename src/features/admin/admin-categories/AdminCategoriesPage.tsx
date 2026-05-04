"use client";

import { CategoryManagement } from "../components";
import { useLearningCategoryManager } from "./hooks";
import type { Category, CategoryFormData, SubjectFormData } from "./types";

interface AdminCategoriesPageProps {}

export function AdminCategoriesPage({}: AdminCategoriesPageProps) {
  const {
    categories: learningCategories,
    subjects: learningSubjects,
    isLoading,
    serverError,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubject,
    updateSubject,
    deleteSubject,
  } = useLearningCategoryManager();

  const categories: Category[] = learningCategories.map((category) => ({
    id: String(category.id),
    name: category.name,
    description: category.description ?? "",
    isActive: category.isActive,
    subjects: learningSubjects
      .filter((subject) => subject.categoryId === category.id)
      .map((subject) => ({
        id: String(subject.id),
        name: subject.name,
        description: subject.description ?? "",
        isActive: subject.isActive,
      })),
  }));

  const handleAddCategory = async (data: CategoryFormData) => {
    await createCategory({
      name: data.name,
      description: data.description || null,
      isActive: data.isActive,
    });
  };

  const handleEditCategory = async (categoryId: string, data: CategoryFormData) => {
    await updateCategory({
      id: Number(categoryId),
      name: data.name,
      description: data.description || null,
      isActive: data.isActive,
    });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory(Number(categoryId));
  };

  const handleAddSubject = async (categoryId: string, data: SubjectFormData) => {
    await createSubject({
      categoryId: Number(categoryId),
      name: data.name,
      description: data.description || null,
      isActive: data.isActive,
    });
  };

  const handleEditSubject = async (
    categoryId: string,
    subjectId: string,
    data: SubjectFormData
  ) => {
    await updateSubject({
      id: Number(subjectId),
      categoryId: Number(categoryId),
      name: data.name,
      description: data.description || null,
      isActive: data.isActive,
    });
  };

  const handleDeleteSubject = async (_categoryId: string, subjectId: string) => {
    await deleteSubject(Number(subjectId));
  };

  return (
    <CategoryManagement
      categories={categories}
      isLoading={isLoading}
      serverError={serverError}
      onAddCategory={handleAddCategory}
      onEditCategory={handleEditCategory}
      onDeleteCategory={handleDeleteCategory}
      onAddSubject={handleAddSubject}
      onEditSubject={handleEditSubject}
      onDeleteSubject={handleDeleteSubject}
    />
  );
}

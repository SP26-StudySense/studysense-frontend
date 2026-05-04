"use client";

import { useMemo, useState } from "react";
import {
  useCreateLearningCategory,
  useCreateLearningSubject,
  useDeleteLearningCategory,
  useDeleteLearningSubject,
  useLearningCategories,
  useLearningSubjects,
  useUpdateLearningCategory,
  useUpdateLearningSubject,
} from "../api";
import type {
  CreateLearningCategoryRequest,
  CreateLearningSubjectRequest,
  LearningCategoryDto,
  LearningSubjectDto,
  UpdateLearningCategoryRequest,
  UpdateLearningSubjectRequest,
} from "../types";

export interface UseLearningCategoryManagerReturn {
  categories: LearningCategoryDto[];
  subjects: LearningSubjectDto[];
  isLoading: boolean;
  serverError: string | null;
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  setPageIndex: (page: number) => void;
  createCategory: (payload: CreateLearningCategoryRequest) => Promise<void>;
  updateCategory: (payload: UpdateLearningCategoryRequest) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  createSubject: (payload: CreateLearningSubjectRequest) => Promise<void>;
  updateSubject: (payload: UpdateLearningSubjectRequest) => Promise<void>;
  deleteSubject: (id: number) => Promise<void>;
}

export function useLearningCategoryManager(): UseLearningCategoryManagerReturn {
  const [pageIndex, setPageIndex] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const pageSize = 100;

  const categoriesQuery = useLearningCategories(pageIndex, pageSize);
  const subjectsQuery = useLearningSubjects(1, 100);
  const createMutation = useCreateLearningCategory();
  const updateMutation = useUpdateLearningCategory();
  const deleteMutation = useDeleteLearningCategory();
  const createSubjectMutation = useCreateLearningSubject();
  const updateSubjectMutation = useUpdateLearningSubject();
  const deleteSubjectMutation = useDeleteLearningSubject();

  const categories = useMemo(
    () => categoriesQuery.data?.items ?? [],
    [categoriesQuery.data?.items]
  );
  const subjects = useMemo(
    () => subjectsQuery.data?.items ?? [],
    [subjectsQuery.data?.items]
  );

  const createCategory = async (payload: CreateLearningCategoryRequest) => {
    setServerError(null);

    try {
      await createMutation.mutateAsync(payload);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Failed to create category"
      );
      throw error;
    }
  };

  const updateCategory = async (payload: UpdateLearningCategoryRequest) => {
    setServerError(null);

    try {
      await updateMutation.mutateAsync(payload);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Failed to update category"
      );
      throw error;
    }
  };

  const deleteCategory = async (id: number) => {
    setServerError(null);

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Failed to delete category"
      );
      throw error;
    }
  };

  const createSubject = async (payload: CreateLearningSubjectRequest) => {
    setServerError(null);

    try {
      await createSubjectMutation.mutateAsync(payload);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Failed to create subject"
      );
      throw error;
    }
  };

  const updateSubject = async (payload: UpdateLearningSubjectRequest) => {
    setServerError(null);

    try {
      await updateSubjectMutation.mutateAsync(payload);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Failed to update subject"
      );
      throw error;
    }
  };

  const deleteSubject = async (id: number) => {
    setServerError(null);

    try {
      await deleteSubjectMutation.mutateAsync(id);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Failed to delete subject"
      );
      throw error;
    }
  };

  return {
    categories,
    subjects,
    isLoading: categoriesQuery.isLoading || subjectsQuery.isLoading,
    serverError,
    pageIndex,
    totalPages: categoriesQuery.data?.totalPages ?? 0,
    totalCount: categoriesQuery.data?.totalCount ?? 0,
    setPageIndex,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}

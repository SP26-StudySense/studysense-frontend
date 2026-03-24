import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/lib";
import {
  createLearningCategory,
  createLearningSubject,
  deleteLearningCategory,
  deleteLearningSubject,
  learningCategoryQueryKeys,
  learningSubjectQueryKeys,
  updateLearningCategory,
  updateLearningSubject,
} from "./api";
import type {
  CreateLearningCategoryRequest,
  CreateLearningSubjectRequest,
  UpdateLearningCategoryRequest,
  UpdateLearningSubjectRequest,
} from "../types";

export function useCreateLearningCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLearningCategoryRequest) =>
      createLearningCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningCategoryQueryKeys.lists() });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}

export function useCreateLearningSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLearningSubjectRequest) =>
      createLearningSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningSubjectQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: learningCategoryQueryKeys.lists() });
      toast.success("Subject created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create subject");
    },
  });
}

export function useUpdateLearningCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLearningCategoryRequest) =>
      updateLearningCategory(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: learningCategoryQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: learningCategoryQueryKeys.detail(variables.id),
      });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}

export function useUpdateLearningSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLearningSubjectRequest) =>
      updateLearningSubject(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: learningSubjectQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: learningCategoryQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: learningSubjectQueryKeys.detail(variables.id),
      });
      toast.success("Subject updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update subject");
    },
  });
}

export function useDeleteLearningCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteLearningCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningCategoryQueryKeys.lists() });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });
}

export function useDeleteLearningSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteLearningSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningSubjectQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: learningCategoryQueryKeys.lists() });
      toast.success("Subject deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete subject");
    },
  });
}

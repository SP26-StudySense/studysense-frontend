import type { PaginatedResponse } from "@/shared/types/api";

export interface LearningCategoryDto {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface LearningSubjectDto {
  id: number;
  categoryId: number;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface GetAllLearningCategoriesParams {
  pageIndex: number;
  pageSize: number;
}

export interface GetAllLearningCategoriesResult {
  categories: PaginatedResponse<LearningCategoryDto>;
}

export interface GetAllLearningSubjectsParams {
  pageIndex: number;
  pageSize: number;
  categoryId?: number;
}

export interface GetAllLearningSubjectsResult {
  subjects: PaginatedResponse<LearningSubjectDto>;
}

export interface CreateLearningCategoryRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface UpdateLearningCategoryRequest {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface CreateLearningSubjectRequest {
  categoryId: number;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface UpdateLearningSubjectRequest {
  id: number;
  categoryId: number;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface GenericResult<T> {
  success: boolean;
  message?: string | null;
  data?: T | null;
}

export type CreateLearningCategoryResult = GenericResult<LearningCategoryDto>;
export type UpdateLearningCategoryResult = GenericResult<LearningCategoryDto>;
export type DeleteLearningCategoryResult = GenericResult<object>;
export type CreateLearningSubjectResult = GenericResult<LearningSubjectDto>;
export type UpdateLearningSubjectResult = GenericResult<LearningSubjectDto>;
export type DeleteLearningSubjectResult = GenericResult<object>;

export interface Subject {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  subjects: Subject[];
}

export interface CategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
}

export interface SubjectFormData {
  name: string;
  description: string;
  isActive: boolean;
}

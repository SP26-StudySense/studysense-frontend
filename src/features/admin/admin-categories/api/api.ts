import { del, get, post, put } from "@/shared/api/client";
import type {
  CreateLearningCategoryRequest,
  CreateLearningCategoryResult,
  CreateLearningSubjectRequest,
  CreateLearningSubjectResult,
  DeleteLearningCategoryResult,
  DeleteLearningSubjectResult,
  GetAllLearningCategoriesParams,
  GetAllLearningCategoriesResult,
  GetAllLearningSubjectsParams,
  GetAllLearningSubjectsResult,
  LearningCategoryDto,
  LearningSubjectDto,
  UpdateLearningCategoryRequest,
  UpdateLearningCategoryResult,
  UpdateLearningSubjectRequest,
  UpdateLearningSubjectResult,
} from "../types";
import type { PaginatedResponse } from "@/shared/types/api";

type GenericResultShape<T> = {
  success: boolean;
  message?: string | null;
  data?: T | null;
};

function isGenericResultShape<T>(value: unknown): value is GenericResultShape<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.prototype.hasOwnProperty.call(value, "success")
  );
}

function extractMutationData<T>(
  response: GenericResultShape<T> | T,
  fallbackErrorMessage: string
): T {
  if (isGenericResultShape<T>(response)) {
    if (!response.success) {
      throw new Error(response.message || fallbackErrorMessage);
    }

    if (response.data == null) {
      throw new Error(response.message || fallbackErrorMessage);
    }

    return response.data;
  }

  return response;
}

function ensureMutationSuccess(
  response: GenericResultShape<object> | object,
  fallbackErrorMessage: string
): void {
  if (isGenericResultShape<object>(response) && !response.success) {
    throw new Error(response.message || fallbackErrorMessage);
  }
}

export const learningCategoryQueryKeys = {
  all: ["admin-learning-categories"] as const,
  lists: () => [...learningCategoryQueryKeys.all, "list"] as const,
  list: (pageIndex: number, pageSize: number) =>
    [...learningCategoryQueryKeys.lists(), { pageIndex, pageSize }] as const,
  detail: (id: number) => [...learningCategoryQueryKeys.all, "detail", id] as const,
};

export const learningSubjectQueryKeys = {
  all: ["admin-learning-subjects"] as const,
  lists: () => [...learningSubjectQueryKeys.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, categoryId?: number) =>
    [...learningSubjectQueryKeys.lists(), { pageIndex, pageSize, categoryId }] as const,
  detail: (id: number) => [...learningSubjectQueryKeys.all, "detail", id] as const,
};

export async function getAllLearningCategories(
  params: GetAllLearningCategoriesParams
): Promise<PaginatedResponse<LearningCategoryDto>> {
  const result = await get<GetAllLearningCategoriesResult>("/learning-categories", {
    params,
  });

  return result.categories;
}

export async function createLearningCategory(
  payload: CreateLearningCategoryRequest
): Promise<LearningCategoryDto> {
  const result = await post<CreateLearningCategoryResult | LearningCategoryDto>(
    "/learning-categories",
    payload
  );

  return extractMutationData(result, "Failed to create learning category");
}

export async function updateLearningCategory(
  payload: UpdateLearningCategoryRequest
): Promise<LearningCategoryDto> {
  const result = await put<UpdateLearningCategoryResult | LearningCategoryDto>(
    `/learning-categories/${payload.id}`,
    payload
  );

  return extractMutationData(result, "Failed to update learning category");
}

export async function deleteLearningCategory(id: number): Promise<void> {
  const result = await del<DeleteLearningCategoryResult | object>(
    `/learning-categories/${id}`
  );

  ensureMutationSuccess(result, "Failed to delete learning category");
}

export async function getAllLearningSubjects(
  params: GetAllLearningSubjectsParams
): Promise<PaginatedResponse<LearningSubjectDto>> {
  const result = await get<GetAllLearningSubjectsResult>("/learning-subjects", {
    params,
  });

  return result.subjects;
}

export async function createLearningSubject(
  payload: CreateLearningSubjectRequest
): Promise<LearningSubjectDto> {
  const result = await post<CreateLearningSubjectResult | LearningSubjectDto>(
    "/learning-subjects",
    payload
  );

  return extractMutationData(result, "Failed to create learning subject");
}

export async function updateLearningSubject(
  payload: UpdateLearningSubjectRequest
): Promise<LearningSubjectDto> {
  const result = await put<UpdateLearningSubjectResult | LearningSubjectDto>(
    `/learning-subjects/${payload.id}`,
    payload
  );

  return extractMutationData(result, "Failed to update learning subject");
}

export async function deleteLearningSubject(id: number): Promise<void> {
  const result = await del<DeleteLearningSubjectResult | object>(
    `/learning-subjects/${id}`
  );

  ensureMutationSuccess(result, "Failed to delete learning subject");
}

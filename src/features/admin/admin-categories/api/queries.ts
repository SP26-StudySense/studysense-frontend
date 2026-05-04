import { useQuery } from "@tanstack/react-query";
import {
  getAllLearningCategories,
  getAllLearningSubjects,
  learningCategoryQueryKeys,
  learningSubjectQueryKeys,
} from "./api";

export function useLearningCategories(pageIndex: number, pageSize: number) {
  return useQuery({
    queryKey: learningCategoryQueryKeys.list(pageIndex, pageSize),
    queryFn: () => getAllLearningCategories({ pageIndex, pageSize }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}

export function useLearningSubjects(
  pageIndex: number,
  pageSize: number,
  categoryId?: number
) {
  return useQuery({
    queryKey: learningSubjectQueryKeys.list(pageIndex, pageSize, categoryId),
    queryFn: () => getAllLearningSubjects({ pageIndex, pageSize, categoryId }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Content Manager Queries
 * React Query hooks for GET operations
 */

import { keepPreviousData, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import * as api from './api';
import { cmQueryKeys } from './api';
import type {
  GetRoadmapsParams,
  GetManagerRoadmapsParams,
  GetContentManagerStatsParams,
  GetRoadmapsResponse,
  GetManagerSubjectsResponse,
  GetContentManagerStatsResponse,
  RoadmapDetail,
  NodeContent,
  GenerateRoadmapResponse,
  GenerateRoadmapRequest,
  GetQuizzesByNodeResponse,
  GetQuizQuestionsByQuizIdResponse,
  GetQuizByIdResponse,
} from './types';

// ==================== Query Hooks ====================

/**
 * Get roadmaps list with pagination and filters
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useRoadmaps({
 *   pageIndex: 1,
 *   pageSize: 10,
 *   subjectId: 1,
 *   status: RoadmapStatus.Active,
 *   q: 'python'
 * });
 * ```
 */
export function useRoadmaps(
  params: GetRoadmapsParams,
  options?: Omit<UseQueryOptions<GetRoadmapsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: cmQueryKeys.roadmapsList(params),
    queryFn: () => api.getRoadmaps(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Get roadmap detail with full graph (metadata + nodes + edges)
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useRoadmapDetail(123);
 * 
 * if (data?.success) {
 *   const { roadmap, nodes, edges } = data.data;
 * }
 * ```
 */
export function useRoadmapDetail(
  roadmapId: number,
  options?: Omit<UseQueryOptions<RoadmapDetail>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: cmQueryKeys.roadmapDetail(roadmapId),
    queryFn: () => api.getRoadmapDetail(roadmapId),
    enabled: !!roadmapId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get roadmaps created by current content manager
 * 
 * @example
 * ```tsx
 * const { data } = useManagerRoadmaps({
 *   pageIndex: 1,
 *   pageSize: 20,
 *   status: RoadmapStatus.Draft
 * });
 * ```
 */
export function useManagerRoadmaps(
  params: GetManagerRoadmapsParams,
  options?: Omit<UseQueryOptions<GetRoadmapsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: cmQueryKeys.managerRoadmaps(params),
    queryFn: () => api.getManagerRoadmaps(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useSubjectsByContentManager(
  options?: Omit<UseQueryOptions<GetManagerSubjectsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: cmQueryKeys.managerSubjects(),
    queryFn: () => api.getSubjectsByContentManager(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useContentManagerStats(
  params?: GetContentManagerStatsParams,
  options?: Omit<UseQueryOptions<GetContentManagerStatsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: cmQueryKeys.managerStats(params),
    queryFn: () => api.getContentManagerStats(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Get all contents of a specific node
 * 
 * @example
 * ```tsx
 * const { data } = useNodeContents(123, 456);
 * 
 * if (data?.success) {
 *   const contents = data.data; // NodeContent[]
 * }
 * ```
 */
export function useNodeContents(
  roadmapId: number,
  nodeId: number,
  options?: Omit<UseQueryOptions<NodeContent[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: cmQueryKeys.nodeContents(roadmapId, nodeId),
    queryFn: () => api.getNodeContents({ roadmapId, nodeId }),
    enabled: !!roadmapId && !!nodeId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

 export function useGenerateRoadmapAI(
  request: GenerateRoadmapRequest,
  options?: Omit<UseQueryOptions<GenerateRoadmapResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['generateRoadmapAI', request],
    queryFn: () => api.generateRoadmapAI(request),
      enabled: !!request.message && !!request.subjectId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useQuizzesByNode(
  nodeId: number,
  pageIndex = 1,
  pageSize = 10,
  options?: Omit<UseQueryOptions<GetQuizzesByNodeResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: cmQueryKeys.quizzesByNode(nodeId),
    queryFn: () => api.getQuizzesByNode({ roadmapNodeId: nodeId, pageIndex, pageSize }),
    enabled: !!nodeId,
    staleTime: 0,
    ...options,
  });
}

export function useQuizQuestionsByQuizId(
  quizId: number,
  options?: Omit<UseQueryOptions<GetQuizQuestionsByQuizIdResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: cmQueryKeys.quizQuestionsByQuiz(quizId),
    queryFn: () => api.getQuizQuestionsByQuizId({ quizId }),
    enabled: !!quizId,
    staleTime: 0,
    ...options,
  });
}

export function useQuizById(
  quizId: number,
  options?: Omit<UseQueryOptions<GetQuizByIdResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: cmQueryKeys.quizById(quizId),
    queryFn: () => api.getQuizById({ quizId }),
    enabled: Number.isFinite(quizId) && quizId > 0,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
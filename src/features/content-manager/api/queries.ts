/**
 * Content Manager Queries
 * React Query hooks for GET operations
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import * as api from './api';
import { cmQueryKeys } from './api';
import type {
  GetRoadmapsParams,
  GetRoadmapsResponse,
  GetRoadmapDetailResponse,
  GetNodeContentsResponse,
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
  options?: Omit<UseQueryOptions<GetRoadmapDetailResponse>, 'queryKey' | 'queryFn'>
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
  params: Omit<GetRoadmapsParams, 'subjectId'>,
  options?: Omit<UseQueryOptions<GetRoadmapsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: cmQueryKeys.managerRoadmaps(params),
    queryFn: () => api.getManagerRoadmaps(params),
    staleTime: 5 * 60 * 1000,
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
  options?: Omit<UseQueryOptions<GetNodeContentsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: cmQueryKeys.nodeContents(roadmapId, nodeId),
    queryFn: () => api.getNodeContents({ roadmapId, nodeId }),
    enabled: !!roadmapId && !!nodeId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
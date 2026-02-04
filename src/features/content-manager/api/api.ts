/**
 * Content Manager API Functions
 * Core API calls without React Query
 */

import { get, post, put, del } from '@/shared/api/client';
import type {
  // Request types
  GetRoadmapsParams,
  GetNodeContentsRequest,
  CreateRoadmapGraphRequest,
  SyncRoadmapGraphRequest,
  DeleteRoadmapRequest,
  DeleteNodeRequest,
  DeleteEdgeRequest,
  DeleteContentRequest,
  // Response types
  GetRoadmapsResponse,
  GetRoadmapDetailResponse,
  GetNodeContentsResponse,
  CreateRoadmapGraphResponse,
  SyncRoadmapGraphResponse,
  DeleteRoadmapResponse,
  DeleteNodeResponse,
  DeleteEdgeResponse,
  DeleteContentResponse,
} from './types';

// ==================== Utility Functions ====================

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ==================== Query Keys ====================

export const cmQueryKeys = {
  all: ['content-manager'] as const,
  roadmaps: () => [...cmQueryKeys.all, 'roadmaps'] as const,
  roadmapsList: (params: GetRoadmapsParams) =>
    [...cmQueryKeys.roadmaps(), 'list', params] as const,
  roadmapDetail: (id: number) =>
    [...cmQueryKeys.roadmaps(), 'detail', id] as const,
  managerRoadmaps: (params: Omit<GetRoadmapsParams, 'subjectId'>) =>
    [...cmQueryKeys.roadmaps(), 'manager', params] as const,
  nodeContents: (roadmapId: number, nodeId: number) =>
    [...cmQueryKeys.all, 'contents', roadmapId, nodeId] as const,
};

// ==================== API Functions ====================

// Roadmap APIs
export async function getRoadmaps(
  params: GetRoadmapsParams
): Promise<GetRoadmapsResponse> {
  const queryString = buildQueryString(params);
  return get<GetRoadmapsResponse>(`/roadmaps${queryString}`);
}

export async function getRoadmapDetail(
  roadmapId: number
): Promise<GetRoadmapDetailResponse> {
  return get<GetRoadmapDetailResponse>(`/roadmaps/${roadmapId}`);
}

export async function getManagerRoadmaps(
  params: Omit<GetRoadmapsParams, 'subjectId'>
): Promise<GetRoadmapsResponse> {
  const queryString = buildQueryString(params);
  return get<GetRoadmapsResponse>(`/roadmaps/manager${queryString}`);
}

export async function deleteRoadmap(
  request: DeleteRoadmapRequest
): Promise<DeleteRoadmapResponse> {
  return del<DeleteRoadmapResponse>(`/roadmaps/${request.roadmapId}`);
}

// Node APIs
export async function deleteNode(
  request: DeleteNodeRequest
): Promise<DeleteNodeResponse> {
  return del<DeleteNodeResponse>(
    `/roadmaps/${request.roadmapId}/nodes/${request.nodeId}`
  );
}

// Edge APIs
export async function deleteEdge(
  request: DeleteEdgeRequest
): Promise<DeleteEdgeResponse> {
  return del<DeleteEdgeResponse>(
    `/roadmaps/${request.roadmapId}/edges/${request.edgeId}`
  );
}

// Content APIs
export async function getNodeContents(
  request: GetNodeContentsRequest
): Promise<GetNodeContentsResponse> {
  return get<GetNodeContentsResponse>(
    `/roadmaps/${request.roadmapId}/nodes/${request.nodeId}/contents`
  );
}

export async function deleteContent(
  request: DeleteContentRequest
): Promise<DeleteContentResponse> {
  return del<DeleteContentResponse>(
    `/roadmaps/${request.roadmapId}/nodes/${request.nodeId}/contents/${request.contentId}`
  );
}

// Graph APIs
export async function createRoadmapGraph(
  request: CreateRoadmapGraphRequest
): Promise<CreateRoadmapGraphResponse> {
  return post<CreateRoadmapGraphResponse>('/roadmaps/graph', request);
}

export async function syncRoadmapGraph(
  request: SyncRoadmapGraphRequest
): Promise<SyncRoadmapGraphResponse> {
  const { roadmapId, ...graphData } = request;
  return put<SyncRoadmapGraphResponse>(
    `/roadmaps/${roadmapId}/graph`,
    graphData
  );
}
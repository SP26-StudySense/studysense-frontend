/**
 * Roadmap API Queries
 * React Query hooks for fetching roadmap data
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import type {
    GetAllLearningCategoriesParams,
    GetAllLearningCategoriesResult,
    GetAllLearningSubjectsParams,
    GetAllLearningSubjectsResult,
    GetAllRoadmapsResult,
    GenericResponse,
    RoadmapGraphDTO,
    RoadmapsQueryParams,
    NodeContentItemDTO,
} from './types';

/**
 * Fetch paginated list of roadmaps
 */
export function useRoadmaps(params: RoadmapsQueryParams = {}) {
    const {
        pageIndex = 1,
        pageSize = 20,
        subjectId,
        q,
        status,
        version,
        isLatest,
    } = params;

    return useQuery({
        queryKey: ['roadmaps', 'list', { pageIndex, pageSize, subjectId, q, status, version, isLatest }],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            searchParams.set('pageIndex', String(pageIndex));
            searchParams.set('pageSize', String(pageSize));

            if (subjectId !== undefined) searchParams.set('subjectId', String(subjectId));
            if (q) searchParams.set('q', q);
            if (status) searchParams.set('status', status);
            if (version !== undefined) searchParams.set('version', String(version));
            if (isLatest !== undefined) searchParams.set('isLatest', String(isLatest));

            const url = `${endpoints.roadmaps.base}?${searchParams.toString()}`;
            return get<GetAllRoadmapsResult>(url);
        },
    });
}

export function useLearningCategories(params: GetAllLearningCategoriesParams = { pageIndex: 1, pageSize: 100 }) {
    const { pageIndex = 1, pageSize = 100 } = params;

    return useQuery({
        queryKey: ['roadmaps', 'learning-categories', { pageIndex, pageSize }],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            searchParams.set('pageIndex', String(pageIndex));
            searchParams.set('pageSize', String(pageSize));

            return get<GetAllLearningCategoriesResult>(`/learning-categories?${searchParams.toString()}`);
        },
    });
}

export function useLearningSubjects(params: GetAllLearningSubjectsParams = { pageIndex: 1, pageSize: 100 }) {
    const { pageIndex = 1, pageSize = 100, categoryId } = params;

    return useQuery({
        queryKey: ['roadmaps', 'learning-subjects', { pageIndex, pageSize, categoryId }],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            searchParams.set('pageIndex', String(pageIndex));
            searchParams.set('pageSize', String(pageSize));

            if (categoryId !== undefined) {
                searchParams.set('categoryId', String(categoryId));
            }

            return get<GetAllLearningSubjectsResult>(`/learning-subjects?${searchParams.toString()}`);
        },
        enabled: categoryId !== undefined,
    });
}

/**
 * Fetch single roadmap with full graph (nodes + edges)
 * Note: client.ts automatically unwraps GenericResponse, so we receive RoadmapGraphDTO directly
 */
export function useRoadmapGraph(roadmapId: number | string | null) {
    return useQuery({
        queryKey: queryKeys.roadmaps.detail(String(roadmapId)),
        queryFn: async () => {
            // client.get() already unwraps GenericResponse<T>.data
            const data = await get<RoadmapGraphDTO>(
                endpoints.roadmaps.byId(String(roadmapId))
            );
            if (!data) {
                throw new Error('Roadmap not found');
            }
            return data;
        },
        enabled: !!roadmapId,
    });
}

/**
 * Fetch node content details (description, resources, etc.)
 */
export function useNodeContents(
    roadmapId: number | string | null,
    nodeId: number | string | null,
    options?: { sanitizeUrls?: boolean }
) {
    return useQuery({
        queryKey: ['roadmaps', 'nodeContents', roadmapId, nodeId, options?.sanitizeUrls ?? false],
        queryFn: async () => {
            const data = await get<NodeContentItemDTO[]>(
                endpoints.roadmaps.nodeContents(String(roadmapId), String(nodeId)),
                options?.sanitizeUrls
                    ? {
                          headers: {
                              'x-sanitize-node-content-url': '1',
                          },
                      }
                    : undefined
            );
            return data ?? [];
        },
        enabled: !!roadmapId && !!nodeId,
    });
}

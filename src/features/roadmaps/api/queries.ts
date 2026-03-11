/**
 * Roadmap API Queries
 * React Query hooks for fetching roadmap data
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import type {
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
export function useNodeContents(roadmapId: number | string | null, nodeId: number | string | null) {
    return useQuery({
        queryKey: ['roadmaps', 'nodeContents', roadmapId, nodeId],
        queryFn: async () => {
            const data = await get<NodeContentItemDTO[]>(
                endpoints.roadmaps.nodeContents(String(roadmapId), String(nodeId))
            );
            return data ?? [];
        },
        enabled: !!roadmapId && !!nodeId,
    });
}

/**
 * Roadmap API Types
 * DTOs matching backend response format
 */

// Enums matching backend
export enum RoadmapStatus {
    Draft = 0,
    Active = 1,
    Archived = 2,
}

export enum NodeDifficulty {
    Beginner = 0,
    Intermediate = 1,
    Advanced = 2,
}

export enum EdgeType {
    Prerequisite = 0,
    Recommended = 1,
    Next = 2,
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    items: T[];
}

// Roadmap list item (from GET /api/roadmaps)
export interface RoadmapListItemDTO {
    id: number;
    subjectId: number;
    title: string;
    description: string | null;
    version: number;
    isLatest: boolean;
    status: string | null;
}

// Roadmap basic info
export interface RoadmapBasicDTO {
    id: number;
    subjectId: number;
    title: string;
    description: string | null;
    createdById: string | null;
    createdAt: string;
    version: number;
    isLatest: boolean;
}

// Roadmap node
export interface RoadmapNodeDTO {
    id: number;
    roadmapId: number;
    title: string;
    description: string | null;
    difficulty: NodeDifficulty | string | null; // API may return string like "Beginner"
    orderNo: number | null;
}

// Roadmap edge
export interface RoadmapEdgeDTO {
    id: number;
    roadmapId: number;
    fromNodeId: number;
    toNodeId: number;
    edgeType: EdgeType;
    orderNo: number | null;
}

// Full roadmap graph (from GET /api/roadmaps/{id})
export interface RoadmapGraphDTO {
    roadmap: RoadmapBasicDTO;
    nodes: RoadmapNodeDTO[];
    edges: RoadmapEdgeDTO[];
}

// Generic response wrapper
export interface GenericResponse<T> {
    success: boolean;
    message: string | null;
    data: T | null;
}

// API response for roadmap list
export interface GetAllRoadmapsResult {
    roadmaps: PaginatedResponse<RoadmapListItemDTO>;
}

// Query params for fetching roadmaps
export interface RoadmapsQueryParams {
    pageIndex?: number;
    pageSize?: number;
    subjectId?: number;
    q?: string;
    status?: string;
    version?: number;
    isLatest?: boolean;
}

// Node content item (from GET /api/roadmaps/{roadmapId}/nodes/{nodeId}/contents)
export interface NodeContentItemDTO {
    id: number;
    nodeId: number;
    contentType: 'Course' | 'Exercise' | 'Video' | 'Article' | 'Documentation' | string;
    title: string;
    url: string | null;
    description: string | null;
    estimatedMinutes: number | null;
    difficulty: string | null;
    orderNo: number | null;
    isRequired: boolean;
}

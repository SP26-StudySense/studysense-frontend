/**
 * Content Manager API Types
 * Centralized types for roadmap management
 */

// ==================== Enums ====================

export enum NodeDifficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum EdgeType {
  Prerequisite = 'Prerequisite',
  Recommended = 'Recommended',
  Next = 'Next',
}

export enum ContentType {
  Video = 'Video',
  Article = 'Article',
  Book = 'Book',
  Course = 'Course',
  Exercise = 'Exercise',
  Quiz = 'Quiz',
  Project = 'Project',
}

export enum RoadmapStatus {
  Draft = 'Draft',
  Active = 'Active',
  Archived = 'Archived',
}

// ==================== Core Entities ====================

export interface LearningSubject {
  id: number;
  name: string;
}

/**
 * Roadmap metadata only (without nodes/edges)
 */
export interface RoadmapMetadata {
  id: number;
  subjectId: number;
  title: string;
  description: string;
  version: number;
  status: RoadmapStatus;
  createdAt: string;
  updatedAt: string;
  subject?: LearningSubject;
}

/**
 * Roadmap Node
 * Can be used for both create/update operations and display
 */
export interface RoadmapNode {
  id?: number | null; // null for new nodes, number for existing
  clientId?: string; // Client-side temporary ID for new nodes
  roadmapId?: number; // Optional, inferred from context
  title: string;
  description: string;
  difficulty: NodeDifficulty;
  estimatedHours: number;
  orderNo?: number;
  contents?: NodeContent[]; // Nested contents
}

/**
 * Roadmap Edge
 * Can be used for both create/update operations and display
 */
export interface RoadmapEdge {
  id?: number | null; // null for new edges, number for existing
  clientId?: string; // Client-side temporary ID for new edges
  roadmapId?: number; // Optional, inferred from context
  // Support both database IDs and client IDs for flexibility
  fromNodeId?: number;
  fromNodeClientId?: string;
  toNodeId?: number;
  toNodeClientId?: string;
  edgeType: EdgeType;
  label?: string;
  orderNo?: number;
}

/**
 * Node Content
 * Can be used for both create/update operations and display
 */
export interface NodeContent {
  id?: number | null; // null for new content, number for existing
  clientId?: string; // Client-side temporary ID
  nodeId?: number; // Optional, inferred from context
  contentType: ContentType;
  title: string;
  description: string;
  contentUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  orderNo?: number;
  isRequired: boolean;
}

/**
 * Complete Roadmap Detail
 * Unified type for display, create, and sync operations
 * 
 * Usage:
 * - Display: Received from GET /roadmaps/{id}
 * - Create: Used in POST /roadmaps/graph (set id=null for new entities)
 * - Sync: Used in PUT /roadmaps/{id}/graph (id=number for update, id=null for create)
 */
export interface RoadmapDetail {
  roadmap: RoadmapMetadata | {
    id?: number | null;
    subjectId: number;
    title: string;
    description?: string;
    status?: RoadmapStatus;
  };
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

// ==================== Request Types ====================

/**
 * Get roadmaps list params
 */
export interface GetRoadmapsParams {
  pageIndex: number;
  pageSize: number;
  subjectId?: number;
  status?: RoadmapStatus;
  version?: number;
  q?: string; // Search query
  isLatest?: boolean;
}

/**
 * Create roadmap graph request
 * POST /api/roadmaps/graph
 */
export interface CreateRoadmapGraphRequest {
  roadmap: {
    subjectId: number;
    title: string;
    description?: string;
  };
  nodes: RoadmapNode[]; // Use id=null or omit id
  edges: RoadmapEdge[]; // Use id=null or omit id
}

/**
 * Sync roadmap graph request
 * PUT /api/roadmaps/{roadmapId}/graph
 * 
 * Sync Logic:
 * - id is number: Update existing
 * - id is null: Create new
 * - Not in payload: Delete
 */
export interface SyncRoadmapGraphRequest {
  roadmapId: number;
  roadmap?: {
    title?: string;
    description?: string;
    status?: RoadmapStatus;
  };
  nodes: RoadmapNode[]; // Include all nodes you want to keep
  edges: RoadmapEdge[]; // Include all edges you want to keep
}

/**
 * Delete roadmap request
 * DELETE /api/roadmaps/{roadmapId}
 */
export interface DeleteRoadmapRequest {
  roadmapId: number;
}

/**
 * Delete node request
 * DELETE /api/roadmaps/{roadmapId}/nodes/{nodeId}
 */
export interface DeleteNodeRequest {
  roadmapId: number;
  nodeId: number;
}

/**
 * Delete edge request
 * DELETE /api/roadmaps/{roadmapId}/edges/{edgeId}
 */
export interface DeleteEdgeRequest {
  roadmapId: number;
  edgeId: number;
}

/**
 * Delete content request
 * DELETE /api/roadmaps/{roadmapId}/nodes/{nodeId}/contents/{contentId}
 */
export interface DeleteContentRequest {
  roadmapId: number;
  nodeId: number;
  contentId: number;
}

/**
 * Get node contents request
 * GET /api/roadmaps/{roadmapId}/nodes/{nodeId}/contents
 */
export interface GetNodeContentsRequest {
  roadmapId: number;
  nodeId: number;
}

// ==================== Response Types ====================

/**
 * Generic success response
 */
export interface GenericSuccessResponse {
  success: boolean;
  message: string;
}

/**
 * Get roadmaps list response (paginated)
 */
export interface GetRoadmapsResponse {
  success: boolean;
  data: RoadmapMetadata[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Get roadmap detail response
 * GET /api/roadmaps/{id}
 */
export interface GetRoadmapDetailResponse {
  success: boolean;
  data: RoadmapDetail;
}

/**
 * Create roadmap graph response
 * POST /api/roadmaps/graph
 */
export interface CreateRoadmapGraphResponse {
  success: boolean;
  roadmapId: number;
  nodeIdMap: Record<string, number>; // clientId -> databaseId
  edgeIdMap: Record<string, number>; // clientId -> databaseId
  contentIdMap: Record<string, number>; // clientId -> databaseId
  message: string;
}

/**
 * Sync roadmap graph response
 * PUT /api/roadmaps/{roadmapId}/graph
 */
export interface SyncRoadmapGraphResponse {
  success: boolean;
  roadmapId: number;
  // Statistics
  nodesAdded: number;
  nodesUpdated: number;
  nodesDeleted: number;
  edgesAdded: number;
  edgesUpdated: number;
  edgesDeleted: number;
  contentsAdded: number;
  contentsUpdated: number;
  contentsDeleted: number;
  // ID mappings for new entities
  nodeIdMap: Record<string, number>;
  edgeIdMap: Record<string, number>;
  contentIdMap: Record<string, number>;
  message: string;
}

/**
 * Get node contents response
 * GET /api/roadmaps/{roadmapId}/nodes/{nodeId}/contents
 */
export interface GetNodeContentsResponse {
  success: boolean;
  data: NodeContent[];
}

/**
 * Delete roadmap response
 * DELETE /api/roadmaps/{roadmapId}
 * Returns 204 No Content (void)
 */
export type DeleteRoadmapResponse = void;

/**
 * Delete node response
 * DELETE /api/roadmaps/{roadmapId}/nodes/{nodeId}
 * Returns 204 No Content (void)
 */
export type DeleteNodeResponse = void;

/**
 * Delete edge response
 * DELETE /api/roadmaps/{roadmapId}/edges/{edgeId}
 * Returns 204 No Content (void)
 */
export type DeleteEdgeResponse = void;

/**
 * Delete content response
 * DELETE /api/roadmaps/{roadmapId}/nodes/{nodeId}/contents/{contentId}
 * Returns 204 No Content (void)
 */
export type DeleteContentResponse = void;

// ==================== Helper Types ====================

/**
 * Roadmap form data (for creating new roadmap)
 */
export type CreateRoadmapFormData = CreateRoadmapGraphRequest;

/**
 * Roadmap form data (for updating existing roadmap)
 */
export type UpdateRoadmapFormData = SyncRoadmapGraphRequest;

/**
 * Roadmap node without contents (for simpler operations)
 */
export type RoadmapNodeBasic = Omit<RoadmapNode, 'contents'>;

/**
 * New roadmap node input (for UI forms)
 */
export type NewRoadmapNode = Omit<RoadmapNode, 'id' | 'roadmapId'> & {
  clientId: string;
};

/**
 * New roadmap edge input (for UI forms)
 */
export type NewRoadmapEdge = Omit<RoadmapEdge, 'id' | 'roadmapId'> & {
  clientId: string;
};

/**
 * New node content input (for UI forms)
 */
export type NewNodeContent = Omit<NodeContent, 'id' | 'nodeId'> & {
  clientId?: string;
};

// ==================== API Operation Types ====================

/**
 * All API request types
 */
export type ApiRequest =
  | GetRoadmapsParams
  | GetNodeContentsRequest
  | CreateRoadmapGraphRequest
  | SyncRoadmapGraphRequest
  | DeleteRoadmapRequest
  | DeleteNodeRequest
  | DeleteEdgeRequest
  | DeleteContentRequest;

/**
 * All API response types
 */
export type ApiResponse =
  | GenericSuccessResponse
  | GetRoadmapsResponse
  | GetRoadmapDetailResponse
  | GetNodeContentsResponse
  | CreateRoadmapGraphResponse
  | SyncRoadmapGraphResponse
  | DeleteRoadmapResponse
  | DeleteNodeResponse
  | DeleteEdgeResponse
  | DeleteContentResponse;
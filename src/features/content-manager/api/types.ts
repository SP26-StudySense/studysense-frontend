/**
 * Content Manager API Types
 * Centralized types for roadmap management
 */
import type { PaginatedResponse } from "../../../shared/types/api";

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
  Disabled = 'Disabled'

}
  

// ==================== Core Entities ====================

export interface LearningSubject {
  id: number;
  categoryId?: number;
  name: string;
  description?: string;
  isActive?: boolean;
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
  status: RoadmapStatus | number;
  createdAt: Date;
  createdById: string;
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
  nodeId?: number; 
  nodeClientId?: string; 
  contentType: ContentType;
  title: string;
  description: string;
  url: string;
  estimatedMinutes?: number;
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
    version?: number;
    createdAt?: Date;
    createdById?: string;
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
 * Get manager roadmaps params
 * GET /api/roadmaps/manager
 */
export interface GetManagerRoadmapsParams {
  pageIndex: number;
  pageSize: number;
  subjectId?: number;
  status?: RoadmapStatus;
  version?: number;
  isLatest?: boolean;
  keyword?: string;
}

/**
 * Get learning subjects assigned to current content manager
 * GET /api/learning-subjects/manager
 */
export interface GetManagerSubjectsResponse {
  subjects: LearningSubject[];
}

/**
 * Get content manager dashboard stats params
 * GET /api/content-manager/stats
 */
export interface GetContentManagerStatsParams {
  subjectId?: number;
}

export interface MonthlyCompletedUsersDto {
  year: number;
  month: number;
  completedUsers: number;
}

export interface TopRoadmapStatsDto {
  roadmapId: number;
  title: string;
  subjectId: number;
  studyPlanCount: number;
  nodeCount: number;
}

export interface QuizLeaderboardItemDto {
  quizId: number;
  quizTitle: string | null;
  roadmapId: number;
  roadmapTitle: string;
  count: number;
}

export interface ContentManagerStatsDto {
  totalRoadmapsCreated: number;
  totalNodesAdded: number;
  totalNodeContentsCreated: number;
  totalQuizzesCreated: number;
  totalUsersCompletedRoadmaps: number;
  totalUsersInProgressRoadmaps: number;
  topRoadmapMostLearned: TopRoadmapStatsDto | null;
  completedUsersByMonth: MonthlyCompletedUsersDto[];
  mostAttemptedQuiz: QuizLeaderboardItemDto | null;
  mostPassedQuiz: QuizLeaderboardItemDto | null;
  mostFailedQuiz: QuizLeaderboardItemDto | null;
}

export interface GetContentManagerStatsResponse {
  stats: ContentManagerStatsDto;
}

/**
 * Create roadmap request
 * POST /api/roadmaps
 */
export interface CreateRoadmapRequest {
  subjectId: number;
  title: string;
  description?: string;
  status?: RoadmapStatus;
}

/**
 * Partial update roadmap request
 * PUT /api/roadmaps/{id}
 */
export interface UpdateRoadmapRequest {
  id: number;
  title?: string | null;
  description?: string | null;
  status?: RoadmapStatus;
}

export interface RoadmapBasicDto {
  id: number;
  subjectId: number;
  title: string;
  description: string;
  status: RoadmapStatus | string;
}

export interface UpdateRoadmapResponse {
  success?: boolean;
  message?: string;
  data?: RoadmapBasicDto;
  id?: number;
  subjectId?: number;
  title?: string;
  description?: string;
  status?: RoadmapStatus | string;
}

/**
 * Create roadmap response data
 * Returned inside `data` from backend ApiResponse wrapper
 */
export interface CreateRoadmapResponse {
  id: number;
  subjectId: number;
  title: string;
  description: string;
  createdById: string;
  createdAt: string;
  version: number;
  isLatest: boolean;
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
  contents: NodeContent[]; // Use id=null or omit id
}

/**
 * Sync roadmap graph request
 * PUT /api/roadmaps/{roadmapId}/graph
 * 
 * Sync Logic:
 * - id is number: Update existing
 * - id is null: Create new
 * - Content delete is explicit via deleteContents
 */
export interface SyncRoadmapGraphRequest {
  roadmapId: number;
  roadmap?: {
    title?: string;
    description?: string;
    status?: RoadmapStatus;
    version?: number;
  };
  nodes: RoadmapNode[]; // Include all nodes you want to keep
  edges: RoadmapEdge[]; // Include all edges you want to keep
  contents: NodeContent[]; // Create + update only
  deleteContents?: number[]; // Explicit content IDs to delete
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

// ==================== Quiz Types ====================

/**
 * Single quiz item returned by the backend
 */
export interface QuizItem {
  id: number;
  roadmapNodeId: number;
  title?: string | null;
  description?: string | null;
  totalScore?: number | null;
  level?: string | null;
  passingScore?: number | null;
}

/**
 * Get quiz by id request
 * GET /api/quiz/{quizId}
 */
export interface GetQuizByIdRequest {
  quizId: number;
}

/**
 * Get quiz by id response
 * Mirrors GetQuizByIdResult from the backend
 */
export interface GetQuizByIdResponse {
  quizDto: QuizItem | null;
}

/**
 * Get all quizzes by roadmap node id request
 * GET /api/quizzes/roadmapnode/{roadmapNodeId}
 */
export interface GetQuizzesByNodeRequest {
  roadmapNodeId: number;
  pageIndex?: number;
  pageSize?: number;
}

/**
 * Get all quizzes by roadmap node id response
 */
export interface GetQuizzesByNodeResponse {
  items: QuizItem[];
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Raw backend response for get quizzes by node
 * GET /api/quizzes/roadmapnode/{roadmapNodeId}
 */
export interface GetQuizzesByNodeApiResponse {
  quizzes?: GetQuizzesByNodeResponse;
}

/**
 * Create quiz request
 * POST /api/quiz
 */
export interface CreateQuizRequest {
  createQuizNode: {
    roadmapNodeId: number;
    title?: string | null;
    description?: string | null;
    totalScore?: number | null;
    level: string;
    passingScore: number;
  };
}

/**
 * Update quiz payload
 * PUT /api/quiz/{id}
 */
export interface UpdateQuizDto {
  roadmapNodeId: number;
  title?: string | null;
  description?: string | null;
  totalScore?: number | null;
  level: string;
  passingScore: number;
}

/**
 * Update quiz request
 * PUT /api/quiz/{id}
 */
export interface UpdateQuizRequest {
  id: number;
  updateQuizNodeDto: UpdateQuizDto;
}

export enum QuizQuestionType {
  SingleChoice = 0,
  MultipleChoice = 1,
  ShortAnswer = 2,
}

export interface CreateQuizQuestionOptionInputDto {
  valueKey: string;
  displayText: string;
  isCorrect: boolean;
  scoreValue?: number | null;
  orderNo: number;
}

export interface CreateQuizQuestionWithOptionsDto {
  quizId: number;
  questionKey: string;
  prompt: string;
  level: string;
  type: QuizQuestionType;
  scoreWeight: number;
  orderNo: number;
  isRequired: boolean;
  options: CreateQuizQuestionOptionInputDto[];
}

/**
 * Create quiz question request
 * POST /api/quiz-questions
 */
export interface CreateQuizQuestionRequest {
  createQuizQuestionDtos: CreateQuizQuestionWithOptionsDto[];
}

export interface CreateAiQuizQuestionsRequest {
  quizId: number;
  roadmapId: number;
  roadmapNodeId: number;
  questionCount?: number;
  level?: string;
}

/**
 * Get all quiz questions by quiz id request
 * GET /api/quiz/{quizId}/questions
 */
export interface GetQuizQuestionsByQuizIdRequest {
  quizId: number;
}

export interface QuizQuestionOptionItem {
  id: number;
  questionId: number;
  valueKey: string;
  displayText: string;
  isCorrect: boolean;
  scoreValue: number;
  orderNo: number;
}

export interface QuizQuestionItem {
  id: number;
  quizId: number;
  questionKey: string;
  prompt: string;
  level?: string | null;
  type: QuizQuestionType | string;
  scoreWeight: number;
  orderNo: number;
  isRequired: boolean;
  options: QuizQuestionOptionItem[];
}

export interface GetQuizQuestionsByQuizIdResponse {
  quizQuestionDtos: QuizQuestionItem[];
}

export interface UpdateQuizQuestionDto {
  questionKey: string;
  prompt: string;
  level: string;
  type: QuizQuestionType;
  scoreWeight: number;
  orderNo: number;
  isRequired: boolean;
}

export interface UpdateQuizQuestionRequest {
  id: number;
  quizId: number;
  updateQuizQuestionDto: UpdateQuizQuestionDto;
}

export interface UpdateQuizQuestionOptionDto {
  id: number;
  valueKey: string;
  displayText: string;
  isCorrect: boolean;
  scoreValue?: number | null;
  orderNo: number;
}

export interface UpdateQuizQuestionOptionRequest {
  id: number;
  quizId: number;
  updateQuizQuestionOptionDto: UpdateQuizQuestionOptionDto;
}

export interface DeleteQuizQuestionRequest {
  id: number;
  quizId: number;
}

export interface DeleteQuizQuestionOptionRequest {
  id: number;
  quizId: number;
}

/**
 * Delete quiz request
 * DELETE /api/quiz/{quizId}
 */
export interface DeleteQuizRequest {
  quizId: number;
  roadmapNodeId?: number;
}

/**
 * Delete quiz response
 */
export interface DeleteQuizResponse {
  isDeleted?: boolean;
  message?: string;
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
  roadmaps: PaginatedResponse<RoadmapMetadata>;
}

/**
 * Get roadmap detail response
 * GET /api/roadmaps/{id}
 */
export interface GetRoadmapDetailResponse {
  success: boolean;
  message?: string;
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
export type DeleteQuizQuestionResponse = void;
export type DeleteQuizQuestionOptionResponse = void;

/**
 * Create quiz response
 * POST /api/quiz
 */
export type CreateQuizResponse = {
  id?: number;
  roadmapNodeId?: number;
  title?: string;
  description?: string;
  totalScore?: number;
  level?: string;
  passingScore?: number;
  success?: boolean;
  message?: string;
};

/**
 * Update quiz response
 * PUT /api/quiz/{id}
 */
export type UpdateQuizResponse = {
  id?: number;
  roadmapNodeId?: number;
  title?: string | null;
  description?: string | null;
  totalScore?: number | null;
  level?: string | null;
  passingScore?: number | null;
  success?: boolean;
  message?: string;
};

/**
 * Create quiz question response
 * POST /api/quiz-question
 */
export type CreateQuizQuestionResponse = {
  id?: number;
  quizId?: number;
  questionKey?: string;
  prompt?: string;
  type?: QuizQuestionType;
  scoreWeight?: number;
  orderNo?: number;
  isRequired?: boolean;
  success?: boolean;
  message?: string;
};

export interface AiQuizQuestionOptionItem {
  id?: number;
  questionId?: number;
  valueKey?: string;
  displayText?: string;
  isCorrect?: boolean;
  scoreValue?: number | null;
  orderNo?: number;
}

export interface AiQuizQuestionItem {
  id?: number;
  quizId?: number;
  questionKey?: string;
  prompt?: string;
  level?: string;
  type?: QuizQuestionType | string | number;
  scoreWeight?: number;
  orderNo?: number;
  isRequired?: boolean;
  options?: AiQuizQuestionOptionItem[];
}

export interface CreateAiQuizQuestionsResponse {
  success?: boolean;
  message?: string;
  questions?: AiQuizQuestionItem[];
  quizQuestionDtos?: AiQuizQuestionItem[];
  generatedQuestions?: AiQuizQuestionItem[];
  quizQuestions?: AiQuizQuestionItem[];
  items?: AiQuizQuestionItem[];
  result?: Record<string, unknown> | null;
  payload?: Record<string, unknown> | null;
  [key: string]: unknown;
}

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

// Request
export interface GenerateRoadmapRequest {
  message: string;
  subjectId: number;
}

// Roadmap metadata
export interface AIRoadmapMetadata {
  subjectId: number;
  title: string;
  description?: string | null;
}

// Node
export interface AIRoadmapNode {
  clientId: string;
  title: string;
  description: string;
  difficulty: NodeDifficulty;
  orderNo?: number;
}

// Content
export interface AIRoadmapContent {
  clientId: string;
  nodeClientId: string;
  contentType: ContentType;
  title: string;
  description: string;
  url?: string | null;
  estimatedMinutes?: number | null;
  difficulty?: NodeDifficulty;
  orderNo?: number;
  isRequired: boolean;
}

// Edge
export interface AIRoadmapEdge {
  fromNodeClientId: string;
  toNodeClientId: string;
  edgeType: EdgeType;
  orderNo?: number | null;
}

// Raw roadmap from AI
export interface AIRoadmapGraph {
  roadmap: AIRoadmapMetadata;
  nodes: AIRoadmapNode[];
  contents: AIRoadmapContent[];
  edges: AIRoadmapEdge[];
}

// Response
export interface GenerateRoadmapResponse {
  success: boolean;
  message: string;
  rawroadmap: AIRoadmapGraph;
}

// ==================== API Operation Types ====================

/**
 * All API request types
 */
export type ApiRequest =
  | GetRoadmapsParams
  | GetManagerRoadmapsParams
  | CreateRoadmapRequest
  | GetNodeContentsRequest
  | CreateRoadmapGraphRequest
  | SyncRoadmapGraphRequest
  | DeleteRoadmapRequest
  | DeleteNodeRequest
  | DeleteEdgeRequest
  | DeleteContentRequest
  | CreateQuizQuestionRequest
  | CreateAiQuizQuestionsRequest
  | DeleteQuizQuestionRequest
  | DeleteQuizQuestionOptionRequest;

/**
 * All API response types
 */
export type ApiResponse =
  | GenericSuccessResponse
  | GetRoadmapsResponse
  | GetManagerSubjectsResponse
  | CreateRoadmapResponse
  | GetRoadmapDetailResponse
  | GetNodeContentsResponse
  | CreateRoadmapGraphResponse
  | SyncRoadmapGraphResponse
  | DeleteRoadmapResponse
  | DeleteNodeResponse
  | DeleteEdgeResponse
  | DeleteContentResponse
  | DeleteQuizQuestionResponse
  | DeleteQuizQuestionOptionResponse
  | CreateQuizQuestionResponse
  | CreateAiQuizQuestionsResponse;
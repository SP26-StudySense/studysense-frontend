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
  CreateQuizRequest,
  CreateQuizQuestionRequest,
  CreateAiQuizQuestionsRequest,
  UpdateQuizQuestionRequest,
  UpdateQuizQuestionOptionRequest,
  DeleteQuizQuestionRequest,
  DeleteQuizQuestionOptionRequest,
  DeleteQuizRequest,
  GetQuizzesByNodeRequest,
  GetQuizQuestionsByQuizIdRequest,
  GetQuizByIdRequest,
  // Response types
  GetRoadmapsResponse,
  RoadmapDetail,
  NodeContent,
  CreateRoadmapGraphResponse,
  SyncRoadmapGraphResponse,
  DeleteRoadmapResponse,
  DeleteNodeResponse,
  DeleteEdgeResponse,
  DeleteContentResponse,
  CreateQuizResponse,
  CreateQuizQuestionResponse,
  CreateAiQuizQuestionsResponse,
  UpdateQuizQuestionDto,
  UpdateQuizQuestionOptionDto,
  DeleteQuizQuestionResponse,
  DeleteQuizQuestionOptionResponse,
  DeleteQuizResponse,
  GetQuizzesByNodeApiResponse,
  GetQuizzesByNodeResponse,
  GetQuizQuestionsByQuizIdResponse,
  GetQuizByIdResponse,
  GenerateRoadmapRequest,
  GenerateRoadmapResponse,
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
  quizzes: () => [...cmQueryKeys.all, 'quizzes'] as const,
  quizQuestions: () => [...cmQueryKeys.all, 'quiz-questions'] as const,
  quizzesByNode: (nodeId: number) =>
    [...cmQueryKeys.all, 'quizzes', 'node', nodeId] as const,
  quizQuestionsByQuiz: (quizId: number) =>
    [...cmQueryKeys.all, 'quiz-questions', 'quiz', quizId] as const,
  quizById: (quizId: number) =>
    [...cmQueryKeys.all, 'quizzes', 'detail', quizId] as const,
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
): Promise<RoadmapDetail> {
  return get<RoadmapDetail>(`/roadmaps/${roadmapId}`);
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
): Promise<NodeContent[]> {
  return get<NodeContent[]>(
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

/**
 * Generate roadmap using AI
 * POST /api/ai/create-road-map
 */
export async function generateRoadmapAI(
  request: GenerateRoadmapRequest
): Promise<GenerateRoadmapResponse> {
  return post<GenerateRoadmapResponse>("/ai/create-road-map", request);
}

export async function createQuiz(
  request: CreateQuizRequest
): Promise<CreateQuizResponse> {
  return post<CreateQuizResponse>('/quiz', request);
}

export async function createQuizQuestion(
  request: CreateQuizQuestionRequest
): Promise<CreateQuizQuestionResponse> {
  return post<CreateQuizQuestionResponse>('/quiz-questions', request);
}

export async function createAiQuizQuestions(
  request: CreateAiQuizQuestionsRequest
): Promise<CreateAiQuizQuestionsResponse> {
  return post<CreateAiQuizQuestionsResponse>('/ai/create-quiz-questions', request);
}

export async function updateQuizQuestion(
  request: UpdateQuizQuestionRequest
): Promise<UpdateQuizQuestionDto> {
  return put<UpdateQuizQuestionDto>(`/quiz-question/${request.id}`, {
    updateQuizQuestionDto: request.updateQuizQuestionDto,
  });
}

export async function updateQuizQuestionOption(
  request: UpdateQuizQuestionOptionRequest
): Promise<UpdateQuizQuestionOptionDto> {
  return put<UpdateQuizQuestionOptionDto>(`/quiz-question-options/${request.id}`, {
    updateQuizQuestionOptionDto: request.updateQuizQuestionOptionDto,
  });
}

export async function deleteQuizQuestion(
  request: DeleteQuizQuestionRequest
): Promise<DeleteQuizQuestionResponse> {
  return del<DeleteQuizQuestionResponse>(`/quiz-question/${request.id}`);
}

export async function deleteQuizQuestionOption(
  request: DeleteQuizQuestionOptionRequest
): Promise<DeleteQuizQuestionOptionResponse> {
  return del<DeleteQuizQuestionOptionResponse>(`/quiz-question-options/${request.id}`);
}

export async function deleteQuiz(
  request: DeleteQuizRequest
): Promise<DeleteQuizResponse> {
  return del<DeleteQuizResponse>(`/quiz/${request.quizId}`);
}

export async function getQuizzesByNode(
  request: GetQuizzesByNodeRequest
): Promise<GetQuizzesByNodeResponse> {
  const { roadmapNodeId, pageIndex = 1, pageSize = 10 } = request;
  const response = await get<GetQuizzesByNodeApiResponse>(
    `/quizzes/roadmapnode/${roadmapNodeId}?pageIndex=${pageIndex}&pageSize=${pageSize}`
  );

  return (
    response?.quizzes ?? {
      items: [],
      pageIndex,
      pageSize,
      totalPages: 0,
      totalCount: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    }
  );
}

export async function getQuizQuestionsByQuizId(
  request: GetQuizQuestionsByQuizIdRequest
): Promise<GetQuizQuestionsByQuizIdResponse> {
  return get<GetQuizQuestionsByQuizIdResponse>(`/quiz/${request.quizId}/questions`);
}

export async function getQuizById(
  request: GetQuizByIdRequest
): Promise<GetQuizByIdResponse> {
  return get<GetQuizByIdResponse>(`/quiz/${request.quizId}?id=${request.quizId}`);
}
/**
 * Content Manager Mutations
 * React Query hooks for POST/PUT/DELETE operations
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import * as api from './api';
import { cmQueryKeys } from './api';
import type {
  DeleteRoadmapRequest,
  DeleteNodeRequest,
  DeleteEdgeRequest,
  DeleteContentRequest,
  CreateRoadmapGraphRequest,
  SyncRoadmapGraphRequest,
  CreateQuizRequest,
  CreateQuizQuestionRequest,
  UpdateQuizQuestionRequest,
  UpdateQuizQuestionOptionRequest,
  DeleteQuizRequest,
  DeleteRoadmapResponse,
  DeleteNodeResponse,
  DeleteEdgeResponse,
  DeleteContentResponse,
  CreateRoadmapGraphResponse,
  SyncRoadmapGraphResponse,
  CreateQuizResponse,
  CreateQuizQuestionResponse,
  UpdateQuizQuestionDto,
  UpdateQuizQuestionOptionDto,
  DeleteQuizResponse,
} from './types';

// ==================== Delete Mutations ====================

/**
 * Delete a roadmap and all its data
 * 
 * @example
 * ```tsx
 * const deleteRoadmapMutation = useDeleteRoadmap();
 * 
 * deleteRoadmapMutation.mutate({ roadmapId: 123 }, {
 *   onSuccess: () => {
 *     toast.success('Roadmap deleted');
 *   }
 * });
 * ```
 */
export function useDeleteRoadmap(
  options?: UseMutationOptions<DeleteRoadmapResponse, Error, DeleteRoadmapRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmQueryKeys.roadmaps() });
    },
    ...options,
  });
}

/**
 * Delete a node from roadmap
 * 
 * @example
 * ```tsx
 * const deleteNodeMutation = useDeleteNode();
 * 
 * deleteNodeMutation.mutate({ roadmapId: 123, nodeId: 456 });
 * ```
 */
export function useDeleteNode(
  options?: UseMutationOptions<DeleteNodeResponse, Error, DeleteNodeRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteNode,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cmQueryKeys.roadmapDetail(variables.roadmapId),
      });
    },
    ...options,
  });
}

/**
 * Delete an edge from roadmap
 * 
 * @example
 * ```tsx
 * const deleteEdgeMutation = useDeleteEdge();
 * 
 * deleteEdgeMutation.mutate({ roadmapId: 123, edgeId: 789 });
 * ```
 */
export function useDeleteEdge(
  options?: UseMutationOptions<DeleteEdgeResponse, Error, DeleteEdgeRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteEdge,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cmQueryKeys.roadmapDetail(variables.roadmapId),
      });
    },
    ...options,
  });
}

/**
 * Delete a content from node
 * 
 * @example
 * ```tsx
 * const deleteContentMutation = useDeleteContent();
 * 
 * deleteContentMutation.mutate({ 
 *   roadmapId: 123, 
 *   nodeId: 456, 
 *   contentId: 789 
 * });
 * ```
 */
export function useDeleteContent(
  options?: UseMutationOptions<DeleteContentResponse, Error, DeleteContentRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteContent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cmQueryKeys.nodeContents(variables.roadmapId, variables.nodeId),
      });
    },
    ...options,
  });
}

// ==================== Graph API Mutations (RECOMMENDED) ====================

/**
 * Create full roadmap graph (roadmap + nodes + edges + contents)
 * This is the RECOMMENDED way to create a new roadmap
 * 
 * @example
 * ```tsx
 * const createGraph = useCreateRoadmapGraph();
 * 
 * createGraph.mutate({
 *   roadmap: { 
 *     subjectId: 1, 
 *     title: "Python Basics",
 *     description: "Learn Python fundamentals"
 *   },
 *   nodes: [
 *     { 
 *       clientId: "node-1",
 *       title: "Variables", 
 *       description: "Learn variables",
 *       difficulty: NodeDifficulty.Beginner, 
 *       estimatedHours: 2,
 *       contents: [
 *         {
 *           contentType: ContentType.Video,
 *           title: "Intro to Variables",
 *           description: "Video tutorial",
 *           contentUrl: "https://youtube.com/...",
 *           isRequired: true
 *         }
 *       ]
 *     },
 *     { 
 *       clientId: "node-2",
 *       title: "Data Types",
 *       description: "Learn data types",
 *       difficulty: NodeDifficulty.Beginner,
 *       estimatedHours: 3
 *     }
 *   ],
 *   edges: [
 *     { 
 *       clientId: "edge-1",
 *       fromNodeClientId: "node-1",
 *       toNodeClientId: "node-2",
 *       edgeType: EdgeType.Prerequisite
 *     }
 *   ]
 * }, {
 *   onSuccess: (data) => {
 *     console.log("Created roadmap ID:", data.roadmapId);
 *     console.log("Node ID map:", data.nodeIdMap);
 *     // { "node-1": 101, "node-2": 102 }
 *     
 *     const node1DbId = data.nodeIdMap["node-1"];
 *     router.push(`/content-roadmaps/${data.roadmapId}`);
 *   }
 * });
 * ```
 */
export function useCreateRoadmapGraph(
  options?: UseMutationOptions<
    CreateRoadmapGraphResponse,
    Error,
    CreateRoadmapGraphRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createRoadmapGraph,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmQueryKeys.roadmaps() });
    },
    ...options,
  });
}

/**
 * Sync full roadmap graph (update existing + add new + delete missing)
 * This is the RECOMMENDED way to update an existing roadmap
 * 
 * Sync Logic:
 * - Entities with id: Update existing
 * - Entities with id=null: Create new
 * - Entities not in payload: Delete from database
 * 
 * @example
 * ```tsx
 * const syncGraph = useSyncRoadmapGraph();
 * 
 * // Get existing roadmap
 * const { data: roadmapData } = useRoadmapDetail(123);
 * 
 * // Modify nodes/edges
 * const updatedNodes = roadmapData.data.nodes.map(node => 
 *   node.id === 101 
 *     ? { ...node, title: "Updated Title" }  // Update
 *     : node
 * );
 * 
 * // Add new node
 * updatedNodes.push({
 *   id: null,
 *   clientId: "new-node",
 *   title: "New Node",
 *   description: "New content",
 *   difficulty: NodeDifficulty.Intermediate,
 *   estimatedHours: 5
 * });
 * 
 * // Sync
 * syncGraph.mutate({
 *   roadmapId: 123,
 *   roadmap: { 
 *     title: "Updated Roadmap Title",
 *     status: RoadmapStatus.Active
 *   },
 *   nodes: updatedNodes,
 *   edges: roadmapData.data.edges
 * }, {
 *   onSuccess: (data) => {
 *     console.log(`Added: ${data.nodesAdded}, Updated: ${data.nodesUpdated}, Deleted: ${data.nodesDeleted}`);
 *     
 *     // Get new node's database ID
 *     const newNodeDbId = data.nodeIdMap["new-node"];
 *   }
 * });
 * ```
 */
export function useSyncRoadmapGraph(
  options?: UseMutationOptions<
    SyncRoadmapGraphResponse,
    Error,
    SyncRoadmapGraphRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.syncRoadmapGraph,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cmQueryKeys.roadmapDetail(variables.roadmapId),
      });
      queryClient.invalidateQueries({ queryKey: cmQueryKeys.roadmaps() });
    },
    ...options,
  });
}

export function useCreateQuiz(
  options?: UseMutationOptions<
    CreateQuizResponse,
    Error,
    CreateQuizRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createQuiz,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cmQueryKeys.quizzes() });
      queryClient.invalidateQueries({
        queryKey: cmQueryKeys.quizzesByNode(variables.createQuizNode.roadmapNodeId),
      });
    },
    ...options,
  });
}

export function useCreateQuizQuestion(
  options?: UseMutationOptions<
    CreateQuizQuestionResponse,
    Error,
    CreateQuizQuestionRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createQuizQuestion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cmQueryKeys.quizQuestions() });
      const firstQuizId = variables.createQuizQuestionDtos[0]?.quizId;
      if (firstQuizId != null) {
        queryClient.invalidateQueries({
          queryKey: cmQueryKeys.quizQuestionsByQuiz(firstQuizId),
        });
      }
    },
    ...options,
  });
}

export function useUpdateQuizQuestion(
  options?: UseMutationOptions<
    UpdateQuizQuestionDto,
    Error,
    UpdateQuizQuestionRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateQuizQuestion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cmQueryKeys.quizQuestionsByQuiz(variables.quizId),
      });
    },
    ...options,
  });
}

export function useUpdateQuizQuestionOption(
  options?: UseMutationOptions<
    UpdateQuizQuestionOptionDto,
    Error,
    UpdateQuizQuestionOptionRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateQuizQuestionOption,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cmQueryKeys.quizQuestionsByQuiz(variables.quizId),
      });
    },
    ...options,
  });
}

export function useDeleteQuiz(
  options?: UseMutationOptions<DeleteQuizResponse, Error, DeleteQuizRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteQuiz,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cmQueryKeys.quizzes() });
      if (variables.roadmapNodeId != null) {
        queryClient.invalidateQueries({
          queryKey: cmQueryKeys.quizzesByNode(variables.roadmapNodeId),
        });
      }
    },
    ...options,
  });
}
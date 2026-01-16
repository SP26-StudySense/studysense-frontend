/**
 * Study Plan types matching Backend DTOs
 */

import { BaseEntity, Status, DifficultyLevel } from '@/shared/types';

// Study Plan entity
export interface StudyPlan extends BaseEntity {
  userId: string;
  title: string;
  description?: string;
  targetGoal: string;
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  status: StudyPlanStatus;
  dailyStudyHours: number;
  totalEstimatedHours: number;
  completedHours: number;
  progressPercentage: number;
  roadmapId: string;
  roadmap?: Roadmap;
  currentNodeId?: string;
}

// Study Plan status
export enum StudyPlanStatus {
  DRAFT = 'Draft',
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  COMPLETED = 'Completed',
  ARCHIVED = 'Archived',
}

// Roadmap entity
export interface Roadmap extends BaseEntity {
  title: string;
  description: string;
  category: string;
  difficulty: DifficultyLevel;
  estimatedHours: number;
  isPublished: boolean;
  thumbnailUrl?: string;
  nodes: RoadmapNode[];
  nodeCount: number;
}

// Roadmap Node
export interface RoadmapNode extends BaseEntity {
  roadmapId: string;
  parentNodeId?: string;
  title: string;
  description: string;
  order: number;
  estimatedHours: number;
  difficulty: DifficultyLevel;
  resources: NodeResource[];
  tasks: NodeTask[];
  children?: RoadmapNode[];
}

// Node resource
export interface NodeResource {
  id: string;
  nodeId: string;
  title: string;
  type: ResourceType;
  url: string;
  duration?: number;
  isRequired: boolean;
}

export enum ResourceType {
  VIDEO = 'Video',
  ARTICLE = 'Article',
  DOCUMENTATION = 'Documentation',
  EXERCISE = 'Exercise',
  QUIZ = 'Quiz',
  PROJECT = 'Project',
}

// Node task
export interface NodeTask {
  id: string;
  nodeId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  isCompleted: boolean;
  completedAt?: string;
}

// Create Study Plan request
export interface CreateStudyPlanRequest {
  roadmapId: string;
  title: string;
  targetGoal: string;
  startDate: string;
  targetEndDate: string;
  dailyStudyHours: number;
}

// Adjust Study Plan request
export interface AdjustStudyPlanRequest {
  dailyStudyHours?: number;
  targetEndDate?: string;
  notes?: string;
}

// Study Plan progress
export interface StudyPlanProgress {
  planId: string;
  totalNodes: number;
  completedNodes: number;
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  completedHours: number;
  progressPercentage: number;
  estimatedCompletionDate: string;
  isOnTrack: boolean;
  daysRemaining: number;
}

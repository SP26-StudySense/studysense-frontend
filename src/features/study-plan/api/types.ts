/**
 * Study Plan API Types
 * Matching backend DTOs from STUDYPLANS_API_DOCUMENTATION.md
 */

// Enums
export enum StudyPlanStatus {
  Draft = 'Draft',
  Active = 'Active',
  Archived = 'Archived',
}

export enum StudyPlanStrategy {
  Balanced = 'Balanced',
  Speed = 'Speed',
  Depth = 'Depth',
}

export enum ModuleStatus {
  Locked = 'Locked',
  Active = 'Active',
  Completed = 'Completed',
  Skipped = 'Skipped',
}

export enum TaskStatus {
  Pending = 'Pending',
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Skipped = 'Skipped',
  Archived = 'Archived',
}

export enum RoadmapStatus {
  Draft = 'Draft',
  Active = 'Active',
  Archived = 'Archived',
}

// Study Module DTO
export interface StudyModuleDto {
  id: number;
  studyPlanId: number;
  roadmapNodeId: number;
  roadmapNodeName: string;
  status?: ModuleStatus;
}

// Full Study Plan DTO (with modules)
export interface StudyPlanDto {
  id: number;
  userId: string;
  roadmapId: number;
  roadmapName: string;
  strategy?: StudyPlanStrategy;
  status?: StudyPlanStatus;
  createdAt: string;
  modules: StudyModuleDto[];
}

// Study Plan Summary DTO (for list)
export interface StudyPlanSummaryDto {
  id: number;
  userId: string;
  roadmapId: number;
  strategy?: StudyPlanStrategy;
  status?: StudyPlanStatus;
  createdAt: string;
  roadmapTitle: string;
  roadmapDescription?: string;
  roadmapStatus: RoadmapStatus;
}

// Task Item DTO
export interface TaskItemDto {
  id: number;
  studyPlanModuleId: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  estimatedDurationSeconds: number;
  scheduledDate: string;
  completedAt?: string;
}

// Create Study Plan Request
export interface CreateStudyPlanRequest {
  roadmapId: number;
}

// Task Item Input (for create/update)
export interface TaskItemInput {
  studyPlanModuleId: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  estimatedDurationSeconds: number;
  scheduledDate: string;
  completedAt?: string;
}

// Create Tasks Batch Request
export interface CreateTasksBatchRequest {
  tasks: TaskItemInput[];
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

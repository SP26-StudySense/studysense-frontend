/**
 * Study Plan API Response Types
 * Matching backend API response schema
 */

export interface StudyPlanItem {
  id: number;
  userId: string;
  roadmapId: number;
  strategy: string; // e.g., "Balanced"
  status: string; // e.g., "Draft", "Active"
  createdAt: string; // ISO date string
  roadmapTitle: string;
  roadmapDescription: string;
  roadmapStatus: string; // e.g., "Draft", "Published"
}

export interface StudyPlanResponse {
  success: boolean;
  message: string;
  data: StudyPlanItem[];
}

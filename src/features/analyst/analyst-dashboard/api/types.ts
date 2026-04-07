import type { SurveyStatus } from "@/features/analyst/analyst-survey/api";

export type AnalystDashboardStats = {
  totalSurveys: number;
  publishedCount: number;
  draftCount: number;
  totalMappings: number;
  activeMappings: number;
  mappedSurveys: number;
  coverage: number;
  unmappedSurveys: number;
};

export type AnalystTriggerTypeAdoptionRow = {
  code: string;
  displayName: string;
  isActive: boolean;
  count: number;
};

export type AnalystRecentMappingItem = {
  id: number;
  surveyId: number;
  surveyLabel: string;
  surveyStatus: SurveyStatus | "Unknown";
  triggerType: string;
  createdAt: string;
};

export type AnalystDashboardData = {
  stats: AnalystDashboardStats;
  triggerTypeAdoption: AnalystTriggerTypeAdoptionRow[];
  recentMappings: AnalystRecentMappingItem[];
};

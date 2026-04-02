import type { PaginatedResponse } from "@/shared/types/api";

export type AdminUserDto = {
  id: string;
  userName: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  roleNames: string[];
  assignedSubjectId?: number | null;
};

export type GetAllUsersApiResponse = {
  users: PaginatedResponse<AdminUserDto>;
};

export type RoadmapListItem = {
  id: number;
  title: string;
  status: string | number | null;
  createdAt: string | Date;
};

export type GetAllRoadmapsApiResponse = {
  roadmaps: PaginatedResponse<RoadmapListItem>;
};

export type LearningCategoryListItem = {
  id: number;
  isActive: boolean;
};

export type GetAllLearningCategoriesApiResponse = {
  categories: PaginatedResponse<LearningCategoryListItem>;
};

export type LearningSubjectListItem = {
  id: number;
  isActive: boolean;
};

export type GetAllLearningSubjectsApiResponse = {
  subjects: PaginatedResponse<LearningSubjectListItem>;
};

export type DashboardStat = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
};

export type RoleDistributionItem = {
  role: "Admin" | "Analyst" | "Content Manager" | "User";
  count: number;
  percentage: number;
};

export type LearningCoverageInsight = {
  activeCategories: number;
  totalCategories: number;
  activeSubjects: number;
  totalSubjects: number;
  categoryActivationRate: number;
  subjectActivationRate: number;
  averageSubjectsPerCategory: number;
};

export type RoadmapStatusBreakdownInsight = {
  active: number;
  draft: number;
  archived: number;
  unknown: number;
  total: number;
  activeRate: number;
};

export type AdminDashboardData = {
  stats: DashboardStat[];
  roleDistribution: RoleDistributionItem[];
  learningCoverage: LearningCoverageInsight;
  roadmapStatusBreakdown: RoadmapStatusBreakdownInsight;
};

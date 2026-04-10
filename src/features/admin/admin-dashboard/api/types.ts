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

export type RoleDistributionApiItem = {
  role: string;
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

export type MonthlyRevenueItem = {
  month: number;
  revenue: number;
};

export type RevenueInsights = {
  totalRevenue: number;
  currentMonthRevenue: number;
  year: number;
  monthlyRevenue: MonthlyRevenueItem[];
};

export type AdminDashboardData = {
  stats: DashboardStat[];
  roleDistribution: RoleDistributionItem[];
  learningCoverage: LearningCoverageInsight;
  roadmapStatusBreakdown: RoadmapStatusBreakdownInsight;
  revenueInsights: RevenueInsights;
};

export type AdminDashboardSummary = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  contentManagers: number;
  assignedContentManagers: number;
  analysts: number;
  totalLatestRoadmaps: number;
  activeLatestRoadmaps: number;
};

export type AdminDashboardOverviewApiResponse = {
  summary: AdminDashboardSummary;
  roleDistribution: RoleDistributionApiItem[];
  learningCoverage: LearningCoverageInsight;
  roadmapStatusBreakdown: RoadmapStatusBreakdownInsight;
  revenueInsights: RevenueInsights;
};

import { get } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";

import type {
  AdminDashboardData,
  AdminDashboardOverviewApiResponse,
  RoleDistributionApiItem,
  RoleDistributionItem,
  DashboardStat,
} from "./types";

function formatCount(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function normalizeRoleDistribution(
  item: RoleDistributionApiItem
): RoleDistributionItem {
  const normalized = item.role.replace(/\s+/g, "").trim().toLowerCase();

  if (normalized === "admin") {
    return { role: "Admin", count: item.count, percentage: item.percentage };
  }

  if (normalized === "analyst") {
    return { role: "Analyst", count: item.count, percentage: item.percentage };
  }

  if (normalized === "contentmanager") {
    return {
      role: "Content Manager",
      count: item.count,
      percentage: item.percentage,
    };
  }

  return { role: "User", count: item.count, percentage: item.percentage };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const overview = await get<AdminDashboardOverviewApiResponse>(
    endpoints.admin.analytics.overview
  );

  const {
    totalUsers,
    activeUsers,
    inactiveUsers,
    contentManagers,
    assignedContentManagers,
    analysts,
    totalLatestRoadmaps,
    activeLatestRoadmaps,
  } = overview.summary;

  const stats: DashboardStat[] = [
    {
      title: "Total Users",
      value: formatCount(totalUsers),
      change: `${formatCount(activeUsers)} active`,
      trend: activeUsers >= inactiveUsers ? "up" : "down",
    },
    {
      title: "Inactive Users",
      value: formatCount(inactiveUsers),
      change:
        totalUsers === 0
          ? "0% of users"
          : `${Math.round((inactiveUsers / totalUsers) * 100)}% of users`,
      trend: inactiveUsers > 0 ? "down" : "up",
    },
    {
      title: "Content Managers",
      value: formatCount(contentManagers),
      change: `${formatCount(assignedContentManagers)} assigned subject(s)`,
      trend: assignedContentManagers > 0 ? "up" : "down",
    },
    {
      title: "Analysts",
      value: formatCount(analysts),
      change:
        totalUsers === 0
          ? "0% of users"
          : `${Math.round((analysts / totalUsers) * 100)}% of users`,
      trend: analysts > 0 ? "up" : "down",
    },
    {
      title: "Active Categories",
      value: formatCount(overview.learningCoverage.activeCategories),
      change: `${formatCount(overview.learningCoverage.totalCategories)} total category(ies)`,
      trend: overview.learningCoverage.activeCategories > 0 ? "up" : "down",
    },
    {
      title: "Active Subjects",
      value: formatCount(overview.learningCoverage.activeSubjects),
      change: `${formatCount(overview.learningCoverage.totalSubjects)} total subject(s)`,
      trend: overview.learningCoverage.activeSubjects > 0 ? "up" : "down",
    },
    {
      title: "Active Roadmaps",
      value: formatCount(activeLatestRoadmaps),
      change: `${formatCount(totalLatestRoadmaps)} latest version(s)`,
      trend: activeLatestRoadmaps > 0 ? "up" : "down",
    },
  ];

  return {
    stats,
    roleDistribution: overview.roleDistribution.map(normalizeRoleDistribution),
    learningCoverage: overview.learningCoverage,
    roadmapStatusBreakdown: overview.roadmapStatusBreakdown,
  };
}

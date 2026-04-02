import { get } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";

import type {
  AdminDashboardData,
  AdminUserDto,
  GetAllLearningCategoriesApiResponse,
  GetAllLearningSubjectsApiResponse,
  GetAllRoadmapsApiResponse,
  GetAllUsersApiResponse,
  RoleDistributionItem,
  LearningCategoryListItem,
  LearningSubjectListItem,
  RoadmapListItem,
  DashboardStat,
} from "./types";

const PAGE_SIZE = 100;

function formatCount(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function normalizeRoadmapStatus(status: string | number | null): string {
  if (typeof status === "string") {
    return status.toLowerCase();
  }

  if (typeof status === "number") {
    if (status === 0) return "draft";
    if (status === 1) return "active";
    if (status === 2) return "archived";
  }

  return "unknown";
}

function normalizeRole(roleName: string): string {
  return roleName.replace(/\s+/g, "").trim().toLowerCase();
}

function calculateRate(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

async function fetchAllAdminUsers(): Promise<{
  totalCount: number;
  users: AdminUserDto[];
}> {
  let pageIndex = 1;
  let totalPages = 1;
  let totalCount = 0;
  const users: AdminUserDto[] = [];

  while (pageIndex <= totalPages) {
    const response = await get<GetAllUsersApiResponse>(endpoints.admin.users.base, {
      params: {
        pageIndex,
        pageSize: PAGE_SIZE,
      },
    });

    totalPages = Math.max(response.users.totalPages, 1);
    totalCount = response.users.totalCount;
    users.push(...response.users.items);

    pageIndex += 1;
  }

  return { totalCount, users };
}

async function fetchAllLatestRoadmaps(): Promise<{
  totalCount: number;
  roadmaps: RoadmapListItem[];
}> {
  let pageIndex = 1;
  let totalPages = 1;
  let totalCount = 0;
  const roadmaps: RoadmapListItem[] = [];

  while (pageIndex <= totalPages) {
    const response = await get<GetAllRoadmapsApiResponse>(endpoints.roadmaps.base, {
      params: {
        pageIndex,
        pageSize: PAGE_SIZE,
        isLatest: true,
      },
    });

    totalPages = Math.max(response.roadmaps.totalPages, 1);
    totalCount = response.roadmaps.totalCount;
    roadmaps.push(...response.roadmaps.items);

    pageIndex += 1;
  }

  return { totalCount, roadmaps };
}

async function fetchAllLearningCategories(): Promise<{
  totalCount: number;
  categories: LearningCategoryListItem[];
}> {
  let pageIndex = 1;
  let totalPages = 1;
  let totalCount = 0;
  const categories: LearningCategoryListItem[] = [];

  while (pageIndex <= totalPages) {
    const response = await get<GetAllLearningCategoriesApiResponse>("/learning-categories", {
      params: {
        pageIndex,
        pageSize: PAGE_SIZE,
      },
    });

    totalPages = Math.max(response.categories.totalPages, 1);
    totalCount = response.categories.totalCount;
    categories.push(...response.categories.items);

    pageIndex += 1;
  }

  return { totalCount, categories };
}

async function fetchAllLearningSubjects(): Promise<{
  totalCount: number;
  subjects: LearningSubjectListItem[];
}> {
  let pageIndex = 1;
  let totalPages = 1;
  let totalCount = 0;
  const subjects: LearningSubjectListItem[] = [];

  while (pageIndex <= totalPages) {
    const response = await get<GetAllLearningSubjectsApiResponse>("/learning-subjects", {
      params: {
        pageIndex,
        pageSize: PAGE_SIZE,
      },
    });

    totalPages = Math.max(response.subjects.totalPages, 1);
    totalCount = response.subjects.totalCount;
    subjects.push(...response.subjects.items);

    pageIndex += 1;
  }

  return { totalCount, subjects };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    { users, totalCount: totalUsers },
    { roadmaps, totalCount: totalRoadmaps },
    { categories, totalCount: totalCategories },
    { subjects, totalCount: totalSubjects },
  ] = await Promise.all([
    fetchAllAdminUsers(),
    fetchAllLatestRoadmaps(),
    fetchAllLearningCategories(),
    fetchAllLearningSubjects(),
  ]);

  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = users.length - activeUsers;
  const contentManagers = users.filter((user) =>
    user.roleNames.some((role) => role.toLowerCase() === "contentmanager")
  );
  const assignedContentManagers = contentManagers.filter(
    (user) => user.assignedSubjectId != null
  ).length;

  const activeRoadmaps = roadmaps.filter(
    (roadmap) => normalizeRoadmapStatus(roadmap.status) === "active"
  ).length;

  const analysts = users.filter((user) =>
    user.roleNames.some((role) => role.trim().toLowerCase() === "analyst")
  ).length;

  const activeCategories = categories.filter((category) => category.isActive).length;
  const activeSubjects = subjects.filter((subject) => subject.isActive).length;

  const roleDistribution: RoleDistributionItem[] = [
    { role: "Admin", count: 0, percentage: 0 },
    { role: "Analyst", count: 0, percentage: 0 },
    { role: "Content Manager", count: 0, percentage: 0 },
    { role: "User", count: 0, percentage: 0 },
  ];

  for (const user of users) {
    const normalizedRoles = new Set(user.roleNames.map(normalizeRole));

    if (normalizedRoles.has("admin")) {
      roleDistribution[0].count += 1;
    }

    if (normalizedRoles.has("analyst")) {
      roleDistribution[1].count += 1;
    }

    if (normalizedRoles.has("contentmanager")) {
      roleDistribution[2].count += 1;
    }

    if (normalizedRoles.has("user")) {
      roleDistribution[3].count += 1;
    }
  }

  for (const item of roleDistribution) {
    item.percentage = calculateRate(item.count, totalUsers);
  }

  const roadmapStatusCounts = {
    active: 0,
    draft: 0,
    archived: 0,
    unknown: 0,
  };

  for (const roadmap of roadmaps) {
    const normalizedStatus = normalizeRoadmapStatus(roadmap.status);

    if (normalizedStatus === "active") {
      roadmapStatusCounts.active += 1;
    } else if (normalizedStatus === "draft") {
      roadmapStatusCounts.draft += 1;
    } else if (normalizedStatus === "archived") {
      roadmapStatusCounts.archived += 1;
    } else {
      roadmapStatusCounts.unknown += 1;
    }
  }

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
      value: formatCount(contentManagers.length),
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
      value: formatCount(activeCategories),
      change: `${formatCount(totalCategories)} total category(ies)`,
      trend: activeCategories > 0 ? "up" : "down",
    },
    {
      title: "Active Subjects",
      value: formatCount(activeSubjects),
      change: `${formatCount(totalSubjects)} total subject(s)`,
      trend: activeSubjects > 0 ? "up" : "down",
    },
    {
      title: "Active Roadmaps",
      value: formatCount(activeRoadmaps),
      change: `${formatCount(totalRoadmaps)} latest version(s)`,
      trend: activeRoadmaps > 0 ? "up" : "down",
    },
  ];

  return {
    stats,
    roleDistribution,
    learningCoverage: {
      activeCategories,
      totalCategories,
      activeSubjects,
      totalSubjects,
      categoryActivationRate: calculateRate(activeCategories, totalCategories),
      subjectActivationRate: calculateRate(activeSubjects, totalSubjects),
      averageSubjectsPerCategory:
        totalCategories > 0
          ? Number((totalSubjects / totalCategories).toFixed(1))
          : 0,
    },
    roadmapStatusBreakdown: {
      active: roadmapStatusCounts.active,
      draft: roadmapStatusCounts.draft,
      archived: roadmapStatusCounts.archived,
      unknown: roadmapStatusCounts.unknown,
      total: totalRoadmaps,
      activeRate: calculateRate(roadmapStatusCounts.active, totalRoadmaps),
    },
  };
}

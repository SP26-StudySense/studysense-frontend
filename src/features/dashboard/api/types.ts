export interface OverviewTaskDto {
  taskId: number;
  moduleId: number;
  moduleTitle: string;
  taskTitle: string;
  description?: string;
  estimatedMinutes: number;
}

export interface RecentSessionDto {
  id: string;
  durationSeconds: number;
  tasksCompleted: number;
  totalTasks: number;
  date: string;
  rating: number | null;
  nodeTitle: string | null;
}

export interface OverviewStudyPlanDto {
  studyPlanId: number;
  roadmapTitle: string;
  progressPercentage: number;
  totalXpEarned: number;
  studyStreakDays: number;
  todaysFocus: OverviewTaskDto | null;
  upcomingTasks: OverviewTaskDto[];
  recentSessions: RecentSessionDto[];
}

export interface LearningTargetDto {
  targetRole: string;
  currentLevel: string;
  targetDeadlineMonths: number;
}

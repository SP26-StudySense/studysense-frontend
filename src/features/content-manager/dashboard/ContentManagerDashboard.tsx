"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileText,
  GitBranch,
  Layers3,
  Map,
  MoveRight,
  Users,
} from "lucide-react";
import type {
  LearningSubject,
  ContentManagerStatsDto,
  MonthlyCompletedUsersDto,
  QuizLeaderboardItemDto,
} from "../api";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  tone: "cyan" | "emerald" | "amber" | "rose";
}

function MetricCard({ title, value, icon, tone }: MetricCardProps) {
  const toneClass: Record<MetricCardProps["tone"], string> = {
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        <div className={`rounded-xl border px-2.5 py-2 ${toneClass[tone]}`}>{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function monthLabel(item: MonthlyCompletedUsersDto): string {
  const date = new Date(item.year, item.month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function MonthlyCompletedChart({ data }: { data: MonthlyCompletedUsersDto[] }) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
        No monthly completion data yet.
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.completedUsers), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const width = (item.completedUsers / maxValue) * 100;
        return (
          <div key={`${item.year}-${item.month}`} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{monthLabel(item)}</span>
              <span>{item.completedUsers} users</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00bae2] to-emerald-500"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuizLeaderboardCard({
  title,
  item,
  tone,
}: {
  title: string;
  item: QuizLeaderboardItemDto | null;
  tone: "cyan" | "emerald" | "rose";
}) {
  const toneClass: Record<"cyan" | "emerald" | "rose", string> = {
    cyan: "from-cyan-50 to-cyan-100 border-cyan-200",
    emerald: "from-emerald-50 to-emerald-100 border-emerald-200",
    rose: "from-rose-50 to-rose-100 border-rose-200",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${toneClass[tone]}`}>
      <p className="text-sm font-semibold text-neutral-700">{title}</p>
      {item ? (
        <div className="mt-3 space-y-1.5">
          <p className="text-base font-bold text-neutral-900">{item.quizTitle || "Untitled Quiz"}</p>
          <p className="text-sm text-neutral-600">Roadmap: {item.roadmapTitle}</p>
          <p className="text-sm font-semibold text-neutral-900">Count: {item.count}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-neutral-500">No data yet.</p>
      )}
    </div>
  );
}

interface ContentManagerDashboardProps {
  stats: ContentManagerStatsDto;
  contentManager: {
    name: string;
    learningSubjectName: string;
  };
  subjects: LearningSubject[];
  selectedSubjectId?: number;
  onSubjectChange: (subjectId?: number) => void;
}

export function ContentManagerDashboard({
  stats,
  contentManager,
  subjects,
  selectedSubjectId,
  onSubjectChange,
}: ContentManagerDashboardProps) {
  const router = useRouter();
  const isEmpty =
    stats.totalRoadmapsCreated === 0 &&
    stats.totalNodesAdded === 0 &&
    stats.totalNodeContentsCreated === 0 &&
    stats.totalQuizzesCreated === 0 &&
    stats.totalUsersCompletedRoadmaps === 0 &&
    stats.totalUsersInProgressRoadmaps === 0 &&
    stats.topRoadmapMostLearned == null &&
    stats.completedUsersByMonth.length === 0 &&
    stats.mostAttemptedQuiz == null &&
    stats.mostPassedQuiz == null &&
    stats.mostFailedQuiz == null;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Welcome back, {contentManager.name}</h2>
              <p className="mt-2 text-neutral-600">
                Dashboard scope: <span className="font-semibold text-[#00bae2]">{contentManager.learningSubjectName}</span>
              </p>
            </div>

            {subjects.length > 1 && (
              <div className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Subject selection</p>
                  <p className="text-xs text-neutral-500">Choose one subject to narrow the dashboard scope.</p>
                </div>

                <select
                  value={selectedSubjectId ?? "all"}
                  onChange={(event) => {
                    const value = event.target.value;
                    onSubjectChange(value === "all" ? undefined : Number(value));
                  }}
                  className="min-w-[240px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2]"
                >
                  <option value="all">All assigned subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {subjects.length === 1 && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                {subjects[0]?.name || contentManager.learningSubjectName}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => router.push('/content-roadmaps')}
          className="group rounded-2xl border border-neutral-200 bg-gradient-to-br from-[#fec5fb]/30 to-[#00bae2]/20 p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Quick action</p>
              <h3 className="mt-2 text-xl font-bold text-neutral-900">Open My Roadmaps</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Jump directly to your roadmap list to manage or review learning paths.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-3 text-[#00bae2] shadow-sm transition-transform group-hover:translate-x-1">
              <MoveRight className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm">
            <Map className="h-4 w-4 text-[#00bae2]" />
            Go to My Roadmaps
          </div>
        </button>
      </div>

      {isEmpty && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center">
          <p className="text-lg font-semibold text-neutral-800">No dashboard data yet</p>
          <p className="mt-1 text-sm text-neutral-500">
            Start creating roadmaps and quizzes to see statistics.
          </p>
        </div>
      )}

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-neutral-900">Statistics</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Roadmaps created"
            value={stats.totalRoadmapsCreated}
            icon={<Map className="h-4 w-4" />}
            tone="cyan"
          />
          <MetricCard
            title="Nodes added"
            value={stats.totalNodesAdded}
            icon={<GitBranch className="h-4 w-4" />}
            tone="emerald"
          />
          <MetricCard
            title="Node contents created"
            value={stats.totalNodeContentsCreated}
            icon={<Layers3 className="h-4 w-4" />}
            tone="amber"
          />
          <MetricCard
            title="Quizzes created"
            value={stats.totalQuizzesCreated}
            icon={<FileText className="h-4 w-4" />}
            tone="rose"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-neutral-900">Roadmaps</h3>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center gap-2 text-neutral-800">
              <BarChart3 className="h-4 w-4 text-[#00bae2]" />
              <p className="text-sm font-semibold">Monthly completed users</p>
            </div>
            <MonthlyCompletedChart data={stats.completedUsersByMonth} />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-neutral-700">Top 1 most learned roadmap</p>
              {stats.topRoadmapMostLearned ? (
                <div className="mt-3 space-y-1.5">
                  <p className="text-base font-bold text-neutral-900">{stats.topRoadmapMostLearned.title}</p>
                  <p className="text-sm text-neutral-600">Study plans: {stats.topRoadmapMostLearned.studyPlanCount}</p>
                  <p className="text-sm text-neutral-600">Nodes in roadmap: {stats.topRoadmapMostLearned.nodeCount}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-neutral-500">No roadmap data yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Users completed roadmaps</span>
                <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900">{stats.totalUsersCompletedRoadmaps}</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Users in progress</span>
                <div className="rounded-lg bg-amber-50 p-1.5 text-amber-700">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900">{stats.totalUsersInProgressRoadmaps}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-neutral-900">Quizzes</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          <QuizLeaderboardCard
            title="Most attempted quiz"
            item={stats.mostAttemptedQuiz}
            tone="cyan"
          />
          <QuizLeaderboardCard
            title="Most passed quiz"
            item={stats.mostPassedQuiz}
            tone="emerald"
          />
          <QuizLeaderboardCard
            title="Most failed quiz"
            item={stats.mostFailedQuiz}
            tone="rose"
          />
        </div>
      </section>
    </div>
  );
}

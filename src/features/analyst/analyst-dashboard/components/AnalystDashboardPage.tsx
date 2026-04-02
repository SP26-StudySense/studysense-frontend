"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  FileText,
  Link2,
} from "lucide-react";
import { useAnalystDashboardQuery } from "../hooks";

function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusTone(status: string): string {
  if (status === "Published") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Draft") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-neutral-200 text-neutral-700";
}

export function AnalystDashboardPage() {
  const { data, isLoading, isError, error } = useAnalystDashboardQuery();
  const stats = data?.stats;
  const triggerTypeRows = data?.triggerTypeAdoption ?? [];
  const recentMappings = data?.recentMappings ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`analyst-dashboard-skeleton-${idx}`}
              className="h-28 animate-pulse rounded-2xl border border-neutral-200/60 bg-white/80"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="h-80 animate-pulse rounded-2xl border border-neutral-200/60 bg-white/80 xl:col-span-3" />
          <div className="h-80 animate-pulse rounded-2xl border border-neutral-200/60 bg-white/80 xl:col-span-2" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        {error instanceof Error
          ? error.message
          : "Unable to load analyst dashboard."}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
        No dashboard data available.
      </div>
    );
  }

  const maxTriggerCount = Math.max(...triggerTypeRows.map((row) => row.count), 1);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Analyst Command Center
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
              Survey Health Snapshot
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Monitor survey readiness and trigger orchestration in one place.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
            <Activity className="h-4 w-4" />
            Live data from analyst modules
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Surveys
            </span>
            <FileText className="h-4 w-4 text-neutral-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-neutral-900">{stats.totalSurveys}</p>
          <p className="mt-2 text-xs text-neutral-600">
            {stats.publishedCount} published and {stats.draftCount} draft
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Trigger Mappings
            </span>
            <Link2 className="h-4 w-4 text-neutral-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-neutral-900">{stats.totalMappings}</p>
          <p className="mt-2 text-xs text-neutral-600">
            {stats.activeMappings} active mappings
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Coverage
            </span>
            <ClipboardCheck className="h-4 w-4 text-neutral-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-neutral-900">{stats.coverage}%</p>
          <p className="mt-2 text-xs text-neutral-600">
            {stats.mappedSurveys} of {stats.totalSurveys} surveys mapped
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Unmapped Surveys
            </span>
            <AlertTriangle className="h-4 w-4 text-neutral-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-neutral-900">
            {stats.unmappedSurveys}
          </p>
          <p className="mt-2 text-xs text-neutral-600">
            Priority list for next trigger setup
          </p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <article className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl xl:col-span-3">
          <div className="border-b border-neutral-200/60 px-6 py-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-600" />
              <h3 className="text-sm font-semibold text-neutral-900">Trigger Type Adoption</h3>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Mapping distribution by trigger type.
            </p>
          </div>

          <div className="space-y-4 p-6">
            {triggerTypeRows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
                No trigger mapping data yet.
              </p>
            ) : (
              triggerTypeRows.map((row) => {
                const width = Math.max(Math.round((row.count / maxTriggerCount) * 100), 6);

                return (
                  <div key={row.code} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-700">{row.displayName}</span>
                        {!row.isActive && (
                          <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-neutral-900">{row.count}</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl xl:col-span-2">
          <div className="border-b border-neutral-200/60 px-6 py-4">
            <h3 className="text-sm font-semibold text-neutral-900">Recent Mapping Activity</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Latest trigger links created by analyst team.
            </p>
          </div>

          <div className="divide-y divide-neutral-200/60">
            {recentMappings.length === 0 ? (
              <p className="px-6 py-8 text-sm text-neutral-500">No recent activity found.</p>
            ) : (
              recentMappings.map((mapping) => {
                return (
                  <div key={mapping.id} className="space-y-2 px-6 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-800">
                          {mapping.surveyLabel}
                        </p>
                        <p className="text-xs text-neutral-500">{mapping.triggerType}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusTone(
                          mapping.surveyStatus
                        )}`}
                      >
                        {mapping.surveyStatus}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500">
                      Created on {formatShortDate(mapping.createdAt)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
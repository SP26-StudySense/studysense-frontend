"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatCard } from "../../components";
import { useAdminDashboardQuery } from "../hooks";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function AdminDashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useAdminDashboardQuery();

  const stats = data?.stats ?? [];
  const roleDistribution = data?.roleDistribution ?? [];
  const learningCoverage = data?.learningCoverage;
  const roadmapStatusBreakdown = data?.roadmapStatusBreakdown;
  const revenueInsights = data?.revenueInsights;
  const monthlyRevenue = revenueInsights?.monthlyRevenue ?? [];

  const revenueChartData = monthlyRevenue.map((item) => ({
    month: MONTH_LABELS[item.month - 1],
    revenue: item.revenue,
  }));

  const hasRevenueData = revenueChartData.some((item) => item.revenue > 0);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`dashboard-skeleton-${index}`}
              className="h-36 animate-pulse rounded-2xl border border-neutral-200/60 bg-white/80"
            />
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
          <div className="border-b border-neutral-200/60 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Operational Insights
            </h2>
          </div>
          <div className="p-6 text-sm text-neutral-500">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load admin dashboard data.";

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="border-b border-neutral-200/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-neutral-900">
              Revenue by Month ({revenueInsights?.year ?? new Date().getFullYear()})
            </h2>
            <p className="text-sm text-neutral-600">
              Successful payments: {formatCurrency(revenueInsights?.totalRevenue ?? 0)}
            </p>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueChartData}
                margin={{ top: 8, right: 12, left: 6, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#525252", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={84}
                  tick={{ fill: "#737373", fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    formatCompactCurrency(value)
                  }
                />
                <Tooltip
                  cursor={{ fill: "rgba(6, 182, 212, 0.08)" }}
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  contentStyle={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#171717", fontWeight: 600 }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#06b6d4"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!hasRevenueData && (
            <p className="text-xs text-neutral-500">
              No successful payment recorded for this year yet.
            </p>
          )}
          <p className="text-xs text-neutral-500">
            Current month revenue: {formatCurrency(revenueInsights?.currentMonthRevenue ?? 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
          <div className="border-b border-neutral-200/60 p-6">
            <h2 className="text-base font-semibold text-neutral-900">
              Role Distribution
            </h2>
          </div>
          <div className="space-y-4 p-6">
            {roleDistribution.map((item) => (
              <div key={item.role} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">{item.role}</span>
                  <span className="font-medium text-neutral-900">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
          <div className="border-b border-neutral-200/60 p-6">
            <h2 className="text-base font-semibold text-neutral-900">
              Learning Coverage
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6">
            <div className="rounded-xl border border-neutral-200/60 bg-neutral-50/60 p-4">
              <p className="text-xs text-neutral-500">Active Categories</p>
              <p className="mt-1 text-xl font-bold text-neutral-900">
                {learningCoverage?.activeCategories ?? 0}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                {learningCoverage?.totalCategories ?? 0} total
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/60 bg-neutral-50/60 p-4">
              <p className="text-xs text-neutral-500">Active Subjects</p>
              <p className="mt-1 text-xl font-bold text-neutral-900">
                {learningCoverage?.activeSubjects ?? 0}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                {learningCoverage?.totalSubjects ?? 0} total
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/60 bg-neutral-50/60 p-4">
              <p className="text-xs text-neutral-500">Category Activation</p>
              <p className="mt-1 text-xl font-bold text-neutral-900">
                {learningCoverage?.categoryActivationRate ?? 0}%
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/60 bg-neutral-50/60 p-4">
              <p className="text-xs text-neutral-500">Avg Subjects/Category</p>
              <p className="mt-1 text-xl font-bold text-neutral-900">
                {learningCoverage?.averageSubjectsPerCategory ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
          <div className="border-b border-neutral-200/60 p-6">
            <h2 className="text-base font-semibold text-neutral-900">
              Roadmap Status Breakdown
            </h2>
          </div>
          <div className="space-y-3 p-6">
            <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3 text-sm">
              <span className="text-green-700">Active</span>
              <span className="font-semibold text-green-800">
                {roadmapStatusBreakdown?.active ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm">
              <span className="text-amber-700">Draft</span>
              <span className="font-semibold text-amber-800">
                {roadmapStatusBreakdown?.draft ?? 0}
              </span>
            </div>
            <div className="pt-2 text-xs text-neutral-500">
              Active rate: {roadmapStatusBreakdown?.activeRate ?? 0}% of {" "}
              {roadmapStatusBreakdown?.total ?? 0} latest roadmap(s)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

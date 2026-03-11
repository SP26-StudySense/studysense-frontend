"use client";

import { TrendingUp, TrendingDown, Eye, Heart, Map, FileText, Activity, Clock } from "lucide-react";
import { ContentManagerStats } from "../types";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
      {/* Background decoration */}
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${color} opacity-5 blur-2xl transition-opacity group-hover:opacity-10`} />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
          </div>
          <div className={`rounded-xl ${color} p-3`}>
            {icon}
          </div>
        </div>
        
        {change && (
          <div className="mt-4 flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
              {change}
            </span>
            <span className="text-sm text-neutral-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ActivityItemProps {
  action: string;
  target: string;
  time: string;
}

function ActivityItem({ action, target, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-neutral-50">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#fec5fb] to-[#00bae2]">
        <Activity className="h-4 w-4 text-neutral-900" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900">{action}</p>
        <p className="mt-0.5 truncate text-sm text-neutral-600">{target}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-xs text-neutral-400">
        <Clock className="h-3 w-3" />
        {time}
      </div>
    </div>
  );
}

interface ContentManagerDashboardProps {
  stats: ContentManagerStats;
  recentActivities: ActivityItemProps[];
  contentManager: {
    name: string;
    learningSubjectName: string;
  };
}

export function ContentManagerDashboard({
  stats,
  recentActivities,
  contentManager,
}: ContentManagerDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-neutral-900">
          Welcome back, {contentManager.name}! 👋
        </h2>
        <p className="mt-2 text-neutral-600">
          Managing content for <span className="font-semibold text-[#00bae2]">{contentManager.learningSubjectName}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Roadmaps"
          value={stats.totalRoadmaps}
          change="+2"
          trend="up"
          icon={<Map className="h-5 w-5 text-[#00bae2]" />}
          color="bg-[#00bae2]"
        />
        <StatCard
          title="Published"
          value={stats.publishedRoadmaps}
          change="+1"
          trend="up"
          icon={<FileText className="h-5 w-5 text-green-600" />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={<Eye className="h-5 w-5 text-[#fec5fb]" />}
          color="bg-[#fec5fb]"
        />
        <StatCard
          title="Total Likes"
          value={stats.totalLikes}
          change="+8.3%"
          trend="up"
          icon={<Heart className="h-5 w-5 text-red-500" />}
          color="bg-red-500"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity - 2 columns */}
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-neutral-100 p-6">
            <h3 className="text-lg font-bold text-neutral-900">Recent Activity</h3>
          </div>
          <div className="p-4 space-y-1">
            {recentActivities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>

        {/* Quick Stats - 1 column */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-neutral-900">Quick Stats</h3>
          <div className="space-y-4">
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">Draft Roadmaps</span>
                <span className="text-2xl font-bold text-neutral-900">{stats.draftRoadmaps}</span>
              </div>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">Total Nodes</span>
                <span className="text-2xl font-bold text-neutral-900">{stats.totalNodes}</span>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fec5fb] to-[#00bae2] p-4">
              <div className="text-sm font-medium text-neutral-900 mb-2">Average per Roadmap</div>
              <div className="text-2xl font-bold text-neutral-900">
                {(stats.totalNodes / stats.totalRoadmaps).toFixed(1)} nodes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

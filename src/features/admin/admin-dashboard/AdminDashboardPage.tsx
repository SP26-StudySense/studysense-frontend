import { StatCard } from "../components";

interface AdminDashboardPageProps {
  stats?: Array<{
    title: string;
    value: string;
    change: string;
    trend: "up" | "down";
  }>;
  recentActivities?: Array<{
    action: string;
    user: string;
    time: string;
  }>;
}

export function AdminDashboardPage({
  stats = [],
  recentActivities = [],
}: AdminDashboardPageProps) {
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

      {/* Recent Activity */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="border-b border-neutral-200/60 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-neutral-200/60">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-neutral-50/50"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {activity.action}
                </p>
                <p className="text-sm text-neutral-600">{activity.user}</p>
              </div>
              <span className="text-xs text-neutral-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { BookOpen, Clock, Target, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your learning dashboard',
};

// Placeholder stats - will be fetched from API
const stats = [
  {
    title: 'Active Study Plan',
    value: '1',
    description: 'JavaScript Mastery',
    icon: Target,
  },
  {
    title: 'Study Time Today',
    value: '2h 15m',
    description: '+30m from yesterday',
    icon: Clock,
  },
  {
    title: 'Completed Nodes',
    value: '12/45',
    description: '27% progress',
    icon: BookOpen,
  },
  {
    title: 'Current Streak',
    value: '5 days',
    description: 'Keep it up!',
    icon: TrendingUp,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your learning progress.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content area */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current session card */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start a new study session or continue where you left off.
            </p>
            {/* Session component will be added here */}
          </CardContent>
        </Card>

        {/* Recent activity card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your recent study sessions and completed tasks.
            </p>
            {/* Activity list will be added here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

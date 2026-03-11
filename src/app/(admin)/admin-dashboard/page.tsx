import { AdminDashboardPage } from "@/features/admin/admin-dashboard";

export default function DashboardPage() {
  // Mock data
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12.5%",
      trend: "up" as const,
    },
    {
      title: "Active Courses",
      value: "56",
      change: "+8.2%",
      trend: "up" as const,
    },
    {
      title: "Total Revenue",
      value: "$45,678",
      change: "+23.1%",
      trend: "up" as const,
    },
    {
      title: "Pending Transactions",
      value: "89",
      change: "-5.4%",
      trend: "down" as const,
    },
  ];

  const recentActivities = [
    {
      action: "New user registered",
      user: "john.doe@example.com",
      time: "2 minutes ago",
    },
    {
      action: "Course published",
      user: "Advanced TypeScript",
      time: "15 minutes ago",
    },
    {
      action: "Payment received",
      user: "$299.00 from user #4523",
      time: "1 hour ago",
    },
    {
      action: "New user registered",
      user: "jane.smith@example.com",
      time: "2 hours ago",
    },
  ];

  return (
    <AdminDashboardPage stats={stats} recentActivities={recentActivities} />
  );
}


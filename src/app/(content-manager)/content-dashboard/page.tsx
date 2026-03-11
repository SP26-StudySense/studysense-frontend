import { ContentManagerDashboard } from "@/features/content-manager/dashboard";
import { MOCK_CONTENT_MANAGER, MOCK_STATS, MOCK_RECENT_ACTIVITIES } from "@/features/content-manager";

export default function ContentDashboardPage() {
  return (
    <ContentManagerDashboard
      stats={MOCK_STATS}
      recentActivities={MOCK_RECENT_ACTIVITIES}
      contentManager={{
        name: MOCK_CONTENT_MANAGER.name,
        learningSubjectName: MOCK_CONTENT_MANAGER.learningSubjectName,
      }}
    />
  );
}

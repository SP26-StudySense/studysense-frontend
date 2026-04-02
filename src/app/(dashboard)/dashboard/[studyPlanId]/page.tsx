import type { Metadata } from 'next';

import { WelcomeBanner } from '@/features/dashboard/components/WelcomeBanner';
import { StatsOverview } from '@/features/dashboard/components/StatsOverview';
import { TodaysPlan } from '@/features/dashboard/components/TodaysPlan';
import { RecentSessions } from '@/features/dashboard/components/RecentSessions';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { StudyPlanStatusHandler } from '@/features/study-plan/components/StudyPlanStatusHandler';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your learning dashboard',
};

interface DashboardPageProps {
  params: Promise<{ studyPlanId: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { studyPlanId } = await params;

  return (
    <StudyPlanStatusHandler studyPlanId={studyPlanId}>
      <div className="space-y-8 pb-8">
        {/* Welcome Section */}
        <WelcomeBanner studyPlanId={studyPlanId} />

        {/* Stats Grid */}
        <StatsOverview studyPlanId={studyPlanId} />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column (2/3 width) */}
          <div className="space-y-8 lg:col-span-2">
            <TodaysPlan studyPlanId={studyPlanId} />
            <RecentSessions studyPlanId={studyPlanId} />
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-8">
            <QuickActions studyPlanId={studyPlanId} />
          </div>
        </div>
      </div>
    </StudyPlanStatusHandler>
  );
}

import { SessionHistoryPage } from '@/features/sessions/SessionHistoryPage';

interface SessionHistoryByPlanRouteProps {
    params: Promise<{ studyPlanId: string }>;
}

export default async function SessionHistoryByPlanRoute({ params }: SessionHistoryByPlanRouteProps) {
    const { studyPlanId } = await params;
    return <SessionHistoryPage studyPlanId={studyPlanId} />;
}

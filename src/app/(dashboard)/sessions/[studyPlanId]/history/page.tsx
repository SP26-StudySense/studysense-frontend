import { SessionHistoryPage } from '@/features/sessions/SessionHistoryPage';

interface SessionHistoryByPlanRouteProps {
    params: { studyPlanId: string };
}

export default function SessionHistoryByPlanRoute({ params }: SessionHistoryByPlanRouteProps) {
    const { studyPlanId } = params;
    return <SessionHistoryPage studyPlanId={studyPlanId} />;
}

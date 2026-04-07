import { SessionsPage } from '@/features/sessions/SessionsPage';

interface SessionsByPlanRouteProps {
    params: { studyPlanId: string };
}

export default function SessionsByPlanRoute({ params }: SessionsByPlanRouteProps) {
    const { studyPlanId } = params;
    return <SessionsPage studyPlanId={studyPlanId} />;
}

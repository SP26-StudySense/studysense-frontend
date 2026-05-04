import { SessionsPage } from '@/features/sessions/SessionsPage';

interface SessionsByPlanRouteProps {
    params: Promise<{ studyPlanId: string }>;
}

export default async function SessionsByPlanRoute({ params }: SessionsByPlanRouteProps) {
    const { studyPlanId } = await params;
    return <SessionsPage studyPlanId={studyPlanId} />;
}

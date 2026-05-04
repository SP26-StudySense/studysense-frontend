import { RoadmapDetailPage } from '@/features/roadmaps/RoadmapDetailPage';
import { EnrollmentGuard } from '@/features/study-plan/components/enrollment-guard';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function MyRoadmapRoute({ params }: PageProps) {
    const { id } = await params;
    return (
        <EnrollmentGuard studyPlanId={id}>
            <RoadmapDetailPage studyPlanId={parseInt(id)} />
        </EnrollmentGuard>
    );
}

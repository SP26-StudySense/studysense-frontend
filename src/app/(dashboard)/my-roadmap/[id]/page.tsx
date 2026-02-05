import { RoadmapDetailPage } from '@/features/roadmaps/RoadmapDetailPage';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function MyRoadmapRoute({ params }: PageProps) {
    const { id } = await params;
    return <RoadmapDetailPage studyPlanId={parseInt(id)} />;
}

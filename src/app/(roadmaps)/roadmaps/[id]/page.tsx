import { RoadmapDetailPage } from '@/features/roadmaps/RoadmapDetailPage';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function RoadmapSelectRoute({ params }: PageProps) {
    const { id } = await params;
    return <RoadmapDetailPage studyPlanId={parseInt(id)} />;
}

import { RoadmapPreviewPage } from '@/features/roadmaps/RoadmapPreviewPage';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function RoadmapPreviewRoute({ params }: PageProps) {
    const { id } = await params;
    return <RoadmapPreviewPage roadmapId={id} />;
}

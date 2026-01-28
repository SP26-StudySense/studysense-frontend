import { RoadmapDetail } from '@/features/roadmaps/RoadmapDetail';

export default function RoadmapDetailRoute({ params }: { params: { id: string } }) {
    return <RoadmapDetail roadmapId={params.id} />;
}

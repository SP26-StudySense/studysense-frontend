import { StudyPlanDetailPage } from '@/features/study-plan/StudyPlanDetailPage';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function StudyPlanPage({ params }: PageProps) {
    const { id } = await params;
    return <StudyPlanDetailPage planId={id} />;
}

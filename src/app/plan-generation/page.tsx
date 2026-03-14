import { PlanGenerationPage } from '@/features/study-plan/components/PlanGenerationPage';

interface PlanGenerationPageProps {
  searchParams: Promise<{ roadmapId?: string }>;
}

export default async function PlanGeneration({ searchParams }: PlanGenerationPageProps) {
  const { roadmapId } = await searchParams;

  if (!roadmapId) {
    // If no roadmapId, redirect to home
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Invalid Request</h1>
          <p className="text-neutral-600">Missing roadmap ID</p>
        </div>
      </div>
    );
  }

  return <PlanGenerationPage roadmapId={parseInt(roadmapId, 10)} />;
}

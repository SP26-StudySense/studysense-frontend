import { SkipModuleQuizPage } from '@/features/quiz/SkipModuleQuizPage';

interface SkipQuizPageProps {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
  searchParams: Promise<{
    moduleTitle?: string;
  }>;
}

export default async function StudyPlanModuleSkipQuizPage({
  params,
  searchParams,
}: SkipQuizPageProps) {
  const { id, moduleId } = await params;
  const { moduleTitle } = await searchParams;

  return (
    <SkipModuleQuizPage
      studyPlanId={id}
      moduleId={Number(moduleId)}
      moduleTitle={moduleTitle}
    />
  );
}

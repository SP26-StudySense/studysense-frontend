import { CompletedModuleQuizPage } from '@/features/quiz/CompletedModuleQuizPage';

interface TakeQuizPageProps {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
  searchParams: Promise<{
    moduleTitle?: string;
    level?: string;
  }>;
}

export default async function StudyPlanModuleTakeQuizPage({
  params,
  searchParams,
}: TakeQuizPageProps) {
  const { id, moduleId } = await params;
  const { moduleTitle, level } = await searchParams;

  return (
    <CompletedModuleQuizPage
      studyPlanId={id}
      moduleId={Number(moduleId)}
      moduleTitle={moduleTitle}
      level={level}
    />
  );
}

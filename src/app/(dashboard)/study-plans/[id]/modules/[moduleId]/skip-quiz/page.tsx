import { SkipModuleQuizPage } from '@/features/quiz/SkipModuleQuizPage';

interface SkipQuizPageProps {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
  searchParams: Promise<{
    moduleTitle?: string;
    attemptId?: string;
  }>;
}

export default async function StudyPlanModuleSkipQuizPage({
  params,
  searchParams,
}: SkipQuizPageProps) {
  const { id, moduleId } = await params;
  const { moduleTitle, attemptId } = await searchParams;
  const parsedAttemptId = Number(attemptId);
  const quizAttemptId = Number.isFinite(parsedAttemptId) && parsedAttemptId > 0 ? parsedAttemptId : undefined;

  return (
    <SkipModuleQuizPage
      studyPlanId={id}
      moduleId={Number(moduleId)}
      quizAttemptId={quizAttemptId}
      moduleTitle={moduleTitle}
    />
  );
}

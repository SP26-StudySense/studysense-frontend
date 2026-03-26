import { CompletedModuleQuizPage } from '@/features/quiz/CompletedModuleQuizPage';

interface TakeQuizPageProps {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
  searchParams: Promise<{
    moduleTitle?: string;
    level?: string;
    attemptId?: string;
  }>;
}

export default async function StudyPlanModuleTakeQuizPage({
  params,
  searchParams,
}: TakeQuizPageProps) {
  const { id, moduleId } = await params;
  const { moduleTitle, level, attemptId } = await searchParams;
  const parsedAttemptId = Number(attemptId);
  const quizAttemptId = Number.isFinite(parsedAttemptId) && parsedAttemptId > 0 ? parsedAttemptId : undefined;

  return (
    <CompletedModuleQuizPage
      studyPlanId={id}
      moduleId={Number(moduleId)}
      quizAttemptId={quizAttemptId}
      moduleTitle={moduleTitle}
      level={level}
    />
  );
}

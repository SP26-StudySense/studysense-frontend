'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { QuizAttemptPage } from './components/QuizAttemptPage';

interface SkipModuleQuizPageProps {
  studyPlanId: string;
  moduleId: number;
  quizAttemptId?: number;
  moduleTitle?: string;
}

export function SkipModuleQuizPage({ studyPlanId, moduleId, quizAttemptId, moduleTitle }: SkipModuleQuizPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <QuizAttemptPage
      moduleId={moduleId}
      quizAttemptId={quizAttemptId}
      moduleTitle={moduleTitle}
      level="Advanced"
      contextLabel="Skip Module Assessment"
      quizTitle="Advanced Skip Quiz"
      quizDescription={moduleTitle || 'Answer all questions to submit your skip request.'}
      backLabel="Back to Study Plan"
      onBack={() => router.push(`/study-plans/${studyPlanId}`)}
      onSubmitted={async (_result) => {
        await queryClient.invalidateQueries({ queryKey: ['studyPlans', 'detail', studyPlanId] });
        await queryClient.invalidateQueries({ queryKey: ['tasks', 'byPlan', studyPlanId] });
      }}
    />
  );
}

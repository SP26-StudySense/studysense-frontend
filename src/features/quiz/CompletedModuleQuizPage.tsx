'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { QuizAttemptPage } from './components/QuizAttemptPage';

interface CompletedModuleQuizPageProps {
  studyPlanId: string;
  moduleId: number;
  quizAttemptId?: number;
  moduleTitle?: string;
}

export function CompletedModuleQuizPage({
  studyPlanId,
  moduleId,
  quizAttemptId,
  moduleTitle,
}: CompletedModuleQuizPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <QuizAttemptPage
      moduleId={moduleId}
      quizAttemptId={quizAttemptId}
      moduleTitle={moduleTitle}
      contextLabel="Module Completion Quiz"
      quizTitle="Module Quiz"
      quizDescription={
        moduleTitle
          ? `You completed ${moduleTitle}. Take this quiz to evaluate your understanding.`
          : 'Take this quiz to evaluate your understanding of the completed module.'
      }
      backLabel="Back to Study Plan"
      onBack={() => router.push(`/study-plans/${studyPlanId}`)}
      onSubmitted={async (_result) => {
        await queryClient.invalidateQueries({ queryKey: ['studyPlans', 'detail', studyPlanId] });
        await queryClient.invalidateQueries({ queryKey: ['tasks', 'byPlan', studyPlanId] });
      }}
    />
  );
}

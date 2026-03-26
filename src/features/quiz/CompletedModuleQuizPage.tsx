'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { QuizAttemptPage } from './components/QuizAttemptPage';
import type { QuizLevel } from './api/types';

interface CompletedModuleQuizPageProps {
  studyPlanId: string;
  moduleId: number;
  quizAttemptId?: number;
  moduleTitle?: string;
  level?: string;
}

function normalizeLevel(level?: string): QuizLevel {
  if (level === 'Advanced' || level === 'Intermediate' || level === 'Beginner' || level === 'Begineer') {
    return level;
  }

  return 'Intermediate';
}

export function CompletedModuleQuizPage({
  studyPlanId,
  moduleId,
  quizAttemptId,
  moduleTitle,
  level,
}: CompletedModuleQuizPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const selectedLevel = normalizeLevel(level);

  return (
    <QuizAttemptPage
      moduleId={moduleId}
      quizAttemptId={quizAttemptId}
      moduleTitle={moduleTitle}
      level={selectedLevel}
      contextLabel="Module Completion Quiz"
      quizTitle={`${selectedLevel === 'Begineer' ? 'Beginner' : selectedLevel} Module Quiz`}
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

import { useCallback, useMemo, useState } from 'react';

import { useCreateQuizAttempt, useSubmitQuizAttempt } from '../api';
import type {
  CreateQuizAttemptResponse,
  QuizLevel,
  SubmitQuizAttemptResponse,
} from '../api/types';

interface UseQuizAttemptFlowOptions {
  moduleId: number;
  level?: QuizLevel;
  onSubmitted?: (result: SubmitQuizAttemptResponse) => Promise<void> | void;
}

export function useQuizAttemptFlow({
  moduleId,
  level = 'Advanced',
  onSubmitted,
}: UseQuizAttemptFlowOptions) {
  const [attemptData, setAttemptData] = useState<CreateQuizAttemptResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [result, setResult] = useState<SubmitQuizAttemptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateQuizAttempt();
  const submitMutation = useSubmitQuizAttempt();
  const createAttemptAsync = createMutation.mutateAsync;
  const submitAttemptAsync = submitMutation.mutateAsync;

  const questionCount = attemptData?.questions.length ?? 0;
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value != null).length,
    [answers]
  );

  const allAnswered = useMemo(() => {
    if (!attemptData) return false;
    return attemptData.questions.every((question) => answers[question.questionId] != null);
  }, [attemptData, answers]);

  const startAttempt = useCallback(async () => {
    if (!Number.isFinite(moduleId) || moduleId <= 0) {
      setError('Invalid module id.');
      return;
    }

    setError(null);
    setResult(null);
    setAnswers({});

    try {
      const response = await createAttemptAsync({
        createQuizAttempt: {
          studyPlanModuleId: moduleId,
          level,
        },
      });

      setAttemptData(response);
    } catch (err) {
      setAttemptData(null);
      setError(err instanceof Error ? err.message : 'Failed to create quiz attempt.');
    }
  }, [createAttemptAsync, level, moduleId]);

  const setAnswer = useCallback((questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, []);

  const submitAttempt = useCallback(async () => {
    if (!attemptData || !allAnswered) return;

    setError(null);

    try {
      const payload = {
        submitQuizAttempt: {
          id: attemptData.quizAttempt.id,
          answers: attemptData.questions.map((question) => ({
            questionId: question.questionId,
            optionId: answers[question.questionId] ?? null,
          })),
        },
      };

      const response = await submitAttemptAsync({
        id: attemptData.quizAttempt.id,
        payload,
      });

      setResult(response);

      if (onSubmitted) {
        await onSubmitted(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz attempt.');
    }
  }, [allAnswered, answers, attemptData, onSubmitted, submitAttemptAsync]);

  return {
    attemptData,
    answers,
    result,
    error,
    setAnswer,
    startAttempt,
    submitAttempt,
    questionCount,
    answeredCount,
    allAnswered,
    isCreating: createMutation.isPending,
    isSubmitting: submitMutation.isPending,
  };
}

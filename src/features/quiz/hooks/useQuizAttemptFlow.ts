import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiException } from '@/shared/api/errors';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

import {
  useCreateQuizAttempt,
  useCurrentQuizAttemptByModule,
  useQuizQuestionsByAttempt,
  useSaveQuizAnswersByAttempt,
  useSubmitQuizAttempt,
} from '../api';
import type {
  GetCurrentQuizAttemptByModuleResponse,
  GetQuizQuestionsByAttemptResponse,
  QuizLevel,
  SubmitQuizAttemptResponse,
} from '../api/types';

const QUIZ_NOT_FOUND_MESSAGE = 'Khong co quiz cho module nay.';

function isQuizKeyNotFoundError(error: unknown): boolean {
  if (error instanceof ApiException) {
    return error.status === 404 || error.message.includes('KeyNotFoundException');
  }

  if (error instanceof Error) {
    return error.message.includes('KeyNotFoundException') || error.message.includes(QUIZ_NOT_FOUND_MESSAGE);
  }

  return false;
}

interface UseQuizAttemptFlowOptions {
  moduleId: number;
  level?: QuizLevel;
  initialQuizAttemptId?: number;
  onSubmitted?: (result: SubmitQuizAttemptResponse) => Promise<void> | void;
}

export function useQuizAttemptFlow({
  moduleId,
  level = 'Advanced',
  initialQuizAttemptId,
  onSubmitted,
}: UseQuizAttemptFlowOptions) {
  const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(initialQuizAttemptId ?? null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [result, setResult] = useState<SubmitQuizAttemptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQuizUnavailable, setIsQuizUnavailable] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initializedAnswersForAttemptRef = useRef<number | null>(null);

  const createMutation = useCreateQuizAttempt();
  const submitMutation = useSubmitQuizAttempt();
  const saveAnswersMutation = useSaveQuizAnswersByAttempt();
  const { data: currentAttemptData } = useCurrentQuizAttemptByModule(moduleId, {
    enabled: Number.isFinite(moduleId) && moduleId > 0,
  });
  const {
    data: questionsData,
    isFetching: isFetchingQuestions,
    error: questionsError,
  } = useQuizQuestionsByAttempt(currentAttemptId, { enabled: !!currentAttemptId });

  const createAttemptAsync = createMutation.mutateAsync;
  const submitAttemptAsync = submitMutation.mutateAsync;
  const saveAnswersAsync = saveAnswersMutation.mutateAsync;

  useEffect(() => {
    if (initialQuizAttemptId && initialQuizAttemptId > 0) {
      setCurrentAttemptId(initialQuizAttemptId);
      initializedAnswersForAttemptRef.current = null;
      setResult(null);
      setError(null);
      setIsQuizUnavailable(false);
    }
  }, [initialQuizAttemptId]);

  useEffect(() => {
    if (!questionsError) {
      return;
    }

    if (isQuizKeyNotFoundError(questionsError)) {
      setIsQuizUnavailable(true);
      setError(QUIZ_NOT_FOUND_MESSAGE);
      return;
    }

    setError(questionsError instanceof Error ? questionsError.message : 'Failed to load quiz questions.');
  }, [questionsError]);

  useEffect(() => {
    if (!currentAttemptId || !questionsData?.questions) return;
    if (initializedAnswersForAttemptRef.current === currentAttemptId) return;

    const initialAnswers = questionsData.questions.reduce<Record<number, number | null>>((acc, question) => {
      acc[question.questionId] = question.selectedOptionId ?? null;
      return acc;
    }, {});

    initializedAnswersForAttemptRef.current = currentAttemptId;
    setAnswers(initialAnswers);
    setHasUnsavedChanges(false);
  }, [currentAttemptId, questionsData]);

  const questionCount = questionsData?.questions.length ?? 0;
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value != null).length,
    [answers]
  );

  const allAnswered = useMemo(() => {
    if (!questionsData) return false;
    return questionsData.questions.every((question) => answers[question.questionId] != null);
  }, [questionsData, answers]);

  const startAttempt = useCallback(async () => {
    if (!Number.isFinite(moduleId) || moduleId <= 0) {
      setError('Invalid module id.');
      return;
    }

    setError(null);
    setResult(null);
    setIsQuizUnavailable(false);
    setAnswers({});
    setHasUnsavedChanges(false);
    initializedAnswersForAttemptRef.current = null;

    try {
      const existingAttemptId = currentAttemptData?.quizAttempt?.id;
      if (existingAttemptId) {
        setCurrentAttemptId(existingAttemptId);
        return;
      }

      try {
        await get<GetCurrentQuizAttemptByModuleResponse>(
          endpoints.quizAttempts.currentByModule(String(moduleId))
        );
      } catch (precheckError) {
        if (isQuizKeyNotFoundError(precheckError)) {
          setCurrentAttemptId(null);
          setIsQuizUnavailable(true);
          setError(QUIZ_NOT_FOUND_MESSAGE);
          return;
        }

        throw precheckError;
      }

      const response = await createAttemptAsync({
        createQuizAttempt: {
          studyPlanModuleId: moduleId,
          level,
        },
      });

      setCurrentAttemptId(response.id);
    } catch (err) {
      setCurrentAttemptId(null);
      if (isQuizKeyNotFoundError(err)) {
        setIsQuizUnavailable(true);
        setError(QUIZ_NOT_FOUND_MESSAGE);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create quiz attempt.');
      }
    }
  }, [createAttemptAsync, currentAttemptData?.quizAttempt?.id, level, moduleId]);

  const setAnswer = useCallback((questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setHasUnsavedChanges(true);
  }, []);

  const saveAnswers = useCallback(async () => {
    if (!currentAttemptId || !questionsData?.questions.length) {
      return;
    }

    setError(null);

    const payload = {
      attemptId: currentAttemptId,
      quizAnswers: questionsData.questions.map((question) => ({
        attemptId: currentAttemptId,
        questionId: question.questionId,
        optionId: answers[question.questionId] ?? null,
        textValue: null,
        numberValue: null,
        answeredAt: new Date().toISOString(),
      })),
    };

    try {
      await saveAnswersAsync({
        attemptId: currentAttemptId,
        payload,
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz answers.');
      throw err;
    }
  }, [answers, currentAttemptId, questionsData, saveAnswersAsync]);

  const submitAttempt = useCallback(async () => {
    if (!currentAttemptId || !questionsData || !allAnswered) return;

    setError(null);

    try {
      if (hasUnsavedChanges) {
        await saveAnswers();
      }

      const payload = {
        submitQuizAttempt: {
          id: currentAttemptId,
          answers: questionsData.questions.map((question) => ({
            questionId: question.questionId,
            optionId: answers[question.questionId] ?? null,
          })),
        },
      };

      const response = await submitAttemptAsync({
        id: currentAttemptId,
        payload,
      });

      setResult(response);
      setHasUnsavedChanges(false);

      if (onSubmitted) {
        await onSubmitted(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz attempt.');
    }
  }, [
    allAnswered,
    answers,
    currentAttemptId,
    hasUnsavedChanges,
    onSubmitted,
    questionsData,
    saveAnswers,
    submitAttemptAsync,
  ]);

  const resetAttempt = useCallback((nextAttemptId?: number) => {
    initializedAnswersForAttemptRef.current = null;
    setAnswers({});
    setResult(null);
    setError(null);
    setIsQuizUnavailable(false);
    setHasUnsavedChanges(false);
    setCurrentAttemptId(nextAttemptId ?? null);
  }, []);

  return {
    attemptId: currentAttemptId,
    questionsData: questionsData as GetQuizQuestionsByAttemptResponse | undefined,
    answers,
    result,
    error,
    isQuizUnavailable,
    hasUnsavedChanges,
    setAnswer,
    saveAnswers,
    startAttempt,
    resetAttempt,
    submitAttempt,
    questionCount,
    answeredCount,
    allAnswered,
    isCreating: createMutation.isPending || (isFetchingQuestions && !questionsData && !questionsError),
    isSaving: saveAnswersMutation.isPending,
    isSubmitting: submitMutation.isPending,
  };
}

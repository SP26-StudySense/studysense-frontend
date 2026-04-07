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
  QuizAttemptQuestionDto,
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
  createAttemptLevel?: QuizLevel;
  initialQuizAttemptId?: number;
  onSubmitted?: (result: SubmitQuizAttemptResponse) => Promise<void> | void;
}

interface QuizAnswerValue {
  optionId: number | null;
  optionIds: number[];
  textValue: string;
}

function createEmptyAnswer(): QuizAnswerValue {
  return {
    optionId: null,
    optionIds: [],
    textValue: '',
  };
}

function isQuestionAnswered(question: QuizAttemptQuestionDto, answer: QuizAnswerValue | undefined): boolean {
  if (!answer) {
    return false;
  }

  if (question.type === 'MultipleChoice') {
    return answer.optionIds.length > 0;
  }

  if (question.type === 'ShortAnswer') {
    return answer.textValue.trim().length > 0;
  }

  return answer.optionId != null;
}

export function useQuizAttemptFlow({
  moduleId,
  createAttemptLevel,
  initialQuizAttemptId,
  onSubmitted,
}: UseQuizAttemptFlowOptions) {
  const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(initialQuizAttemptId ?? null);
  const [answers, setAnswers] = useState<Record<number, QuizAnswerValue>>({});
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

    const initialAnswers = questionsData.questions.reduce<Record<number, QuizAnswerValue>>((acc, question) => {
      acc[question.questionId] = {
        optionId: question.selectedOptionId ?? null,
        optionIds: question.selectedOptionIds ?? [],
        textValue: question.selectedTextValue ?? '',
      };
      return acc;
    }, {});

    initializedAnswersForAttemptRef.current = currentAttemptId;
    setAnswers(initialAnswers);
    setHasUnsavedChanges(false);
  }, [currentAttemptId, questionsData]);

  const questionCount = questionsData?.questions.length ?? 0;
  const answeredCount = useMemo(
    () => (questionsData?.questions ?? []).filter((question) => isQuestionAnswered(question, answers[question.questionId])).length,
    [answers, questionsData?.questions]
  );

  const allAnswered = useMemo(() => {
    if (!questionsData) return false;
    return questionsData.questions.every((question) => isQuestionAnswered(question, answers[question.questionId]));
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
          ...(createAttemptLevel ? { level: createAttemptLevel } : {}),
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
  }, [createAttemptAsync, createAttemptLevel, currentAttemptData?.quizAttempt?.id, moduleId]);

  const setSingleChoiceAnswer = useCallback((questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...createEmptyAnswer(),
        optionId,
      },
    }));
    setHasUnsavedChanges(true);
  }, []);

  const toggleMultipleChoiceAnswer = useCallback((questionId: number, optionId: number) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? createEmptyAnswer();
      const optionIds = current.optionIds.includes(optionId)
        ? current.optionIds.filter((id) => id !== optionId)
        : [...current.optionIds, optionId];

      return {
        ...prev,
        [questionId]: {
          ...createEmptyAnswer(),
          optionIds,
        },
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  const setShortAnswer = useCallback((questionId: number, textValue: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...createEmptyAnswer(),
        textValue,
      },
    }));
    setHasUnsavedChanges(true);
  }, []);

  const saveAnswers = useCallback(async () => {
    if (!currentAttemptId || !questionsData?.questions.length) {
      return;
    }

    setError(null);

    const payload = {
      attemptId: currentAttemptId,
      quizAnswers: questionsData.questions.map((question) => {
        const answer = answers[question.questionId] ?? createEmptyAnswer();
        const normalizedOptionIds = Array.from(new Set(answer.optionIds));
        const normalizedText = answer.textValue.trim();

        // Type-specific payload mapping per API contract
        let answerPayload;

        if (question.type === 'MultipleChoice') {
          // Send all selected options in optionIds array
          // Include first as optionId for backward compatibility
          answerPayload = {
            questionId: question.questionId,
            optionId: normalizedOptionIds[0] ?? null,
            optionIds: normalizedOptionIds,
            textValue: null,
            answeredAt: new Date().toISOString(),
          };
        } else if (question.type === 'ShortAnswer') {
          // Send text answer, clear options
          answerPayload = {
            questionId: question.questionId,
            optionId: null,
            optionIds: [],
            textValue: normalizedText ? answer.textValue : null,
            answeredAt: new Date().toISOString(),
          };
        } else {
          // SingleChoice: send single optionId
          answerPayload = {
            questionId: question.questionId,
            optionId: answer.optionId ?? null,
            optionIds: [],
            textValue: null,
            answeredAt: new Date().toISOString(),
          };
        }

        return answerPayload;
      }),
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
          answers: questionsData.questions.map((question) => {
            const answer = answers[question.questionId] ?? createEmptyAnswer();
            const normalizedOptionIds = Array.from(new Set(answer.optionIds));
            const normalizedText = answer.textValue.trim();

            // Type-specific payload mapping per API contract
            if (question.type === 'MultipleChoice') {
              return {
                questionId: question.questionId,
                optionId: normalizedOptionIds[0] ?? null,
                optionIds: normalizedOptionIds,
                textValue: null,
              };
            }

            if (question.type === 'ShortAnswer') {
              return {
                questionId: question.questionId,
                optionId: null,
                optionIds: [],
                textValue: normalizedText || null,
              };
            }

            // SingleChoice
            return {
              questionId: question.questionId,
              optionId: answer.optionId ?? null,
              optionIds: [],
              textValue: null,
            };
          }),
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
    setSingleChoiceAnswer,
    toggleMultipleChoiceAnswer,
    setShortAnswer,
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

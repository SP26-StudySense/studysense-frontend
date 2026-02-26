'use client';

/**
 * Facade hook for SurveyPage — single entry point for all survey logic.
 *
 * Combines:
 *  - useSurveyGuard        : back-button & unload protection
 *  - useSurveyNavigation   : step management & validation
 *  - useSurveyAutoSave     : periodic draft persistence
 *  - API queries           : survey metadata, questions, options, prefetch
 *  - useSubmitSurvey       : answer submission
 *
 * SurveyPage only needs to call this hook and wire up the returned
 * values to JSX — no business logic should live in the component.
 */

import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useSurveyByCode,
  useSurveyQuestionsWithOptions,
  useQuestionOptions,
  prefetchQuestionOptions,
} from '../api/queries';
import { useSubmitSurvey } from '../api/mutations';
import { useSurveyAutoSave, loadSurveyDraft } from './useSurveyAutoSave';
import { useSurveyGuard } from './use-survey-guard';
import { useSurveyNavigation } from './use-survey-navigation';
import { SurveyTriggerReason } from '../types';
import type { SurveyResponse, SurveyQuestion, QuestionType } from '../types';

// ─── Public interface ────────────────────────────────────────────────────────

interface UseSurveyPageOptions {
  surveyCode: string;
  triggerReason: SurveyTriggerReason;
  /** Path to redirect to after the survey is submitted. Defaults to '/dashboard'. */
  returnTo?: string;
}

export interface UseSurveyPageReturn {
  // Survey metadata
  surveyTitle: string | undefined;

  // Current question enriched with its options
  currentQuestionWithOptions: SurveyQuestion | undefined;

  // All responses collected so far (needed for progress indicators)
  responses: Record<string, SurveyResponse>;

  // Loading / error states
  // true while survey metadata or questions are fetching (full-page spinner)
  isLoading: boolean;
  // true while the current question's options are fetching (inline spinner)
  isOptionsLoading: boolean;
  error: Error | null;

  // Submission
  isPending: boolean;

  // Navigation (delegated from useSurveyNavigation)
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  validationError: string | null;
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (step: number) => void;

  // Response update
  handleResponseChange: (response: SurveyResponse) => void;

  // All questions (needed for step-dot indicators)
  questions: SurveyQuestion[] | undefined;
}

// ─── Implementation ──────────────────────────────────────────────────────────

export function useSurveyPage({
  surveyCode,
  triggerReason,
  returnTo = '/dashboard',
}: UseSurveyPageOptions): UseSurveyPageReturn {
  const queryClient = useQueryClient();

  const [startedAt] = useState(() => new Date());
  const [responses, setResponses] = useState<Record<string, SurveyResponse>>({});
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Guard ─────────────────────────────────────────────────────────────────
  useSurveyGuard(triggerReason);

  // ── Survey metadata ───────────────────────────────────────────────────────
  const {
    data: survey,
    isLoading: surveyLoading,
    error: surveyError,
  } = useSurveyByCode(surveyCode);

  const surveyId = survey?.id;

  // ── Draft: load once surveyId is available ────────────────────────────────
  useEffect(() => {
    if (!surveyId) return;

    const draft = loadSurveyDraft(surveyId);
    if (draft) {
      setResponses(draft.responses);
      console.log('[Survey] Loaded draft with', Object.keys(draft.responses).length, 'answers');
    }
    setDraftLoaded(true);
  }, [surveyId]);

  // ── Questions ─────────────────────────────────────────────────────────────
  const {
    data: questions,
    isLoading: questionsLoading,
    error: questionsError,
  } = useSurveyQuestionsWithOptions(surveyId ?? 0, { enabled: !!surveyId });

  // ── Question-type map (needed by submit transformer) ──────────────────────
  const questionTypes = useMemo<Record<string, QuestionType>>(() => {
    if (!questions) return {};
    return questions.reduce(
      (acc, q) => {
        acc[q.id] = q.type;
        return acc;
      },
      {} as Record<string, QuestionType>
    );
  }, [questions]);

  // ── Auto-save ─────────────────────────────────────────────────────────────
  useSurveyAutoSave(
    surveyId ?? 0,
    responses,
    startedAt,
    draftLoaded && !!surveyId && !isSubmitting
  );

  // ── Submit mutation ───────────────────────────────────────────────────────
  const submitMutation = useSubmitSurvey(
    surveyId ?? 0,
    questionTypes,
    startedAt,
    triggerReason,
    returnTo
  );

  // ── Submission handler (API call only — validation lives in navigation) ───
  const handleSubmit = () => {
    if (!surveyId) return;

    const validQuestionIds = new Set(questions?.map((q) => q.id) ?? []);
    const validResponses = Object.values(responses).filter((r) =>
      validQuestionIds.has(r.questionId)
    );

    setIsSubmitting(true);
    submitMutation.mutate(validResponses);
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const navigation = useSurveyNavigation({ questions, responses, onSubmit: handleSubmit });

  const { currentQuestion } = navigation;

  // ── Options for the currently displayed question ──────────────────────────
  const { data: currentOptions, isLoading: optionsLoading } = useQuestionOptions(
    currentQuestion?.id ?? '',
    { enabled: !!currentQuestion }
  );

  // ── Prefetch next question's options in background ────────────────────────
  useEffect(() => {
    if (!questions || navigation.currentStep >= questions.length - 1) return;
    const nextQuestion = questions[navigation.currentStep + 1];
    if (nextQuestion?.id) {
      prefetchQuestionOptions(queryClient, nextQuestion.id);
    }
  }, [navigation.currentStep, questions, queryClient]);

  // ── Merge current question with its options ───────────────────────────────
  const currentQuestionWithOptions: SurveyQuestion | undefined = currentQuestion
    ? { ...currentQuestion, options: currentOptions ?? [] }
    : undefined;

  // ── Response change ───────────────────────────────────────────────────────
  const handleResponseChange = (response: SurveyResponse) => {
    setResponses((prev) => ({ ...prev, [response.questionId]: response }));
    navigation.setValidationError(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return {
    surveyTitle: survey?.title,
    currentQuestionWithOptions,
    responses,
    questions,

    isLoading: surveyLoading || questionsLoading,
    isOptionsLoading: optionsLoading,
    error: (surveyError ?? questionsError) as Error | null,

    isPending: submitMutation.isPending,

    // Navigation
    currentStep: navigation.currentStep,
    totalSteps: navigation.totalSteps,
    isFirstStep: navigation.isFirstStep,
    isLastStep: navigation.isLastStep,
    validationError: navigation.validationError,
    goToNext: navigation.goToNext,
    goToPrevious: navigation.goToPrevious,
    goToStep: navigation.goToStep,

    handleResponseChange,
  };
}

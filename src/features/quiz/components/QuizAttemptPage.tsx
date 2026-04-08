'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, XCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDateTimeHmDdMmYyyyInUserTimeZone } from '@/shared/lib/date-time';

import {
  QuizAttemptStatus,
  type QuizLevel,
  type SubmitQuizAttemptResponse,
} from '../api/types';
import { useQuizAttemptFlow } from '../hooks/useQuizAttemptFlow';
import { QuizNavigationConfirmDialog, type QuizConfirmDialogType } from './QuizNavigationConfirmDialog';

interface QuizAttemptPageProps {
  moduleId: number;
  quizAttemptId?: number;
  moduleTitle?: string;
  createAttemptLevel?: QuizLevel;
  contextLabel: string;
  quizTitle: string;
  quizDescription: string;
  loadingTitle?: string;
  loadingDescription?: string;
  backLabel?: string;
  onBack: () => void;
  onSubmitted?: (result: SubmitQuizAttemptResponse) => Promise<void> | void;
}

export function QuizAttemptPage({
  moduleId,
  quizAttemptId,
  moduleTitle,
  createAttemptLevel,
  contextLabel,
  quizTitle,
  quizDescription,
  loadingTitle,
  loadingDescription,
  backLabel = 'Back',
  onBack,
  onSubmitted,
}: QuizAttemptPageProps) {
  const {
    attemptId,
    questionsData,
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
    isCreating,
    isSaving,
    isSubmitting,
  } = useQuizAttemptFlow({
    moduleId,
    createAttemptLevel,
    initialQuizAttemptId: quizAttemptId,
    onSubmitted,
  });

  const attemptKey = useMemo(
    () => `${moduleId}:${quizAttemptId ?? 'new'}`,
    [moduleId, quizAttemptId]
  );
  const initializedAttemptKeyRef = useRef<string>('');
  const allowNavigationRef = useRef(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<QuizConfirmDialogType>('simple');
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [isSubmitFlowPending, setIsSubmitFlowPending] = useState(false);
  const dialogPromiseResolveRef = useRef<((value: boolean) => void) | null>(null);

  useEffect(() => {
    if (initializedAttemptKeyRef.current === attemptKey) {
      return;
    }

    initializedAttemptKeyRef.current = attemptKey;
    if (quizAttemptId && quizAttemptId > 0) {
      resetAttempt(quizAttemptId);
      return;
    }

    startAttempt();
  }, [attemptKey, quizAttemptId, resetAttempt, startAttempt]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [attemptId]);

  const shouldBlockNavigation = !!questionsData && !result;

  const orderedQuestions = useMemo(() => {
    return [...(questionsData?.questions ?? [])].sort((a, b) => a.orderNo - b.orderNo);
  }, [questionsData?.questions]);

  const shuffledOptionsByQuestionId = useMemo(() => {
    const hashString = (value: string): number => {
      let hash = 0;
      for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
      }
      return hash;
    };

    const mulberry32 = (seed: number) => {
      let t = seed;
      return () => {
        t += 0x6d2b79f5;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
      };
    };

    return orderedQuestions.reduce<Record<number, typeof orderedQuestions[number]['options']>>((acc, question) => {
      const orderedOptions = [...question.options].sort((a, b) => a.orderNo - b.orderNo);
      const seed = hashString(`${attemptId ?? 0}:${question.questionId}:${moduleId}`);
      const random = mulberry32(seed);

      for (let i = orderedOptions.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [orderedOptions[i], orderedOptions[j]] = [orderedOptions[j], orderedOptions[i]];
      }

      acc[question.questionId] = orderedOptions;
      return acc;
    }, {});
  }, [attemptId, moduleId, orderedQuestions]);

  const showConfirmDialog = useCallback(
    (type: QuizConfirmDialogType): Promise<boolean> => {
      return new Promise((resolve) => {
        setDialogType(type);
        setIsDialogOpen(true);
        dialogPromiseResolveRef.current = resolve;
      });
    },
    []
  );

  const handleDialogConfirm = useCallback(async () => {
    setIsDialogLoading(true);
    try {
      if (dialogType === 'save') {
        // Save answers before leaving
        await saveAnswers();
        setIsDialogOpen(false);
        setIsDialogLoading(false);
        dialogPromiseResolveRef.current?.(true);
      } else {
        // 'simple' or 'save-error' case - just leave
        setIsDialogOpen(false);
        setIsDialogLoading(false);
        dialogPromiseResolveRef.current?.(true);
      }
    } catch (error) {
      // Save failed - show error dialog
      setIsDialogLoading(false);
      setDialogType('save-error');
      // User will click confirm again on error dialog
    }
  }, [dialogType, saveAnswers]);

  const handleDialogCancel = useCallback(() => {
    setIsDialogOpen(false);
    setIsDialogLoading(false);

    // For 'save' type, cancel means "leave without saving" -> resolve true
    if (dialogType === 'save') {
      dialogPromiseResolveRef.current?.(true);
    } else {
      // For 'simple' and 'save-error', cancel means "don't leave" -> resolve false
      dialogPromiseResolveRef.current?.(false);
    }
  }, [dialogType]);

  const confirmBeforeLeave = useCallback(async () => {
    if (!shouldBlockNavigation) {
      return true;
    }

    if (!hasUnsavedChanges) {
      const confirmed = await showConfirmDialog('simple');
      return confirmed;
    }

    const shouldSave = await showConfirmDialog('save');
    return shouldSave;
  }, [hasUnsavedChanges, showConfirmDialog, shouldBlockNavigation]);

  const handleBackClick = useCallback(async () => {
    const canLeave = await confirmBeforeLeave();
    if (!canLeave) {
      return;
    }

    allowNavigationRef.current = true;
    onBack();
  }, [confirmBeforeLeave, onBack]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldBlockNavigation || allowNavigationRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldBlockNavigation]);

  useEffect(() => {
    if (!shouldBlockNavigation) {
      return;
    }

    window.history.pushState(null, '', window.location.href);

    const handlePopState = async () => {
      if (allowNavigationRef.current) {
        return;
      }

      const canLeave = await confirmBeforeLeave();
      if (canLeave) {
        allowNavigationRef.current = true;
        window.history.back();
        return;
      }

      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [confirmBeforeLeave, shouldBlockNavigation]);

  // Set data attribute for navigation guard in Sidebar
  useEffect(() => {
    if (shouldBlockNavigation && hasUnsavedChanges) {
      document.documentElement.setAttribute('data-quiz-unsaved-changes', 'true');
      return () => {
        document.documentElement.removeAttribute('data-quiz-unsaved-changes');
      };
    } else {
      document.documentElement.removeAttribute('data-quiz-unsaved-changes');
    }
  }, [shouldBlockNavigation, hasUnsavedChanges]);
  const isPassed =
    result?.quizAttempt.status === QuizAttemptStatus.Passed || result?.quizAttempt.status === "Passed";
  const correctCount = result?.questions.filter((question) => question.isCorrect).length ?? 0;
  const currentQuestion = orderedQuestions[currentQuestionIndex];
  const isSubmitPending = isSubmitFlowPending || isSaving || isSubmitting;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = questionCount > 0 && currentQuestionIndex === questionCount - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.questionId] : undefined;

  const quizMeta = questionsData?.quiz;
  const headerTitle = quizMeta?.title || quizTitle;
  const headerDescription = quizMeta?.description || quizDescription;
  const headerLevel = quizMeta?.level;
  const headerPassingScore = quizMeta?.passingScore;
  const isInitialLoading = !result && !error && (!questionsData || !attemptId || isCreating);

  const formatDateTime = (value: string | null | undefined) => {
    return formatDateTimeHmDdMmYyyyInUserTimeZone(value, { fallback: '-' });
  };

  const getReviewAnswerDisplay = (question: SubmitQuizAttemptResponse['questions'][number], type: 'selected' | 'correct') => {
    if (question.type === 'ShortAnswer') {
      const textValue = type === 'selected' ? question.selectedTextValue : question.correctTextValue;
      return textValue || 'No answer';
    }

    if (question.type === 'MultipleChoice') {
      const optionText = type === 'selected' ? question.selectedOptionText : question.correctOptionText;
      if (optionText) {
        return optionText;
      }

      const ids = type === 'selected' ? question.selectedOptionIds : question.correctOptionIds;
      if (ids.length > 0) {
        return ids.join(', ');
      }
    }

    const fallback = type === 'selected' ? question.selectedOptionText : question.correctOptionText;
    return fallback || 'No answer';
  };

  const getCurrentQuestionAnsweredState = () => {
    if (!currentQuestion || !currentAnswer) {
      return false;
    }

    if (currentQuestion.type === 'MultipleChoice') {
      return currentAnswer.optionIds.length > 0;
    }

    if (currentQuestion.type === 'ShortAnswer') {
      return currentAnswer.textValue.trim().length > 0;
    }

    return currentAnswer.optionId != null;
  };

  const handleQuestionJump = (index: number) => {
    if (index < 0 || index >= questionCount) return;
    setCurrentQuestionIndex(index);
  };

  const handleSubmitClick = useCallback(async () => {
    if (isSubmitPending) return;

    setIsSubmitFlowPending(true);
    try {
      await submitAttempt();
    } finally {
      setIsSubmitFlowPending(false);
    }
  }, [isSubmitPending, submitAttempt]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] flex items-center justify-center px-4">
        <div className="rounded-3xl bg-white/90 border border-neutral-200/60 p-8 w-full max-w-xl text-center shadow-xl shadow-neutral-900/10">
          <div className="mb-4 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">{loadingTitle || 'Preparing your quiz'}</h1>
          <p className="text-sm text-neutral-500">{loadingDescription || 'Generating questions for this module...'}</p>
        </div>
      </div>
    );
  }

  if (error && !questionsData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] flex items-center justify-center px-4">
        <div className={`rounded-3xl bg-white/95 p-8 w-full max-w-xl text-center shadow-xl ${
          isQuizUnavailable ? 'border border-amber-200 shadow-amber-900/10' : 'border border-red-200 shadow-red-900/10'
        }`}>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">
            {isQuizUnavailable ? 'Khong co quiz cho module nay' : 'Could not start quiz'}
          </h1>
          <p className="text-sm text-neutral-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleBackClick}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50"
            >
              {backLabel}
            </button>
            {!isQuizUnavailable && (
              <button
                onClick={startAttempt}
                className="px-4 py-2.5 rounded-xl bg-[#00bae2] text-white font-semibold hover:bg-[#00a8cc]"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] py-8 px-4">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-3xl bg-white/90 border border-neutral-200/60 p-6 sm:p-8 shadow-xl shadow-neutral-900/10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm text-neutral-500 mb-1">{contextLabel}</p>
                <h1 className="text-2xl font-bold text-neutral-900">{moduleTitle || 'Module Quiz Result'}</h1>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                  isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isPassed ? 'Passed' : 'Failed'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Score</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{result.quizAttempt.score ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Correct</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {correctCount}/{result.questions.length}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Started At</p>
                <p className="text-sm font-semibold text-neutral-800 mt-2">
                  {formatDateTime(result.quizAttempt.startedAt)}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Submitted At</p>
                <p className="text-sm font-semibold text-neutral-800 mt-2">
                  {formatDateTime(result.quizAttempt.submittedAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/90 border border-neutral-200/60 p-5 sm:p-6 shadow-xl shadow-neutral-900/10 space-y-3">
            {result.questions.map((question, index) => (
              <div
                key={question.questionId}
                className={`rounded-2xl border p-4 ${
                  question.isCorrect ? 'border-emerald-200 bg-emerald-50/70' : 'border-red-200 bg-red-50/70'
                }`}
              >
                <div className="flex items-start gap-2">
                  {question.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 mb-1">Question {index + 1}</p>
                    <p className="font-medium text-neutral-900">{question.prompt}</p>
                    <p className="text-xs text-neutral-500 mt-1">Type: {question.type}</p>
                    <p className="text-sm text-neutral-600 mt-2">
                      Your answer: <span className="font-medium">{getReviewAnswerDisplay(question, 'selected')}</span>
                    </p>
                    {!question.isCorrect && (
                      <p className="text-sm text-neutral-700 mt-1">
                        Correct answer: <span className="font-semibold">{getReviewAnswerDisplay(question, 'correct')}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-end">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </button>
            {!isPassed && (
              <button
                onClick={() => {
                  resetAttempt();
                  startAttempt();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] py-8 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl bg-white/90 border border-neutral-200/60 p-6 sm:p-8 shadow-xl shadow-neutral-900/10">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </button>

          <h1 className="text-2xl font-bold text-neutral-900">{headerTitle}</h1>
          <p className="text-neutral-600 mt-2">{headerDescription}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-cyan-50 text-cyan-700 px-2.5 py-1 text-xs font-semibold">
              Level: {headerLevel}
            </span>
            {typeof headerPassingScore === 'number' && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-semibold">
                Passing Score: {headerPassingScore}
              </span>
            )}
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 h-fit rounded-3xl bg-white/95 border border-neutral-200/70 p-4 shadow-xl shadow-neutral-900/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Question Tracker</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Click a number to jump to that question.
                </p>
              </div>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
                {answeredCount}/{questionCount}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
              {orderedQuestions.map((question, index) => {
                const isCurrent = index === currentQuestionIndex;
                const currentQuestionAnswer = answers[question.questionId];
                const isAnswered = question.type === 'MultipleChoice'
                  ? (currentQuestionAnswer?.optionIds.length ?? 0) > 0
                  : question.type === 'ShortAnswer'
                    ? (currentQuestionAnswer?.textValue.trim().length ?? 0) > 0
                    : currentQuestionAnswer?.optionId != null;

                return (
                  <button
                    key={question.questionId}
                    onClick={() => handleQuestionJump(index)}
                    className={`h-10 rounded-xl border text-sm font-semibold transition-all ${
                      isCurrent
                        ? 'border-[#00bae2] bg-[#00bae2] text-white shadow-md shadow-cyan-500/20'
                        : isAnswered
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                    aria-label={`Go to question ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-neutral-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00bae2]" />
                Current
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Answered
              </div>
              <div className="col-span-2 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                Not answered
              </div>
            </div>

            <div className="mt-4 h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00bae2] to-emerald-500 transition-all"
                style={{ width: questionCount > 0 ? `${(answeredCount / questionCount) * 100}%` : '0%' }}
              />
            </div>

            <p className="mt-3 text-xs text-neutral-500">
              {allAnswered
                ? 'All questions answered. You can submit now.'
                : 'Answer all questions before submitting.'}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                disabled={isFirstQuestion}
                className="inline-flex items-center justify-center rounded-xl h-10 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous question"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, questionCount - 1))}
                disabled={isLastQuestion || questionCount === 0}
                className="inline-flex items-center justify-center rounded-xl h-10 border border-cyan-200 text-cyan-700 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next question"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={saveAnswers}
                disabled={!hasUnsavedChanges || isSaving || isSubmitting}
                className="col-span-2 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium border border-cyan-200 text-cyan-700 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Progress'}
              </button>

              <button
                onClick={handleSubmitClick}
                disabled={!allAnswered || isSubmitPending}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#00bae2] to-emerald-500 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {isSaving ? 'Saving answers...' : 'Submitting...'}
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </button>
            </div>
          </aside>

          <section className="space-y-4">
            {currentQuestion && (
              <div
                key={currentQuestion.questionId}
                className="rounded-3xl bg-white/90 border border-neutral-200/60 p-5 sm:p-6 shadow-xl shadow-neutral-900/10"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Question {currentQuestionIndex + 1} of {questionCount}
                  </p>
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
                    {currentQuestion.type}
                  </span>
                  <span className="text-xs font-medium text-neutral-500">
                    {getCurrentQuestionAnsweredState() ? 'Answered' : 'Not answered'}
                  </span>
                </div>
                <p className="text-lg font-semibold text-neutral-900">{currentQuestion.prompt}</p>

                {currentQuestion.type === 'ShortAnswer' ? (
                  <div className="mt-4">
                    <label htmlFor={`short-answer-${currentQuestion.questionId}`} className="sr-only">
                      Short answer input
                    </label>
                    <textarea
                      id={`short-answer-${currentQuestion.questionId}`}
                      value={currentAnswer?.textValue ?? ''}
                      onChange={(event) => setShortAnswer(currentQuestion.questionId, event.target.value)}
                      rows={5}
                      placeholder="Type your answer here..."
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/20"
                    />
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-2.5">
                    {(shuffledOptionsByQuestionId[currentQuestion.questionId] ?? currentQuestion.options).map((option, optionIndex) => {
                      const isSelected = currentQuestion.type === 'MultipleChoice'
                        ? (currentAnswer?.optionIds ?? []).includes(option.optionId)
                        : currentAnswer?.optionId === option.optionId;
                      const displayLabel = optionIndex < 26 ? String.fromCharCode(65 + optionIndex) : `${optionIndex + 1}`;

                      return (
                        <button
                          key={option.optionId}
                          onClick={() => {
                            if (currentQuestion.type === 'MultipleChoice') {
                              toggleMultipleChoiceAnswer(currentQuestion.questionId, option.optionId);
                              return;
                            }

                            setSingleChoiceAnswer(currentQuestion.questionId, option.optionId);
                          }}
                          className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                            isSelected
                              ? 'border-[#00bae2] bg-[#00bae2]/10 text-neutral-900'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <span className="text-xs font-bold text-neutral-500 mr-2">{displayLabel}.</span>
                          <span className="text-sm font-medium">{option.displayText}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Navigation Confirmation Dialog */}
        <QuizNavigationConfirmDialog
          isOpen={isDialogOpen}
          onClose={handleDialogCancel}
          onConfirm={handleDialogConfirm}
          type={dialogType}
          isLoading={isDialogLoading}
        />
      </div>
    </div>
  );
}

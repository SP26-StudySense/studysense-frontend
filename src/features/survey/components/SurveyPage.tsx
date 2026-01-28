'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Save, Info } from 'lucide-react';
import { toast } from '@/shared/lib';
import { useSurvey, useSurveyQuestionsWithOptions, useQuestionOptions, prefetchQuestionOptions } from '../api/queries';
import { useSubmitSurvey } from '../api/mutations';
import { QuestionRenderer } from './questions';
import { useSurveyAutoSave, loadSurveyDraft, clearSurveyDraft } from '../hooks/useSurveyAutoSave';
import type { SurveyResponse, SurveyQuestion, QuestionType } from '../types';

interface SurveyPageProps {
  surveyId: number;
  isInitialSurvey?: boolean; // Mark as initial required survey
}

export function SurveyPage({ surveyId, isInitialSurvey = false }: SurveyPageProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [startedAt] = useState(() => new Date()); // Track when user started
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, SurveyResponse>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Prevent back navigation for initial survey
  useEffect(() => {
    if (isInitialSurvey) {
      // Prevent browser back button
      const preventBack = () => {
        window.history.pushState(null, '', window.location.href);
      };

      // Push initial state
      window.history.pushState(null, '', window.location.href);
      
      // Listen for popstate (back button)
      window.addEventListener('popstate', preventBack);

      return () => {
        window.removeEventListener('popstate', preventBack);
      };
    }
  }, [isInitialSurvey]);

  // Warn before leaving page if survey not completed
  useEffect(() => {
    if (isInitialSurvey) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        return (e.returnValue = 'Your progress will be lost. Are you sure you want to leave?');
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isInitialSurvey]);

  // Load draft on mount
  useEffect(() => {
    const draft = loadSurveyDraft(surveyId);
    if (draft) {
      setResponses(draft.responses);
      console.log('[Survey] Loaded draft with', Object.keys(draft.responses).length, 'answers');
    }
    setDraftLoaded(true);
  }, [surveyId]);

  // Fetch survey data
  const { data: survey, isLoading: surveyLoading, error: surveyError } = useSurvey(surveyId);
  const {
    data: questions,
    isLoading: questionsLoading,
    error: questionsError,
  } = useSurveyQuestionsWithOptions(surveyId);

  // Create question types map for submission
  const questionTypes = useMemo(() => {
    if (!questions) return {};
    return questions.reduce((acc, q) => {
      acc[q.id] = q.type;
      return acc;
    }, {} as Record<string, QuestionType>);
  }, [questions]);

  // Auto-save to localStorage every 30s
  useSurveyAutoSave(surveyId, responses, startedAt, draftLoaded);

  // Submit mutation with question types and startedAt
  const submitMutation = useSubmitSurvey(surveyId, questionTypes, startedAt);

  const currentQuestion = questions?.[currentStep];
  const totalSteps = questions?.length || 0;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  // Fetch options for current question only
  const { data: currentOptions, isLoading: optionsLoading } = useQuestionOptions(
    currentQuestion?.id || '',
    { enabled: !!currentQuestion }
  );

  const isLoading = surveyLoading || questionsLoading || optionsLoading;
  const error = surveyError || questionsError;

  // Merge current question with its options
  const currentQuestionWithOptions: SurveyQuestion | undefined = currentQuestion
    ? {
        ...currentQuestion,
        options: currentOptions || [],
      }
    : undefined;

  // Prefetch next question's options for smooth navigation
  useEffect(() => {
    if (questions && currentStep < questions.length - 1) {
      const nextQuestion = questions[currentStep + 1];
      if (nextQuestion?.id) {
        // Prefetch in background
        prefetchQuestionOptions(queryClient, nextQuestion.id);
      }
    }
  }, [currentStep, questions, queryClient]);

  // Handle response change
  const handleResponseChange = (response: SurveyResponse) => {
    setResponses((prev) => ({
      ...prev,
      [response.questionId]: response,
    }));
    setValidationError(null);
  };

  // Validate current question
  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;

    const response = responses[currentQuestion.id];

    if (currentQuestion.isRequired) {
      if (!response || response.value === null || response.value === '') {
        setValidationError('This question is required');
        return false;
      }

      // Check for empty arrays in multiple choice
      if (Array.isArray(response.value) && response.value.length === 0) {
        setValidationError('Please select at least one option');
        return false;
      }
    }

    return true;
  };

  // Navigate to next question
  const handleNext = () => {
    if (!validateCurrentQuestion()) return;

    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      setValidationError(null);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setValidationError(null);
  };

  // Submit survey
  const handleSubmit = () => {
    // Validate all required questions
    const unansweredRequired = questions?.filter(
      (q) => q.isRequired && !responses[q.id]
    );

    if (unansweredRequired && unansweredRequired.length > 0) {
      setValidationError(
        `Please answer all required questions (${unansweredRequired.length} remaining)`
      );
      return;
    }

    // Convert responses to array
    const responseArray = Object.values(responses);
    
    // Submit and clear draft on success
    submitMutation.mutate(responseArray, {
      onSuccess: () => {
        clearSurveyDraft(surveyId);
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="glass-panel rounded-3xl border border-red-200 bg-red-50/40 p-8 text-center shadow-xl backdrop-blur-xl">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            Failed to load survey
          </h3>
          <p className="text-sm text-neutral-600">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
        </div>
      </div>
    );
  }

  // No questions state
  if (!questions || questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="glass-panel rounded-3xl border border-neutral-200 bg-white/40 p-8 text-center shadow-xl backdrop-blur-xl">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">No questions found</h3>
          <p className="text-sm text-neutral-600">This survey doesn't have any questions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Survey Header - Modern Banner Style */}
      <div className="glass-panel rounded-3xl border border-white/60 bg-gradient-to-br from-white/60 to-white/40 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-neutral-900">
              {survey?.title || 'Survey'}
            </h1>
            <p className="text-neutral-600">
              {survey?.description || 'Complete the questions below to help us personalize your experience'}
            </p>
          </div>
          
          {/* Progress Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900">{currentStep + 1}</div>
              <div className="text-xs text-neutral-500">Current</div>
            </div>
            <div className="h-12 w-px bg-neutral-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900">{totalSteps}</div>
              <div className="text-xs text-neutral-500">Total</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-700">Overall Progress</span>
            <span className="font-bold text-neutral-900">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-neutral-100 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#fec5fb] to-[#00bae2] shadow-lg transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card - Enhanced Design */}
      <div className="glass-panel group rounded-3xl border border-white/60 bg-white/40 p-8 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl hover:border-[#00bae2]/30 hover:-translate-y-1">
        {optionsLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-neutral-500">Loading question...</p>
          </div>
        ) : currentQuestionWithOptions ? (
          <div className="space-y-6">
            {/* Question Number Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fec5fb]/20 to-[#00bae2]/20 px-4 py-2 text-sm font-semibold text-neutral-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#fec5fb] to-[#00bae2] text-xs font-bold text-neutral-900">
                {currentStep + 1}
              </span>
              Question {currentStep + 1} of {totalSteps}
            </div>

            <QuestionRenderer
              question={currentQuestionWithOptions}
              value={responses[currentQuestionWithOptions.id]?.value || null}
              onChange={handleResponseChange}
            />
          </div>
        ) : null}

        {/* Validation Error */}
        {validationError && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-600 backdrop-blur-sm">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-4 w-4" />
            </div>
            <span className="font-medium">{validationError}</span>
          </div>
        )}
      </div>

      {/* Navigation Section - Enhanced */}
      <div className="glass-panel rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col gap-6">
          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`group relative flex-shrink-0 transition-all ${
                  index === currentStep
                    ? 'h-4 w-4 rounded-full bg-orange-500 shadow-md shadow-orange-500/50 ring-2 ring-orange-200'
                    : responses[questions[index].id]
                    ? 'h-3 w-3 rounded-full bg-[#00bae2] hover:scale-125'
                    : 'h-3 w-3 rounded-full bg-neutral-300 hover:scale-125 hover:bg-neutral-400'
                }`}
                aria-label={`Go to question ${index + 1}`}
              >
                {/* Tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded-lg bg-neutral-900 px-2 py-1 text-xs text-white shadow-lg">
                  Question {index + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handlePrevious}
              disabled={isFirstStep}
              variant="brandOutline"
              size="lg"
              className="gap-2 min-w-[120px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Progress Text */}
            <div className="text-center">
              <div className="text-sm font-medium text-neutral-700">
                {Object.keys(responses).length} of {totalSteps} answered
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                {totalSteps - Object.keys(responses).length} remaining
              </div>
            </div>

            <Button
              onClick={handleNext}
              disabled={submitMutation.isPending}
              variant="brand"
              size="lg"
              className="gap-2 min-w-[120px] shadow-lg shadow-[#00bae2]/20 hover:shadow-xl hover:shadow-[#00bae2]/30"
            >
              {isLastStep ? (
                <>
                  {submitMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

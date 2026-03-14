'use client';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useSurveyPage } from '../hooks/use-survey-page';
import { QuestionRenderer } from './questions';
import { SurveyTriggerReason } from '../types';

interface SurveyPageProps {
  surveyCode: string;
  triggerReason: SurveyTriggerReason;
  /** Path to redirect after submit. Defaults to '/dashboard'. */
  returnTo?: string;
  /** Roadmap ID for roadmap target survey */
  roadmapId?: number;
}

export function SurveyPage({ surveyCode, triggerReason, returnTo, roadmapId }: SurveyPageProps) {
  const {
    surveyTitle,
    currentQuestionWithOptions,
    responses,
    questions,
    isLoading,
    isOptionsLoading,
    error,
    isPending,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    validationError,
    goToNext,
    goToPrevious,
    goToStep,
    handleResponseChange,
  } = useSurveyPage({ surveyCode, triggerReason, returnTo, roadmapId });

  // ── Loading ────────────────────────────────────────────────────────────────
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
    <div className="space-y-5 pb-8">
      {/* Survey Header - Modern Banner Style */}
      <div className="glass-panel rounded-2xl border border-white/60 bg-gradient-to-br from-white/60 to-white/40 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-neutral-900">
              {surveyTitle ?? 'Survey'}
            </h1>
            <p className="text-sm text-neutral-600">
              { 'Complete the questions below to help us personalize your experience'}
            </p>
          </div>
          
          {/* Progress Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-neutral-900">{currentStep + 1}</div>
              <div className="text-xs text-neutral-500">Current</div>
            </div>
            <div className="h-10 w-px bg-neutral-200"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-neutral-900">{totalSteps}</div>
              <div className="text-xs text-neutral-500">Total</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-700">Overall Progress</span>
            <span className="font-bold text-neutral-900">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#fec5fb] to-[#00bae2] shadow-lg transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card - Enhanced Design */}
      <div className="glass-panel group rounded-2xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl hover:border-[#00bae2]/30 hover:-translate-y-1">
        {isOptionsLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-3 text-sm text-neutral-500">Loading question...</p>
          </div>
        ) : currentQuestionWithOptions ? (
          <div className="space-y-4">
            {/* Question Number Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fec5fb]/20 to-[#00bae2]/20 px-3 py-1.5 text-sm font-semibold text-neutral-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#fec5fb] to-[#00bae2] text-xs font-bold text-neutral-900">
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
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-sm text-red-600 backdrop-blur-sm">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium">{validationError}</span>
          </div>
        )}
      </div>

      {/* Navigation Section - Enhanced */}
      <div className="glass-panel rounded-2xl border border-white/60 bg-white/40 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col gap-4">
          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
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
              onClick={goToPrevious}
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
              onClick={goToNext}
              disabled={isPending}
              variant="brand"
              size="lg"
              className="gap-2 min-w-[120px] shadow-lg shadow-[#00bae2]/20 hover:shadow-xl hover:shadow-[#00bae2]/30"
            >
              {isLastStep ? (
                <>
                  {isPending ? (
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

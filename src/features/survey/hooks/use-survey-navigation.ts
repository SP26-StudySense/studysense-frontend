/**
 * Manages step-by-step navigation through a survey.
 *
 * Responsibilities:
 * - Tracks the current step index
 * - Per-question required-field validation
 * - Full "all required answered" guard before final submission
 * - Exposes prev / next / jump-to-step actions
 *
 * The `onSubmit` callback is called only after all validations pass on the
 * last step — keeping submission logic out of this hook.
 */

import { useState } from 'react';
import type { SurveyQuestion, SurveyResponse } from '../types';

interface UseSurveyNavigationOptions {
  questions: SurveyQuestion[] | undefined;
  responses: Record<string, SurveyResponse>;
  onSubmit: () => void;
}

interface UseSurveyNavigationReturn {
  currentStep: number;
  currentQuestion: SurveyQuestion | undefined;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  validationError: string | null;
  setValidationError: (error: string | null) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (step: number) => void;
}

export function useSurveyNavigation({
  questions,
  responses,
  onSubmit,
}: UseSurveyNavigationOptions): UseSurveyNavigationReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const totalSteps = questions?.length ?? 0;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const currentQuestion = questions?.[currentStep];

  /** Validate only the currently displayed question */
  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;

    const response = responses[currentQuestion.id];

    if (currentQuestion.isRequired) {
      if (!response || response.value === null || response.value === '') {
        setValidationError('This question is required');
        return false;
      }

      if (Array.isArray(response.value) && response.value.length === 0) {
        setValidationError('Please select at least one option');
        return false;
      }
    }

    return true;
  };

  const goToNext = () => {
    if (!validateCurrentQuestion()) return;

    if (isLastStep) {
      // Final guard: make sure every required question is answered
      const unansweredRequired =
        questions?.filter((q) => q.isRequired && !responses[q.id]) ?? [];

      if (unansweredRequired.length > 0) {
        setValidationError(
          `Please answer all required questions (${unansweredRequired.length} remaining)`
        );
        return;
      }

      onSubmit();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      setValidationError(null);
    }
  };

  const goToPrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setValidationError(null);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return {
    currentStep,
    currentQuestion,
    totalSteps,
    isFirstStep,
    isLastStep,
    validationError,
    setValidationError,
    goToNext,
    goToPrevious,
    goToStep,
  };
}

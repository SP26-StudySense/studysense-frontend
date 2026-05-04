/**
 * Prevents accidental navigation away from the survey.
 *
 * Responsibilities:
 * - Blocks the browser back button via popstate
 * - Shows a native "leave page?" warning on tab close / refresh
 *
 * Only activates for INITIAL surveys where abandonment is not allowed.
 */

import { useEffect } from 'react';
import { SurveyTriggerReason } from '../types';

export function useSurveyGuard(triggerReason: SurveyTriggerReason): void {
  // Block browser back button
  useEffect(() => {
    if (triggerReason !== SurveyTriggerReason.INITIAL) return;

    const preventBack = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventBack);

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, [triggerReason]);

  // Warn before tab close / page refresh
  useEffect(() => {
    if (triggerReason !== SurveyTriggerReason.INITIAL) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue = 'Your progress will be lost. Are you sure you want to leave?');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [triggerReason]);
}

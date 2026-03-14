/**
 * Auto-save survey responses to localStorage
 * Saves draft every 30 seconds and on component unmount
 */

import { useEffect, useRef } from 'react';
import type { SurveyResponse } from '../types';

const AUTOSAVE_INTERVAL = 30000; // 30 seconds

interface SavedSurveyDraft {
  surveyId: number;
  responses: Record<string, SurveyResponse>;
  startedAt: string;
  lastSavedAt: string;
}

/**
 * Get storage key for survey draft
 */
function getSurveyKey(surveyId: number): string {
  return `survey_draft_${surveyId}`;
}

/**
 * Load survey draft from localStorage
 */
export function loadSurveyDraft(surveyId: number): SavedSurveyDraft | null {
  try {
    const key = getSurveyKey(surveyId);
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const draft = JSON.parse(saved) as SavedSurveyDraft;
    
    // Validate it's for the correct survey
    if (draft.surveyId !== surveyId) return null;

    return draft;
  } catch (error) {
    console.error('[Survey AutoSave] Failed to load draft:', error);
    return null;
  }
}

/**
 * Save survey draft to localStorage
 */
function saveSurveyDraft(
  surveyId: number,
  responses: Record<string, SurveyResponse>,
  startedAt: Date
): void {
  try {
    const key = getSurveyKey(surveyId);
    const draft: SavedSurveyDraft = {
      surveyId,
      responses,
      startedAt: startedAt.toISOString(),
      lastSavedAt: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(draft));
    console.log('[Survey AutoSave] Draft saved:', Object.keys(responses).length, 'answers');
  } catch (error) {
    console.error('[Survey AutoSave] Failed to save draft:', error);
  }
}

/**
 * Clear survey draft from localStorage
 */
export function clearSurveyDraft(surveyId: number): void {
  try {
    const key = getSurveyKey(surveyId);
    localStorage.removeItem(key);
    console.log('[Survey AutoSave] Draft cleared');
  } catch (error) {
    console.error('[Survey AutoSave] Failed to clear draft:', error);
  }
}

/**
 * Clear all survey drafts from localStorage
 */
export function clearAllSurveyDrafts(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('survey_draft_'));
    keys.forEach((k) => localStorage.removeItem(k));
    console.log('[Survey AutoSave] All drafts cleared:', keys.length);
  } catch (error) {
    console.error('[Survey AutoSave] Failed to clear all drafts:', error);
  }
}

/**
 * Hook to auto-save survey responses to localStorage
 */
export function useSurveyAutoSave(
  surveyId: number,
  responses: Record<string, SurveyResponse>,
  startedAt: Date,
  enabled: boolean = true
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;

    // Save function
    const save = () => {
      const currentState = JSON.stringify(responses);
      
      // Only save if state changed
      if (currentState !== lastSaveRef.current && Object.keys(responses).length > 0) {
        saveSurveyDraft(surveyId, responses, startedAt);
        lastSaveRef.current = currentState;
      }
    };

    // Set up auto-save interval
    intervalRef.current = setInterval(save, AUTOSAVE_INTERVAL);

    // Save on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      save(); // Final save before unmount
    };
  }, [surveyId, responses, startedAt, enabled]);

  // Return manual save function
  return {
    saveDraft: () => saveSurveyDraft(surveyId, responses, startedAt),
    clearDraft: () => clearSurveyDraft(surveyId),
  };
}

/**
 * Survey API mutations using React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { queryKeys } from '@/shared/api/query-keys';
import { toast } from '@/shared/lib';
import { QuestionType, SurveyTriggerReason } from '../types';
import type { SurveyResponse } from '../types';
import { clearSurveyDraft } from '../hooks/useSurveyAutoSave';
import { submitSurvey, transformResponseToAnswers } from './api';

/**
 * Submit survey - calls POST /api/surveys/{surveyId}/take
 *
 * @param returnTo - path to redirect after a successful submit.
 *                   Defaults to '/' (landing page) when omitted.
 * @param roadmapId - roadmap id to include in payload for roadmap target survey (id = 3)
 */
export function useSubmitSurvey(
  surveyId: number,
  questionTypes: Record<string, QuestionType>,
  startedAt: Date,
  triggerReason: SurveyTriggerReason,
  returnTo: string = '/',
  roadmapId?: number
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (responses: SurveyResponse[]) => {
      const answers = responses.flatMap((r) => {
        const questionType = questionTypes[r.questionId] ?? QuestionType.TEXT;
        return transformResponseToAnswers(r, questionType);
      });

      const payload: any = {
        startedAt: startedAt.toISOString(),
        submittedAt: new Date().toISOString(),
        triggerReason,
        answers,
      };

      // Include roadmapId for roadmap target survey (id = 3)
      if (surveyId === 3 && roadmapId !== undefined) {
        payload.roadmapId = roadmapId;
      }

      return submitSurvey(surveyId, payload);
    },
    onSuccess: (data) => {
      clearSurveyDraft(surveyId);

      queryClient.invalidateQueries({ queryKey: queryKeys.surveyTaking.detail(surveyId.toString()) });
      queryClient.invalidateQueries({ queryKey: queryKeys.surveyTaking.status() });
      // Invalidate pending-trigger cache so the same trigger won't fire again this session
      queryClient.invalidateQueries({ queryKey: ['survey-taking', 'pending-trigger'] });

      if (data?.validationErrors && data.validationErrors.length > 0) {
        toast.success('Survey submitted with warnings', {
          description: `${data.answeredCount}/${data.totalQuestions} answers saved. Some answers had issues.`,
        });
      } else {
        toast.success('Survey submitted successfully!', {
          description: 'Thank you for completing the survey.',
        });
      }

      router.push(returnTo);
    },
    onError: (error) => {
      toast.apiError(error, 'Failed to submit survey');
    },
  });
}

/**
 * Survey API mutations using React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import { routes } from '@/shared/config/routes';
import { toast } from '@/shared/lib';
import { QuestionType, SurveyTriggerReason } from '../types'; // Import enums as values
import type { 
  SurveyResponse, 
  TakeSurveyRequest, 
  TakeSurveyResponse,
  SurveyAnswerInput,
} from '../types';

/**
 * Transform UI response to backend answer format
 * Note: MultipleChoice returns multiple answer records (one per selected option)
 */
function transformResponseToAnswers(
  response: SurveyResponse,
  questionType: QuestionType
): SurveyAnswerInput[] {
  const questionId = parseInt(response.questionId);
  const answeredAt = response.answeredAt;

  console.log('[Transform] Question:', questionId, 'Type:', questionType, 'Value:', response.value);

  // For MultipleChoice - create multiple answer records
  if (questionType === QuestionType.MULTIPLE_CHOICE) {
    const optionIds = Array.isArray(response.value) 
      ? response.value 
      : [response.value];
    
    const answers = optionIds
      .map((optionValue) => {
        const optionId = typeof optionValue === 'string' 
          ? parseInt(optionValue, 10) 
          : typeof optionValue === 'number'
          ? optionValue
          : null;
        
        console.log('[Transform] MultipleChoice option:', optionValue, '→', optionId, isNaN(optionId as any) ? '⚠️ NaN!' : '✓');
        
        return {
          questionId,
          optionId: isNaN(optionId as any) ? null : optionId,
          numberValue: null,
          textValue: null,
          answeredAt,
        };
      })
      .filter(answer => answer.optionId !== null); // Skip NaN/null values
    
    return answers.length > 0 ? answers : [{
      questionId,
      optionId: null,
      numberValue: null,
      textValue: null,
      answeredAt,
    }];
  }

  // For SingleChoice - single answer record
  if (questionType === QuestionType.SINGLE_CHOICE) {
    const optionId = typeof response.value === 'string' 
      ? parseInt(response.value, 10) 
      : typeof response.value === 'number'
      ? response.value
      : null;

    console.log('[Transform] SingleChoice option:', response.value, '→', optionId);

    return [{
      questionId,
      optionId,
      numberValue: null,
      textValue: null,
      answeredAt,
    }];
  }

  // For scale/rating questions
  if (
    questionType === QuestionType.SCALE ||
    questionType === QuestionType.RATING
  ) {
    const numberValue = typeof response.value === 'number' 
      ? response.value 
      : typeof response.value === 'string'
      ? parseFloat(response.value)
      : null;

    console.log('[Transform] Scale/Rating value:', response.value, '→', numberValue);

    return [{
      questionId,
      optionId: null,
      numberValue,
      textValue: null,
      answeredAt,
    }];
  }

  // For text questions
  const textValue = typeof response.value === 'string' ? response.value : null;
  
  console.log('[Transform] Text value:', response.value, '→', textValue);

  return [{
    questionId,
    optionId: null,
    numberValue: null,
    textValue,
    answeredAt,
  }];
}

/**
 * Submit survey - calls POST /api/surveys/{surveyId}/take
 */
export function useSubmitSurvey(
  surveyId: number,
  questionTypes: Record<string, QuestionType>,
  startedAt: Date
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (responses: SurveyResponse[]) => {
      try {
        console.log('[Survey Submit] Starting submission with', responses.length, 'responses');
        
        // Transform UI responses to backend format
        // Note: MultipleChoice creates multiple answer records
        const answers: SurveyAnswerInput[] = responses.flatMap((response) => {
          const questionType = questionTypes[response.questionId] || QuestionType.TEXT;
          return transformResponseToAnswers(response, questionType);
        });

        console.log('[Survey Submit] Transformed to', answers.length, 'answers');

        const payload: TakeSurveyRequest = {
          startedAt: startedAt.toISOString(),
          submittedAt: new Date().toISOString(),
          triggerReason: SurveyTriggerReason.MANUAL,
          answers,
        };

        console.log('[Survey Submit] Payload:', payload);

        const response = await post<any>(
          `/surveys/${surveyId}/take`,
          payload
        );

        console.log('[Survey Submit] Raw response:', JSON.stringify(response, null, 2));

        // Handle both wrapped and unwrapped responses
        let data: TakeSurveyResponse['data'];
        
        if ('success' in response && 'data' in response) {
          // Wrapped response
          if (!response.success) {
            console.error('[Survey Submit] Backend returned success=false:', response.message);
            throw new Error(response.message || 'Failed to submit survey');
          }
          data = response.data;
        } else if ('responseId' in response && 'status' in response) {
          // Unwrapped response - direct data object
          console.log('[Survey Submit] Detected unwrapped response');
          data = response;
        } else {
          console.error('[Survey Submit] Invalid response structure:', response);
          throw new Error('Invalid response from server');
        }

        // Check for validation errors
        if (data?.validationErrors && data.validationErrors.length > 0) {
          console.warn('[Survey Submit] Validation errors:', data.validationErrors);
        }

        console.log('[Survey Submit] Returning data:', data);
        return data;
      } catch (error) {
        console.error('[Survey Submit] Exception in mutationFn:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      try {
        console.log('[Survey Submit] Success! Data:', data);
        
        // Invalidate related queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.surveys.detail(surveyId.toString()) 
        });

        // Invalidate survey status to update user's completion status
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.survey.status() 
        });

        // Show success with warning if there are validation errors
        if (data?.validationErrors && data.validationErrors.length > 0) {
          toast.success('Survey submitted with warnings', {
            description: `${data.answeredCount}/${data.totalQuestions} answers saved. Some answers had issues.`,
          });
        } else {
          toast.success('Survey submitted successfully!', {
            description: 'Thank you for completing the survey.',
          });
        }

        // Redirect to dashboard or survey results
        console.log('[Survey Submit] Redirecting to:', routes.dashboard.home);
        router.push(routes.dashboard.home);
      } catch (err) {
        console.error('[Survey Submit] Error in onSuccess:', err);
        throw err;
      }
    },
    onError: (error) => {
      console.error('[Survey Submit] Error:', error);
      toast.apiError(error, 'Failed to submit survey');
    },
  });
}

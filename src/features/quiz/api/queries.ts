import { useQuery } from '@tanstack/react-query';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

import type {
  GetCurrentQuizAttemptByModuleResponse,
  GetQuizQuestionsByAttemptResponse,
} from './types';

export function useCurrentQuizAttemptByModule(
  moduleId: number | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['quizAttempts', 'currentByModule', moduleId] as const,
    queryFn: async () => {
      if (!moduleId) {
        throw new Error('Module ID is required');
      }

      return get<GetCurrentQuizAttemptByModuleResponse>(
        endpoints.quizAttempts.currentByModule(String(moduleId))
      );
    },
    enabled: options?.enabled !== false && !!moduleId,
    staleTime: 15 * 1000,
  });
}

export function useQuizQuestionsByAttempt(
  attemptId: number | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['quizAttempts', 'questions', attemptId] as const,
    queryFn: async () => {
      if (!attemptId) {
        throw new Error('Attempt ID is required');
      }

      return get<GetQuizQuestionsByAttemptResponse>(
        endpoints.quizAttempts.questions(String(attemptId))
      );
    },
    enabled: options?.enabled !== false && !!attemptId,
    staleTime: 0,
  });
}

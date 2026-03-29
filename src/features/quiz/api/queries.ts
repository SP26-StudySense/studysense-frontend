import { useQuery } from '@tanstack/react-query';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { ApiException } from '@/shared/api/errors';

import type {
  GetCurrentQuizAttemptByModuleResponse,
  GetQuizQuestionsByAttemptResponse,
} from './types';

function isQuizKeyNotFoundError(error: unknown): boolean {
  if (error instanceof ApiException) {
    return error.status === 404 || error.message.includes('KeyNotFoundException');
  }

  if (error instanceof Error) {
    return error.message.includes('KeyNotFoundException');
  }

  return false;
}

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

      try {
        return await get<GetCurrentQuizAttemptByModuleResponse>(
          endpoints.quizAttempts.currentByModule(String(moduleId))
        );
      } catch (error) {
        if (isQuizKeyNotFoundError(error)) {
          return { quizAttempt: null };
        }

        throw error;
      }
    },
    enabled: options?.enabled !== false && !!moduleId,
    staleTime: 15 * 1000,
    retry: false,
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

      try {
        return await get<GetQuizQuestionsByAttemptResponse>(
          endpoints.quizAttempts.questions(String(attemptId))
        );
      } catch (error) {
        if (isQuizKeyNotFoundError(error)) {
          throw new Error('Khong co quiz cho module nay.');
        }

        throw error;
      }
    },
    enabled: options?.enabled !== false && !!attemptId,
    staleTime: 0,
    retry: false,
  });
}

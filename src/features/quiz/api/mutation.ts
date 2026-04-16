import { useMutation, useQueryClient } from '@tanstack/react-query';

import { post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

import type {
	CreateQuizAttemptRequest,
	CreateQuizAttemptResponse,
	SaveQuizAnswersByAttemptRequest,
	SaveQuizAnswersByAttemptResponse,
	SubmitQuizAttemptRequest,
	SubmitQuizAttemptResponse,
} from './types';

/**
 * Create quiz attempt.
 * POST /quiz-attempts
 */
export function useCreateQuizAttempt() {
	return useMutation({
		mutationFn: (payload: CreateQuizAttemptRequest) =>
			post<CreateQuizAttemptResponse, CreateQuizAttemptRequest>(
				endpoints.quizAttempts.create,
				payload
			),
	});
}

/**
 * Submit quiz attempt answers.
 * POST /quiz-attempts/{id}/submit
 */
export function useSubmitQuizAttempt() {
	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: SubmitQuizAttemptRequest }) =>
			post<SubmitQuizAttemptResponse, SubmitQuizAttemptRequest>(
				endpoints.quizAttempts.submit(String(id)),
				payload,
				{ timeout: 120000 }
			),
	});
}

/**
 * Save quiz answers by attempt id.
 * POST /quiz-answers/attempt/{attemptId}
 */
export function useSaveQuizAnswersByAttempt() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ attemptId, payload }: { attemptId: number; payload: SaveQuizAnswersByAttemptRequest }) =>
			post<SaveQuizAnswersByAttemptResponse, SaveQuizAnswersByAttemptRequest>(
				endpoints.quizAnswers.saveByAttempt(String(attemptId)),
				payload
			),
		onSuccess: (data, variables) => {
			// Invalidate the questions query to refetch latest data with updated selectedOptionId
			queryClient.invalidateQueries({
				queryKey: ['quizAttempts', 'questions', variables.attemptId],
			});
		},
	});
}

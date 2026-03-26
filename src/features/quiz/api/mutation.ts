import { useMutation } from '@tanstack/react-query';

import { post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

import type {
	CreateQuizAttemptRequest,
	CreateQuizAttemptResponse,
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
				payload
			),
	});
}

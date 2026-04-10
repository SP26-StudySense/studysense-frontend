export type QuizLevel = 'Begineer' | 'Beginner' | 'Intermediate' | 'Advanced';

export enum QuizAttemptStatus {
	InProgress = 0,
	Passed = 1,
	Failed = 2,
}

export type QuizAttemptStatusValue =
	| QuizAttemptStatus
	| 'InProgress'
	| 'Passed'
	| 'Failed'
	| 'in_progress'
	| 'passed'
	| 'failed';

export interface CreateQuizAttemptPayload {
	studyPlanModuleId: number;
	level?: QuizLevel;
}

export interface CreateQuizAttemptRequest {
	createQuizAttempt: CreateQuizAttemptPayload;
}

export interface SubmitQuizAttemptAnswer {
	questionId: number;
	optionId?: number | null;
	optionIds?: number[] | null;
	textValue?: string | null;
	numberValue?: number | null;
}

export interface SubmitQuizAttemptPayload {
	id: number;
	answers: SubmitQuizAttemptAnswer[];
}

export interface SubmitQuizAttemptRequest {
	submitQuizAttempt: SubmitQuizAttemptPayload;
}

export interface QuizAttemptDto {
	id: number;
	quizId: number;
	userId: string;
	startedAt: string;
	submittedAt: string | null;
	score: number | null;
	status: QuizAttemptStatusValue;
}

export interface QuizQuestionOptionDto {
	optionId: number;
	valueKey: string;
	displayText: string;
	orderNo: number;
}

export interface QuizAttemptQuestionDto {
	questionId: number;
	prompt: string;
	type: QuizQuestionType;
	orderNo: number;
	selectedOptionId: number | null;
	selectedOptionIds: number[];
	selectedTextValue: string | null;
	correctOptionId: number | null;
	correctOptionIds: number[];
	correctTextValue: string | null;
	options: QuizQuestionOptionDto[];
}

export type QuizQuestionType = 'SingleChoice' | 'MultipleChoice' | 'ShortAnswer';

export interface QuizDetailDto {
	quizId: number;
	title: string;
	description: string;
	level: QuizLevel;
	totalScore: number;
	passingScore: number;
}

export interface GetQuizQuestionsByAttemptResponse {
	quiz: QuizDetailDto;
	questions: QuizAttemptQuestionDto[];
}

export interface CreateQuizAttemptResponse {
	id: number;
	quizId: number;
	userId: string;
	startedAt: string;
	submittedAt: string | null;
	score: number | null;
	status: QuizAttemptStatus;
}

export interface GetCurrentQuizAttemptByModuleResponse {
	quizAttempt: QuizAttemptDto | null;
}

/**
 * Individual answer item for save request payload.
 * Matches SaveQuizAnswerByQuestionDto from backend.
 * Sent per-question to save draft answers.
 */
export interface SaveQuizAnswerRequestItem {
	questionId: number;
	optionId?: number | null;
	optionIds?: number[] | null;
	textValue?: string | null;
	answeredAt?: string;
}

/**
 * Response item when fetching saved answers.
 * Includes id for tracking and full answer state.
 */
export interface SaveQuizAnswerItem {
	id?: number;
	questionId: number;
	optionId?: number | null;
	optionIds?: number[] | null;
	textValue?: string | null;
	answeredAt?: string;
}

export interface SaveQuizAnswersByAttemptRequest {
	attemptId: number;
	quizAnswers: SaveQuizAnswerRequestItem[];
}

export interface SaveQuizAnswersByAttemptResponse {
	success: boolean;
	updatedCount: number;
}

export interface SubmittedQuizQuestionResultDto {
	questionId: number;
	prompt: string;
	type: QuizQuestionType;
	selectedOptionId: number | null;
	selectedOptionIds: number[];
	selectedTextValue: string | null;
	selectedOptionText: string | null;
	correctOptionId: number | null;
	correctOptionIds: number[];
	correctTextValue: string | null;
	correctOptionText: string | null;
	isCorrect: boolean;
}

export interface SubmitQuizAttemptResponse {
	quizAttempt: QuizAttemptDto;
	questions: SubmittedQuizQuestionResultDto[];
}

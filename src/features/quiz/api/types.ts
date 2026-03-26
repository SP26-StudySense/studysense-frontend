export type QuizLevel = 'Begineer' | 'Beginner' | 'Intermediate' | 'Advanced';

export enum QuizAttemptStatus {
	InProgress = 0,
	Passed = 1,
	Failed = 2,
}

export interface CreateQuizAttemptPayload {
	studyPlanModuleId: number;
	level: QuizLevel;
}

export interface CreateQuizAttemptRequest {
	createQuizAttempt: CreateQuizAttemptPayload;
}

export interface SubmitQuizAttemptAnswer {
	questionId: number;
	optionId?: number | null;
	textValue?: string;
	numberValue?: number;
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
	status: QuizAttemptStatus;
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
	orderNo: number;
	selectedOptionId: number | null;
	options: QuizQuestionOptionDto[];
}

export interface GetQuizQuestionsByAttemptResponse {
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

export interface SaveQuizAnswerItem {
	id?: number;
	attemptId: number;
	questionId: number;
	optionId?: number | null;
	textValue?: string | null;
	numberValue?: number | null;
	answeredAt?: string;
}

export interface SaveQuizAnswersByAttemptRequest {
	attemptId: number;
	quizAnswers: SaveQuizAnswerItem[];
}

export interface SaveQuizAnswersByAttemptResponse {
	success: boolean;
	updatedCount: number;
}

export interface SubmittedQuizQuestionResultDto {
	questionId: number;
	prompt: string;
	selectedOptionId: number | null;
	selectedOptionText: string | null;
	correctOptionId: number | null;
	correctOptionText: string | null;
	isCorrect: boolean;
}

export interface SubmitQuizAttemptResponse {
	quizAttempt: QuizAttemptDto;
	questions: SubmittedQuizQuestionResultDto[];
}

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
	type: number;
	orderNo: number;
	options: QuizQuestionOptionDto[];
}

export interface CreateQuizAttemptResponse {
	quizAttempt: QuizAttemptDto;
	questions: QuizAttemptQuestionDto[];
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

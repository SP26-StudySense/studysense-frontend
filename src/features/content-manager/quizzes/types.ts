export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "draft" | "published" | "archived";
  totalQuestions: number;
  timeLimitMinutes: number;
  passScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizFormData {
  title: string;
  description: string;
  category: string;
  status: Quiz["status"];
  timeLimitMinutes: number;
  passScore: number;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: "single" | "multiple";
  difficulty: "easy" | "medium" | "hard";
  score: number;
  orderNo: number;
  options: QuizQuestionOption[];
}

export interface QuizQuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderNo: number;
}

export interface QuestionFormData {
  questionText: string;
  questionType: QuizQuestion["questionType"];
  difficulty: QuizQuestion["difficulty"];
  score: number;
  orderNo: number;
}

export interface OptionFormData {
  optionText: string;
  isCorrect: boolean;
  orderNo: number;
}

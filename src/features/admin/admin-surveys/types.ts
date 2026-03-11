export interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
  totalQuestions: number;
}

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  questionText: string;
  questionType: 'single' | 'multiple' | 'text' | 'rating';
  isRequired: boolean;
  orderNo: number;
  options: SurveyQuestionOption[];
}

export interface SurveyQuestionOption {
  id: string;
  questionId: string;
  valueKey: string;
  displayText: string;
  weight: number;
  orderNo: number;
  allowFreeText: boolean;
}

export interface SurveyFormData {
  title: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
}

export interface QuestionFormData {
  questionText: string;
  questionType: 'single' | 'multiple' | 'text' | 'rating';
  isRequired: boolean;
  orderNo: number;
}

export interface OptionFormData {
  valueKey: string;
  displayText: string;
  weight: number;
  orderNo: number;
  allowFreeText: boolean;
}

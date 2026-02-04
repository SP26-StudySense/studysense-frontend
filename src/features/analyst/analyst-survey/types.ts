export interface Survey {
  id: number;
  title: string | null;
  code: string;
  status: 'Draft' | 'Published' | 'Archived';
}

// Backend DTOs
export type SurveyQuestionType = 'SingleChoice' | 'MultipleChoice' | 'Scale' | 'ShortAnswer' | 'FreeText';

export interface SurveyQuestion {
  id: number;
  surveyId: number;
  questionKey: string;
  prompt: string;
  type: SurveyQuestionType;
  orderNo: number;
  isRequired: boolean;
  scaleMin: number | null;
  scaleMax: number | null;
  options?: SurveyQuestionOption[];
}

export interface SurveyQuestionOption {
  id: number;
  questionId: number;
  valueKey: string;
  displayText: string;
  weight: number | null;
  orderNo: number;
  allowFreeText: boolean;
}

export interface SurveyFormData {
  title: string | null;
  code: string;
  status: 'Draft' | 'Published' | 'Archived';
}

export interface QuestionFormData {
  questionKey: string;
  questionText: string;
  questionType: 'single' | 'multiple' | 'scale' | 'shortanswer' | 'freetext';
  isRequired: boolean;
  orderNo: number;
  scaleMin: number | null;
  scaleMax: number | null;
}

export interface OptionFormData {
  valueKey: string;
  displayText: string;
  weight: number;
  orderNo: number;
  allowFreeText: boolean;
}

'use client';

import { SingleChoiceQuestion } from './SingleChoiceQuestion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { ScaleQuestion } from './ScaleQuestion';
import { TextQuestion } from './TextQuestion';
import type { SurveyQuestion, SurveyResponse } from '../../types';

interface QuestionRendererProps {
  question: SurveyQuestion;
  value: string | string[] | number | null;
  onChange: (response: SurveyResponse) => void;
}

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  switch (question.type) {
    case 'SingleChoice':
      return (
        <SingleChoiceQuestion
          questionId={question.id}
          questionText={question.text}
          options={question.options || []}
          isRequired={question.isRequired}
          value={value as string | null}
          onChange={onChange}
        />
      );

    case 'MultipleChoice':
      return (
        <MultipleChoiceQuestion
          questionId={question.id}
          questionText={question.text}
          options={question.options || []}
          isRequired={question.isRequired}
          value={(value as string[]) || []}
          onChange={onChange}
        />
      );

    case 'Scale':
      return (
        <ScaleQuestion
          questionId={question.id}
          questionText={question.text}
          isRequired={question.isRequired}
          minValue={question.validation?.minValue || 1}
          maxValue={question.validation?.maxValue || 5}
          value={value as number | null}
          onChange={onChange}
        />
      );

    case 'ShortAnswer':
    case 'FreeText':
      return (
        <TextQuestion
          questionId={question.id}
          questionText={question.text}
          isRequired={question.isRequired}
          type={question.type}
          value={(value as string) || ''}
          onChange={onChange}
        />
      );

    default:
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Unknown question type: {question.type}
        </div>
      );
  }
}

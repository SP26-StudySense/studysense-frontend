'use client';

import type { SurveyResponse } from '../../types';

interface TextQuestionProps {
  questionId: string;
  questionText: string;
  isRequired: boolean;
  type: 'ShortAnswer' | 'FreeText';
  value: string;
  onChange: (response: SurveyResponse) => void;
}

export function TextQuestion({
  questionId,
  questionText,
  isRequired,
  type,
  value = '',
  onChange,
}: TextQuestionProps) {
  const handleChange = (newValue: string) => {
    onChange({
      questionId,
      value: newValue,
      answeredAt: new Date().toISOString(),
    });
  };

  const isLongText = type === 'FreeText';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">
        {questionText}
        {isRequired && <span className="ml-1 text-red-500">*</span>}
      </h3>

      {isLongText ? (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          rows={5}
          placeholder="Type your answer here..."
          className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
        />
      )}
    </div>
  );
}

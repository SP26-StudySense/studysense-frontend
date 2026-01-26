'use client';

import { useState } from 'react';
import type { SurveyResponse } from '../../types';

interface ScaleQuestionProps {
  questionId: string;
  questionText: string;
  isRequired: boolean;
  minValue: number;
  maxValue: number;
  value: number | null;
  onChange: (response: SurveyResponse) => void;
}

export function ScaleQuestion({
  questionId,
  questionText,
  isRequired,
  minValue = 1,
  maxValue = 5,
  value,
  onChange,
}: ScaleQuestionProps) {
  const scaleValues = Array.from(
    { length: maxValue - minValue + 1 },
    (_, i) => minValue + i
  );

  const handleSelect = (scaleValue: number) => {
    onChange({
      questionId,
      value: scaleValue,
      answeredAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">
        {questionText}
        {isRequired && <span className="ml-1 text-red-500">*</span>}
      </h3>

      <div className="flex items-center justify-center gap-3 py-4">
        {scaleValues.map((scaleValue) => {
          const isSelected = value === scaleValue;

          return (
            <button
              key={scaleValue}
              onClick={() => handleSelect(scaleValue)}
              className={`
                flex h-12 w-12 items-center justify-center rounded-full border-2 font-semibold transition-all
                ${
                  isSelected
                    ? 'border-[#00bae2] bg-[#00bae2] text-white shadow-lg shadow-[#00bae2]/30 scale-110'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:border-[#00bae2]/50 hover:bg-neutral-50 hover:scale-105'
                }
              `}
            >
              {scaleValue}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-neutral-500">
        <span>{minValue} - Low</span>
        <span>{maxValue} - High</span>
      </div>
    </div>
  );
}

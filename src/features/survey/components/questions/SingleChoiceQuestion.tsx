'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import type { QuestionOption, SurveyResponse } from '../../types';

interface SingleChoiceQuestionProps {
  questionId: string;
  questionText: string;
  options: QuestionOption[];
  isRequired: boolean;
  value: string | null;
  onChange: (response: SurveyResponse) => void;
}

export function SingleChoiceQuestion({
  questionId,
  questionText,
  options,
  isRequired,
  value,
  onChange,
}: SingleChoiceQuestionProps) {
  const [freeTextValues, setFreeTextValues] = useState<Record<string, string>>({});

  const handleSelect = (optionValue: string) => {
    // If option has free text, include it in the value
    const option = options.find(opt => opt.value === optionValue);
    const freeText = option?.allowFreeText ? freeTextValues[optionValue] : undefined;
    
    onChange({
      questionId,
      value: freeText ? `${optionValue}|${freeText}` : optionValue,
      answeredAt: new Date().toISOString(),
    });
  };

  const handleFreeTextChange = (optionValue: string, text: string) => {
    setFreeTextValues(prev => ({ ...prev, [optionValue]: text }));
    
    // If this option is selected, update the response
    if (value === optionValue || value?.startsWith(`${optionValue}|`)) {
      onChange({
        questionId,
        value: `${optionValue}|${text}`,
        answeredAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">
        {questionText}
        {isRequired && <span className="ml-1 text-red-500">*</span>}
      </h3>

      <div className="space-y-3">
        {options
          .sort((a, b) => a.order - b.order)
          .map((option) => {
            const isSelected = value === option.value || value?.startsWith(`${option.value}|`);

            return (
              <div key={option.id} className="space-y-2">
                <button
                  onClick={() => handleSelect(option.value)}
                  className={`
                    group relative w-full rounded-xl border-2 p-4 text-left transition-all
                    ${
                      isSelected
                        ? 'border-[#00bae2] bg-[#00bae2]/5 shadow-sm'
                        : 'border-neutral-200 bg-white hover:border-[#00bae2]/50 hover:bg-neutral-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio indicator */}
                    <div
                      className={`
                        flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
                        ${
                          isSelected
                            ? 'border-[#00bae2] bg-[#00bae2]'
                            : 'border-neutral-300 bg-white group-hover:border-[#00bae2]/50'
                        }
                      `}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>

                    {/* Option text */}
                    <span
                      className={`
                        text-sm font-medium transition-colors
                        ${isSelected ? 'text-neutral-900' : 'text-neutral-700'}
                      `}
                    >
                      {option.label}
                    </span>
                  </div>
                </button>

                {/* Free text input */}
                {option.allowFreeText && isSelected && (
                  <div className="ml-8 mt-2">
                    <textarea
                      value={freeTextValues[option.value] || ''}
                      onChange={(e) => handleFreeTextChange(option.value, e.target.value)}
                      placeholder="Please specify..."
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[#00bae2] focus:outline-none focus:ring-2 focus:ring-[#00bae2]/20"
                      rows={3}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

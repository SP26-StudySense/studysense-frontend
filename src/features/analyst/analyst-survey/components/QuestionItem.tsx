"use client";

import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import type { SurveyQuestion, SurveyQuestionOption, SurveyFieldSemantic } from "../types";
import { useQuestionOptions, useFieldSemantics } from "../api/queries";

interface QuestionItemProps {
  question: SurveyQuestion;
  onEditQuestion: (q: SurveyQuestion) => void;
  onDeleteQuestion: (id: number, text: string) => void;
  onCreateOption: (questionId: number) => void;
  onEditOption: (questionId: number, option: SurveyQuestionOption) => void;
  onDeleteOption: (questionId: number, optionId: number, displayText: string) => void;
  onCreateFieldSemantic: (questionId: number) => void;
  onEditFieldSemantic: (questionId: number, fieldSemantic: SurveyFieldSemantic) => void;
  onDeleteFieldSemantic: (questionId: number, fieldSemanticId: number, dimensionCode: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function QuestionItem({
  question,
  onEditQuestion,
  onDeleteQuestion,
  onCreateOption,
  onEditOption,
  onDeleteOption,
  onCreateFieldSemantic,
  onEditFieldSemantic,
  onDeleteFieldSemantic,
  isExpanded,
  onToggle,
}: QuestionItemProps) {
  const hasOptions = question.type === 'SingleChoice' || question.type === 'MultipleChoice';
  
  // Fetch options when expanded
  const { data: optionsData, isLoading: optionsLoading } = useQuestionOptions(
    isExpanded && hasOptions ? question.id : 0
  );
  
  const options = optionsData?.items || [];
  
  // Fetch field semantics when expanded
  const { data: semanticsData, isLoading: semanticsLoading } = useFieldSemantics(
    isExpanded ? question.id : 0
  );
  
  const semantics = semanticsData?.items || [];

  // Map question type to display
  const getQuestionTypeBadge = (type: SurveyQuestion["type"]) => {
    const styles = {
      SingleChoice: "bg-blue-100 text-blue-700",
      MultipleChoice: "bg-purple-100 text-purple-700",
      Scale: "bg-yellow-100 text-yellow-700",
      ShortAnswer: "bg-green-100 text-green-700",
      FreeText: "bg-orange-100 text-orange-700",
    };
    const labels = {
      SingleChoice: "Single Choice",
      MultipleChoice: "Multiple Choice",
      Scale: "Scale",
      ShortAnswer: "Short Answer",
      FreeText: "Free Text",
    };
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-700'}`}>
        {labels[type] || type}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      {/* Question Header */}
      <div className="flex items-start gap-4 p-4">
        <button
          onClick={onToggle}
          className="mt-1 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-500">Q{question.orderNo}</span>
                {question.isRequired && (
                  <span className="text-xs text-red-500">Required</span>
                )}
                {getQuestionTypeBadge(question.type)}
              </div>
              <p className="mt-2 text-base font-medium text-neutral-900">
                {question.prompt}
              </p>
              <p className="mt-1 text-xs font-mono text-neutral-400">
                Key: {question.questionKey}
              </p>
              {question.type === 'Scale' && question.scaleMin !== null && question.scaleMax !== null && (
                <p className="mt-1 text-xs text-neutral-600">
                  Scale: {question.scaleMin} - {question.scaleMax}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              {hasOptions && (
                <button
                  onClick={() => onCreateOption(question.id)}
                  className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  title="Add Option"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => onEditQuestion(question)}
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                title="Edit Question"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDeleteQuestion(question.id, question.prompt)}
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Delete Question"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Options Section */}
      {isExpanded && hasOptions && (
        <div className="border-t border-neutral-200 bg-neutral-50 p-4">
          {optionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#00bae2]" />
            </div>
          ) : options.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No options yet. Click the + button to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between rounded-lg bg-white p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-neutral-500">
                        #{option.orderNo}
                      </span>
                      <span className="font-mono text-xs text-neutral-600">{option.valueKey}</span>
                      <span className="text-sm text-neutral-900">{option.displayText}</span>
                      {option.allowFreeText && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          Free Text
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">Weight: {option.weight}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditOption(question.id, option)}
                      className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      title="Edit Option"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteOption(question.id, option.id, option.displayText)}
                      className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Delete Option"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Field Semantics Section */}
      {isExpanded && (
        <div className="border-t border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-neutral-900">Field Semantics</h4>
            <button
              onClick={() => onCreateFieldSemantic(question.id)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Field Semantic
            </button>
          </div>

          {semanticsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#00bae2]" />
            </div>
          ) : semantics.length === 0 ? (
            <div className="text-center py-6 text-neutral-500 text-sm">
              No field semantics yet. Click "Add Field Semantic" to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {semantics.map((semantic) => (
                <div
                  key={semantic.id}
                  className="rounded-lg bg-white p-4 border border-neutral-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-[#00bae2]">
                          {semantic.dimensionCode}
                        </span>
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          Weight: {semantic.weight}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-500">Evaluates:</p>
                        <p className="text-sm text-neutral-900">{semantic.evaluates}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-500">AI Hint:</p>
                        <p className="text-sm text-neutral-700 italic">{semantic.aiHint}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => onEditFieldSemantic(question.id, semantic)}
                        className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        title="Edit Field Semantic"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteFieldSemantic(question.id, semantic.id, semantic.dimensionCode)}
                        className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete Field Semantic"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { ConfirmationModal } from "@/shared/ui";
import { QuestionFormModal, OptionFormModal, FieldSemanticFormModal, QuestionItem } from "./components";
import type {
  SurveyQuestion,
  SurveyQuestionOption,
  QuestionFormData,
  OptionFormData,
  SurveyFieldSemantic,
  FieldSemanticFormData,
} from "./types";
import { useSurveyDetail } from "./hooks/use-survey-detail";

type ModalState =
  | { type: "none" }
  | { type: "createQuestion" }
  | { type: "editQuestion"; question: SurveyQuestion }
  | { type: "deleteQuestion"; id: number; text: string }
  | { type: "createOption"; questionId: number }
  | { type: "editOption"; questionId: number; option: SurveyQuestionOption }
  | { type: "deleteOption"; questionId: number; optionId: number; displayText: string }
  | { type: "createFieldSemantic"; questionId: number }
  | { type: "editFieldSemantic"; questionId: number; fieldSemantic: SurveyFieldSemantic }
  | { type: "deleteFieldSemantic"; questionId: number; fieldSemanticId: number; dimensionCode: string };

interface SurveyDetailProps {
  surveyId: number;
}

export function SurveyDetail({ surveyId }: SurveyDetailProps) {
  const router = useRouter();
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });
  const [expandedQuestions, setExpandedQuestions] = useState(new Set<number>());

  // High-level facade hook - all survey management in one place
  const {
    survey,
    questions,
    isLoading,
    questionActions,
    optionActions,
    fieldSemanticActions,
    error,
  } = useSurveyDetail({ surveyId });

  // Toggle question expansion
  const toggleQuestion = (id: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Question handlers - using facade hook actions
  const handleCreateQuestion = async (data: QuestionFormData) => {
    const mappedType = (() => {
      switch (data.questionType) {
        case 'single': return 'SingleChoice';
        case 'multiple': return 'MultipleChoice';
        case 'scale': return 'Scale';
        case 'shortanswer': return 'ShortAnswer';
        case 'freetext': return 'FreeText';
        default: return 'SingleChoice';
      }
    })() as any;

    try {
      await questionActions.create({
        surveyId,
        questionKey: data.questionKey,
        prompt: data.questionText,
        type: mappedType,
        orderNo: data.orderNo,
        isRequired: data.isRequired,
        scaleMin: data.scaleMin,
        scaleMax: data.scaleMax,
      });
      setModalState({ type: "none" });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleUpdateQuestion = async (data: QuestionFormData) => {
    if (modalState.type !== "editQuestion") return;

    const mappedType = (() => {
      switch (data.questionType) {
        case 'single': return 'SingleChoice';
        case 'multiple': return 'MultipleChoice';
        case 'scale': return 'Scale';
        case 'shortanswer': return 'ShortAnswer';
        case 'freetext': return 'FreeText';
        default: return 'SingleChoice';
      }
    })() as any;

    try {
      await questionActions.update({
        id: modalState.question.id,
        surveyId,
        questionKey: data.questionKey,
        prompt: data.questionText,
        type: mappedType,
        orderNo: data.orderNo,
        isRequired: data.isRequired,
        scaleMin: data.scaleMin,
        scaleMax: data.scaleMax,
      });
      setModalState({ type: "none" });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleDeleteQuestion = async () => {
    if (modalState.type !== "deleteQuestion") return;
    try {
      await questionActions.delete(modalState.id);
      setModalState({ type: "none" });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Option handlers - using facade hook actions
  const handleCreateOption = async (data: OptionFormData) => {
    if (modalState.type !== "createOption") return;
    try {
      await optionActions.create({
        questionId: modalState.questionId,
        valueKey: data.valueKey,
        displayText: data.displayText,
        weight: data.weight,
        orderNo: data.orderNo,
        allowFreeText: data.allowFreeText,
      });
      setModalState({ type: "none" });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleUpdateOption = async (data: OptionFormData) => {
    if (modalState.type !== "editOption") return;
    try {
      await optionActions.update({
        id: modalState.option.id,
        questionId: modalState.questionId,
        valueKey: data.valueKey,
        displayText: data.displayText,
        weight: data.weight,
        orderNo: data.orderNo,
        allowFreeText: data.allowFreeText,
      });
      setModalState({ type: "none" });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleDeleteOption = async () => {
    if (modalState.type !== "deleteOption") return;
    try {
      await optionActions.delete(modalState.optionId, modalState.questionId);
      setModalState({ type: "none" });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Field Semantic handlers - using facade hook actions
  const handleCreateFieldSemantic = async (data: FieldSemanticFormData) => {
    if (modalState.type !== "createFieldSemantic") return;
    try {
      await fieldSemanticActions.create({
        surveyQuestionId: modalState.questionId,
        dimensionCode: data.dimensionCode,
        evaluates: data.evaluates,
        aiHint: data.aiHint,
        weight: data.weight,
      });
      setModalState({ type: "none" });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleUpdateFieldSemantic = async (data: FieldSemanticFormData) => {
    if (modalState.type !== "editFieldSemantic") return;
    try {
      await fieldSemanticActions.update({
        id: modalState.fieldSemantic.id,
        surveyQuestionId: modalState.questionId,
        dimensionCode: data.dimensionCode,
        evaluates: data.evaluates,
        aiHint: data.aiHint,
        weight: data.weight,
      });
      setModalState({ type: "none" });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleDeleteFieldSemantic = async () => {
    if (modalState.type !== "deleteFieldSemantic") return;
    try {
      await fieldSemanticActions.delete(modalState.fieldSemanticId, modalState.questionId);
      setModalState({ type: "none" });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Sort questions by orderNo
  const sortedQuestions = useMemo(() => 
    [...questions].sort((a, b) => a.orderNo - b.orderNo),
    [questions]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00bae2]" />
          <p className="text-sm text-neutral-600">Loading survey details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !survey) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600">Failed to load survey</p>
          <button
            onClick={() => router.push("/analyst-survey")}
            className="mt-3 text-sm text-[#00bae2] hover:underline"
          >
            ← Back to surveys
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/analyst-survey")}
            className="rounded-xl p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{survey.title || "Untitled Survey"}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-xs text-neutral-500">{survey.code}</span>
              <span className="text-xs text-neutral-400">•</span>
              <span className={`text-xs font-medium ${
                survey.status === 'Published' ? 'text-green-600' : 
                survey.status === 'Archived' ? 'text-red-600' : 
                'text-neutral-600'
              }`}>
                {survey.status}
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-600">{questions.length} questions</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setModalState({ type: "createQuestion" })}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Create Question
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {sortedQuestions.map((question) => (
          <QuestionItem
            key={question.id}
            question={question}
            isExpanded={expandedQuestions.has(question.id)}
            onToggle={() => toggleQuestion(question.id)}
            onEditQuestion={(q) => setModalState({ type: "editQuestion", question: q })}
            onDeleteQuestion={(id, text) => setModalState({ type: "deleteQuestion", id, text })}
            onCreateOption={(questionId) => setModalState({ type: "createOption", questionId })}
            onEditOption={(questionId, option) => setModalState({ type: "editOption", questionId, option })}
            onDeleteOption={(questionId, optionId, displayText) => setModalState({ type: "deleteOption", questionId, optionId, displayText })}
            onCreateFieldSemantic={(questionId) => setModalState({ type: "createFieldSemantic", questionId })}
            onEditFieldSemantic={(questionId, fieldSemantic) => setModalState({ type: "editFieldSemantic", questionId, fieldSemantic })}
            onDeleteFieldSemantic={(questionId, fieldSemanticId, dimensionCode) => setModalState({ type: "deleteFieldSemantic", questionId, fieldSemanticId, dimensionCode })}
          />
        ))}

        {sortedQuestions.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white py-12 text-center">
            <p className="text-sm text-neutral-600">No questions yet. Create your first question.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <QuestionFormModal
        isOpen={modalState.type === "createQuestion" || modalState.type === "editQuestion"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={modalState.type === "createQuestion" ? handleCreateQuestion : handleUpdateQuestion}
        questionId={modalState.type === "editQuestion" ? modalState.question.id : undefined}
        initialData={modalState.type === "editQuestion" ? modalState.question : undefined}
        mode={modalState.type === "createQuestion" ? "create" : "edit"}
      />

      {modalState.type === "deleteQuestion" && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModalState({ type: "none" })}
          onConfirm={handleDeleteQuestion}
          title="Delete Question"
          description={
            <div>
              <p className="mb-3">Are you sure you want to delete this question?</p>
              <div className="rounded-lg bg-neutral-100 p-3">
                <p className="font-medium text-neutral-900">{modalState.text}</p>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                This will also delete all options for this question. This action cannot be undone.
              </p>
            </div>
          }
          confirmText="Delete Question"
          variant="danger"
        />
      )}

      <OptionFormModal
        isOpen={modalState.type === "createOption" || modalState.type === "editOption"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={modalState.type === "createOption" ? handleCreateOption : handleUpdateOption}
        initialData={modalState.type === "editOption" ? modalState.option : undefined}
        mode={modalState.type === "createOption" ? "create" : "edit"}
        existingValueKeys={[]}
      />

      {modalState.type === "deleteOption" && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModalState({ type: "none" })}
          onConfirm={handleDeleteOption}
          title="Delete Option"
          description={
            <div>
              <p className="mb-3">Are you sure you want to delete this option?</p>
              <div className="rounded-lg bg-neutral-100 p-3">
                <p className="font-medium text-neutral-900">{modalState.displayText}</p>
              </div>
              <p className="mt-3 text-xs text-neutral-500">This action cannot be undone.</p>
            </div>
          }
          confirmText="Delete Option"
          variant="danger"
        />
      )}

      <FieldSemanticFormModal
        isOpen={modalState.type === "createFieldSemantic" || modalState.type === "editFieldSemantic"}
        onClose={() => setModalState({ type: "none" })}
        onSubmit={modalState.type === "createFieldSemantic" ? handleCreateFieldSemantic : handleUpdateFieldSemantic}
        initialData={modalState.type === "editFieldSemantic" ? modalState.fieldSemantic : undefined}
        mode={modalState.type === "createFieldSemantic" ? "create" : "edit"}
      />

      {modalState.type === "deleteFieldSemantic" && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModalState({ type: "none" })}
          onConfirm={handleDeleteFieldSemantic}
          title="Delete Field Semantic"
          description={
            <div>
              <p className="mb-3">Are you sure you want to delete this field semantic?</p>
              <div className="rounded-lg bg-neutral-100 p-3">
                <p className="font-mono font-medium text-neutral-900">{modalState.dimensionCode}</p>
              </div>
              <p className="mt-3 text-xs text-neutral-500">This action cannot be undone.</p>
            </div>
          }
          confirmText="Delete Field Semantic"
          variant="danger"
        />
      )}
    </div>
  );
}

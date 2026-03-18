"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import {
  useCreateAiQuizQuestions,
  useCreateQuizQuestion,
  useDeleteQuizQuestion,
  useDeleteQuizQuestionOption,
  useUpdateQuizQuestion,
  useUpdateQuizQuestionOption,
} from "../api/mutations";
import { useQuizQuestionsByQuizId, useQuizById } from "../api/queries";
import type {
  AiQuizQuestionItem,
  AiQuizQuestionOptionItem,
  QuizQuestionType,
  CreateQuizQuestionOptionInputDto,
  CreateAiQuizQuestionsResponse,
  CreateQuizQuestionWithOptionsDto,
  QuizQuestionItem,
  QuizQuestionOptionItem,
  UpdateQuizQuestionDto,
  UpdateQuizQuestionOptionDto,
} from "../api/types";
import { QuizQuestionType as QuizQuestionTypeEnum } from "../api/types";
import { toast } from "@/shared/lib";

// ─── Types ────────────────────────────────────────────────────────────────────

type OptionDraft = CreateQuizQuestionOptionInputDto & { _id: string };

interface QuestionDraft {
  _qid: string;
  questionKey: string;
  prompt: string;
  type: QuizQuestionType;
  scoreWeight: number;
  orderNo: number;
  isRequired: boolean;
  options: OptionDraft[];
}

type ExistingQuestionDraft = UpdateQuizQuestionDto;
type ExistingOptionDraft = UpdateQuizQuestionOptionDto;

// ─── Constants / helpers ──────────────────────────────────────────────────────

const QUESTION_TYPES: Array<{ label: string; value: QuizQuestionType }> = [
  { label: "Single Choice", value: QuizQuestionTypeEnum.SingleChoice },
  { label: "Multiple Choice", value: QuizQuestionTypeEnum.MultipleChoice },
  { label: "Scale", value: QuizQuestionTypeEnum.Scale },
  { label: "Short Answer", value: QuizQuestionTypeEnum.ShortAnswer },
];

const HAS_OPTIONS = (type: QuizQuestionType) =>
  type === QuizQuestionTypeEnum.SingleChoice ||
  type === QuizQuestionTypeEnum.MultipleChoice;

const newOption = (orderNo: number): OptionDraft => ({
  _id: `opt-${Date.now()}-${Math.random()}`,
  valueKey: "",
  displayText: "",
  isCorrect: false,
  scoreValue: 0,
  orderNo,
});

const newQuestion = (orderNo: number): QuestionDraft => ({
  _qid: `q-${Date.now()}-${Math.random()}`,
  questionKey: "",
  prompt: "",
  type: QuizQuestionTypeEnum.SingleChoice,
  scoreWeight: 1,
  orderNo,
  isRequired: true,
  options: [],
});

const parseQuestionType = (value: QuizQuestionType | string): QuizQuestionType => {
  if (typeof value === "number") return value;
  const normalized = String(value).toLowerCase();
  if (normalized === "singlechoice") return QuizQuestionTypeEnum.SingleChoice;
  if (normalized === "multiplechoice") return QuizQuestionTypeEnum.MultipleChoice;
  if (normalized === "scale") return QuizQuestionTypeEnum.Scale;
  if (normalized === "shortanswer") return QuizQuestionTypeEnum.ShortAnswer;
  return QuizQuestionTypeEnum.SingleChoice;
};

const getQuestionTypeLabel = (value: QuizQuestionType | string) => {
  const type = parseQuestionType(value);
  return QUESTION_TYPES.find((t) => t.value === type)?.label ?? String(value);
};

const toQuestionDraft = (question: QuizQuestionItem): ExistingQuestionDraft => ({
  questionKey: question.questionKey,
  prompt: question.prompt,
  type: parseQuestionType(question.type),
  scoreWeight: Number(question.scoreWeight ?? 1),
  orderNo: Number(question.orderNo ?? 1),
  isRequired: !!question.isRequired,
});

const toOptionDraft = (option: QuizQuestionOptionItem): ExistingOptionDraft => ({
  id: option.id,
  valueKey: option.valueKey,
  displayText: option.displayText,
  isCorrect: !!option.isCorrect,
  scoreValue: option.scoreValue ?? 0,
  orderNo: option.orderNo,
});

const AI_QUESTION_ARRAY_KEYS = [
  "questions",
  "quizQuestionDtos",
  "generatedQuestions",
  "quizQuestions",
  "items",
] as const;

const AI_NESTED_KEYS = ["result", "payload", "data"] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractAiQuizQuestions = (value: unknown): AiQuizQuestionItem[] => {
  if (!isRecord(value)) return [];

  for (const key of AI_QUESTION_ARRAY_KEYS) {
    const candidate = value[key];
    if (Array.isArray(candidate)) {
      return candidate as AiQuizQuestionItem[];
    }
  }

  for (const key of AI_NESTED_KEYS) {
    const candidate = extractAiQuizQuestions(value[key]);
    if (candidate.length > 0) return candidate;
  }

  return [];
};

const toAiOptionDraft = (
  option: AiQuizQuestionOptionItem,
  orderNo: number
): OptionDraft => ({
  _id: `ai-opt-${Date.now()}-${Math.random()}`,
  valueKey: option?.valueKey?.trim() || String.fromCharCode(64 + orderNo),
  displayText: option?.displayText?.trim() || `Option ${orderNo}`,
  isCorrect: !!option?.isCorrect,
  scoreValue: option?.scoreValue ?? 0,
  orderNo,
});

const toAiQuestionDraft = (question: AiQuizQuestionItem, orderNo: number): QuestionDraft => {
  const type = parseQuestionType((question.type as QuizQuestionType | string) ?? QuizQuestionTypeEnum.SingleChoice);
  const rawOptions = Array.isArray(question.options) ? question.options : [];

  const options = HAS_OPTIONS(type)
    ? rawOptions.length > 0
      ? rawOptions.map((option, index) => toAiOptionDraft(option, index + 1))
      : [newOption(1), newOption(2)]
    : [];

  return {
    _qid: `ai-q-${Date.now()}-${Math.random()}`,
    questionKey: question.questionKey?.trim() || `ai_q_${orderNo}`,
    prompt: question.prompt?.trim() || "",
    type,
    scoreWeight: Number(question.scoreWeight ?? 1),
    orderNo: Number(question.orderNo ?? orderNo),
    isRequired: question.isRequired ?? true,
    options,
  };
};

// ─── Component ────────────────────────────────────────────────────────────────

export function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = Number(params?.quizId);
  const fallbackRoadmapId = Number(searchParams.get("roadmapId"));
  const fallbackRoadmapNodeId = Number(searchParams.get("roadmapNodeId"));
  const createAiQuizQuestionsMutation = useCreateAiQuizQuestions();
  const createQuestionMutation = useCreateQuizQuestion();
  const deleteQuestionMutation = useDeleteQuizQuestion();
  const deleteOptionMutation = useDeleteQuizQuestionOption();
  const updateQuestionMutation = useUpdateQuizQuestion();
  const updateOptionMutation = useUpdateQuizQuestionOption();
  const quizDetailQuery = useQuizById(quizId);
  const quizQuestionsQuery = useQuizQuestionsByQuizId(quizId, {
    enabled: Number.isFinite(quizId) && quizId > 0,
  });

  const isValidQuizId = useMemo(() => Number.isFinite(quizId) && quizId > 0, [quizId]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion(1)]);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editingOptionIds, setEditingOptionIds] = useState<Record<number, boolean>>({});
  const [questionEdits, setQuestionEdits] = useState<Record<number, ExistingQuestionDraft>>({});
  const [optionEdits, setOptionEdits] = useState<Record<number, ExistingOptionDraft>>({});
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuestionCount, setAiQuestionCount] = useState(10);
  const [aiResponse, setAiResponse] = useState<CreateAiQuizQuestionsResponse | null>(null);
  const [aiDraftQuestions, setAiDraftQuestions] = useState<QuestionDraft[]>([]);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const [deletingOptionId, setDeletingOptionId] = useState<number | null>(null);
  const existingQuestions = quizQuestionsQuery.data?.quizQuestionDtos ?? [];
  const aiQuestions = useMemo(() => extractAiQuizQuestions(aiResponse), [aiResponse]);
  const roadmapId = Number.isFinite(fallbackRoadmapId) && fallbackRoadmapId > 0
    ? fallbackRoadmapId
    : undefined;
  const roadmapNodeId =
    quizDetailQuery.data?.quizDto?.roadmapNodeId && quizDetailQuery.data.quizDto.roadmapNodeId > 0
      ? quizDetailQuery.data.quizDto.roadmapNodeId
      : Number.isFinite(fallbackRoadmapNodeId) && fallbackRoadmapNodeId > 0
        ? fallbackRoadmapNodeId
        : undefined;

  // ── Question-level helpers ──────────────────────────────────────────────────

  const updateQuestion = (qid: string, patch: Partial<Omit<QuestionDraft, "_qid" | "options">>) => {
    setQuestions((prev) => prev.map((q) => (q._qid === qid ? { ...q, ...patch } : q)));
  };

  const changeQuestionType = (qid: string, type: QuizQuestionType) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._qid !== qid) return q;
        return { ...q, type, options: HAS_OPTIONS(type) ? q.options : [] };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, newQuestion(prev.length + 1)]);
  };

  const removeQuestion = (qid: string) => {
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q._qid !== qid);
      return filtered.map((q, i) => ({ ...q, orderNo: i + 1 }));
    });
  };

  // ── Option-level helpers ────────────────────────────────────────────────────

  const addOption = (qid: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._qid !== qid) return q;
        return { ...q, options: [...q.options, newOption(q.options.length + 1)] };
      })
    );
  };

  const removeOption = (qid: string, oid: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._qid !== qid) return q;
        const filtered = q.options.filter((o) => o._id !== oid);
        return { ...q, options: filtered.map((o, i) => ({ ...o, orderNo: i + 1 })) };
      })
    );
  };

  const updateOption = (
    qid: string,
    oid: string,
    field: keyof CreateQuizQuestionOptionInputDto,
    value: string | boolean | number | null
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._qid !== qid) return q;
        let newOptions = q.options.map((o) => (o._id === oid ? { ...o, [field]: value } : o));

        // For SingleChoice: selecting isCorrect=true deselects all others
        if (field === "isCorrect" && value === true && q.type === QuizQuestionTypeEnum.SingleChoice) {
          newOptions = newOptions.map((o) => ({ ...o, isCorrect: o._id === oid }));
        }

        return { ...q, options: newOptions };
      })
    );
  };

  // ── Validation & submit ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!isValidQuizId) { toast.error("Invalid quiz id"); return; }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const num = i + 1;

      if (!q.questionKey.trim() || !q.prompt.trim()) {
        toast.warning(`Question ${num}: fill in Question Key and Prompt`);
        return;
      }
      if (HAS_OPTIONS(q.type) && q.options.length === 0) {
        toast.warning(`Question ${num}: add at least one option`);
        return;
      }
      if (HAS_OPTIONS(q.type) && q.options.some((o) => !o.valueKey.trim() || !o.displayText.trim())) {
        toast.warning(`Question ${num}: all options need Value Key and Display Text`);
        return;
      }
    }

    const dtos: CreateQuizQuestionWithOptionsDto[] = questions.map((q) => ({
      quizId,
      questionKey: q.questionKey.trim(),
      prompt: q.prompt.trim(),
      type: q.type,
      scoreWeight: q.scoreWeight > 0 ? q.scoreWeight : 1,
      orderNo: Math.max(1, Math.trunc(q.orderNo)),
      isRequired: q.isRequired,
      options: q.options.map(({ _id: _ignored, ...rest }) => ({
        ...rest,
        valueKey: rest.valueKey.trim(),
        displayText: rest.displayText.trim(),
        scoreValue: rest.scoreValue ?? 0,
      })),
    }));

    try {
      await createQuestionMutation.mutateAsync({ createQuizQuestionDtos: dtos });
      toast.success(`${dtos.length} question${dtos.length > 1 ? "s" : ""} created`);
      setQuestions([newQuestion(1)]);
      setIsFormOpen(false);
    } catch {
      toast.error("Failed to create questions", { description: "Please check inputs and try again." });
    }
  };

  const handleCancel = () => {
    setQuestions([newQuestion(1)]);
    setIsFormOpen(false);
  };

  const handleOpenAiModal = () => {
    setAiResponse(null);
    setAiDraftQuestions([]);
    setAiQuestionCount(5);
    setIsAiModalOpen(true);
  };

  const handleCloseAiModal = () => {
    if (createAiQuizQuestionsMutation.isPending) return;
    setIsAiModalOpen(false);
  };

  const handleCreateQuizWithAi = async () => {
    if (!isValidQuizId) {
      toast.error("Invalid quiz id");
      return;
    }

    if (!roadmapNodeId || roadmapNodeId <= 0) {
      toast.error("Missing roadmap node", {
        description: "Quiz detail does not contain roadmap node information yet.",
      });
      return;
    }

    if (!roadmapId || roadmapId <= 0) {
      toast.error("Missing roadmap", {
        description: "Please open this quiz from a roadmap detail page so AI can use the roadmap context.",
      });
      return;
    }

    try {
      const response = await createAiQuizQuestionsMutation.mutateAsync({
        quizId,
        roadmapId,
        roadmapNodeId,
        questionCount: Math.min(20, Math.max(1, Math.trunc(aiQuestionCount || 1))),
      });

      setAiResponse(response);
      const parsedQuestions = extractAiQuizQuestions(response);
      setAiDraftQuestions(parsedQuestions.map((question, index) => toAiQuestionDraft(question, index + 1)));
      toast.success("AI quiz generated successfully");
      await quizQuestionsQuery.refetch();
    } catch {
      toast.error("Failed to generate quiz with AI", {
        description: "Please try again after checking the selected study plan context.",
      });
    }
  };

  const updateAiQuestion = (
    qid: string,
    patch: Partial<Omit<QuestionDraft, "_qid" | "options">>
  ) => {
    setAiDraftQuestions((prev) => prev.map((q) => (q._qid === qid ? { ...q, ...patch } : q)));
  };

  const changeAiQuestionType = (qid: string, type: QuizQuestionType) => {
    setAiDraftQuestions((prev) =>
      prev.map((q) => {
        if (q._qid !== qid) return q;
        return { ...q, type, options: HAS_OPTIONS(type) ? (q.options.length > 0 ? q.options : [newOption(1), newOption(2)]) : [] };
      })
    );
  };

  const addAiOption = (qid: string) => {
    setAiDraftQuestions((prev) =>
      prev.map((q) => {
        if (q._qid !== qid) return q;
        return { ...q, options: [...q.options, newOption(q.options.length + 1)] };
      })
    );
  };

  const removeAiOption = (qid: string, oid: string) => {
    setAiDraftQuestions((prev) =>
      prev.map((q) => {
        if (q._qid !== qid) return q;
        const filtered = q.options.filter((o) => o._id !== oid);
        return { ...q, options: filtered.map((o, i) => ({ ...o, orderNo: i + 1 })) };
      })
    );
  };

  const updateAiOption = (
    qid: string,
    oid: string,
    field: keyof CreateQuizQuestionOptionInputDto,
    value: string | boolean | number | null
  ) => {
    setAiDraftQuestions((prev) =>
      prev.map((q) => {
        if (q._qid !== qid) return q;
        let options = q.options.map((o) => (o._id === oid ? { ...o, [field]: value } : o));

        if (field === "isCorrect" && value === true && q.type === QuizQuestionTypeEnum.SingleChoice) {
          options = options.map((o) => ({ ...o, isCorrect: o._id === oid }));
        }

        return { ...q, options };
      })
    );
  };

  const handleSaveAiDraftToDb = async () => {
    if (!isValidQuizId) {
      toast.error("Invalid quiz id");
      return;
    }

    if (aiDraftQuestions.length === 0) {
      toast.warning("No AI questions to save");
      return;
    }

    for (let i = 0; i < aiDraftQuestions.length; i++) {
      const q = aiDraftQuestions[i];
      const num = i + 1;

      if (!q.questionKey.trim() || !q.prompt.trim()) {
        toast.warning(`AI Question ${num}: fill in Question Key and Prompt`);
        return;
      }
      if (HAS_OPTIONS(q.type) && q.options.length === 0) {
        toast.warning(`AI Question ${num}: add at least one option`);
        return;
      }
      if (HAS_OPTIONS(q.type) && q.options.some((o) => !o.valueKey.trim() || !o.displayText.trim())) {
        toast.warning(`AI Question ${num}: all options need Value Key and Display Text`);
        return;
      }
    }

    const dtos: CreateQuizQuestionWithOptionsDto[] = aiDraftQuestions.map((q, index) => ({
      quizId,
      questionKey: q.questionKey.trim(),
      prompt: q.prompt.trim(),
      type: q.type,
      scoreWeight: q.scoreWeight > 0 ? q.scoreWeight : 1,
      orderNo: Math.max(1, Math.trunc(q.orderNo || index + 1)),
      isRequired: q.isRequired,
      options: q.options.map(({ _id: _ignored, ...rest }) => ({
        ...rest,
        valueKey: rest.valueKey.trim(),
        displayText: rest.displayText.trim(),
        scoreValue: rest.scoreValue ?? 0,
      })),
    }));

    try {
      await createQuestionMutation.mutateAsync({ createQuizQuestionDtos: dtos });
      toast.success(`Saved ${dtos.length} AI question${dtos.length > 1 ? "s" : ""} to database`);
      await quizQuestionsQuery.refetch();
      setIsAiModalOpen(false);
      setAiResponse(null);
      setAiDraftQuestions([]);
    } catch {
      toast.error("Failed to save AI questions to database");
    }
  };

  const startEditQuestion = (question: QuizQuestionItem) => {
    setEditingQuestionId(question.id);
    setQuestionEdits((prev) => ({
      ...prev,
      [question.id]: prev[question.id] ?? toQuestionDraft(question),
    }));
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
  };

  const handleEditQuestionChange = (
    questionId: number,
    field: keyof ExistingQuestionDraft,
    value: string | number | boolean
  ) => {
    setQuestionEdits((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? {
          questionKey: "",
          prompt: "",
          type: QuizQuestionTypeEnum.SingleChoice,
          scoreWeight: 1,
          orderNo: 1,
          isRequired: true,
        }),
        [field]: value,
      } as ExistingQuestionDraft,
    }));
  };

  const saveQuestion = async (question: QuizQuestionItem) => {
    const edit = questionEdits[question.id] ?? toQuestionDraft(question);

    if (!edit.questionKey.trim() || !edit.prompt.trim()) {
      toast.warning("Question Key and Prompt are required");
      return;
    }

    try {
      await updateQuestionMutation.mutateAsync({
        id: question.id,
        quizId,
        updateQuizQuestionDto: {
          questionKey: edit.questionKey.trim(),
          prompt: edit.prompt.trim(),
          type: edit.type,
          scoreWeight: Number(edit.scoreWeight) > 0 ? Number(edit.scoreWeight) : 1,
          orderNo: Number(edit.orderNo) > 0 ? Math.trunc(Number(edit.orderNo)) : 1,
          isRequired: !!edit.isRequired,
        },
      });

      setEditingQuestionId(null);
      toast.success("Question updated");
      await quizQuestionsQuery.refetch();
    } catch {
      toast.error("Failed to update question");
    }
  };

  const startEditOption = (option: QuizQuestionOptionItem) => {
    setEditingOptionIds((prev) => ({ ...prev, [option.id]: true }));
    setOptionEdits((prev) => ({
      ...prev,
      [option.id]: prev[option.id] ?? toOptionDraft(option),
    }));
  };

  const cancelEditOption = (optionId: number) => {
    setEditingOptionIds((prev) => ({ ...prev, [optionId]: false }));
  };

  const handleEditOptionChange = (
    optionId: number,
    field: keyof ExistingOptionDraft,
    value: string | number | boolean | null
  ) => {
    setOptionEdits((prev) => ({
      ...prev,
      [optionId]: {
        ...(prev[optionId] ?? {
          id: optionId,
          valueKey: "",
          displayText: "",
          isCorrect: false,
          scoreValue: 0,
          orderNo: 1,
        }),
        [field]: value,
      } as ExistingOptionDraft,
    }));
  };

  const selectSingleCorrectOption = (question: QuizQuestionItem, selectedOptionId: number) => {
    if (parseQuestionType(question.type) !== QuizQuestionTypeEnum.SingleChoice) return;
    setOptionEdits((prev) => {
      const next = { ...prev };
      question.options.forEach((option) => {
        const source = next[option.id] ?? toOptionDraft(option);
        next[option.id] = {
          ...source,
          isCorrect: option.id === selectedOptionId,
        };
      });
      return next;
    });
  };

  const saveOption = async (question: QuizQuestionItem, option: QuizQuestionOptionItem) => {
    const edit = optionEdits[option.id] ?? toOptionDraft(option);
    if (!edit.valueKey.trim() || !edit.displayText.trim()) {
      toast.warning("Option Value Key and Display Text are required");
      return;
    }

    try {
      await updateOptionMutation.mutateAsync({
        id: option.id,
        quizId,
        updateQuizQuestionOptionDto: {
          id: option.id,
          valueKey: edit.valueKey.trim(),
          displayText: edit.displayText.trim(),
          isCorrect: !!edit.isCorrect,
          scoreValue: edit.scoreValue ?? 0,
          orderNo: Number(edit.orderNo) > 0 ? Math.trunc(Number(edit.orderNo)) : 1,
        },
      });

      setEditingOptionIds((prev) => ({ ...prev, [option.id]: false }));
      toast.success("Option updated");
      await quizQuestionsQuery.refetch();
    } catch {
      toast.error("Failed to update option");
    }
  };

  const deleteQuestion = async (questionId: number) => {
    const confirmed = window.confirm("Delete this question?");
    if (!confirmed) return;

    setDeletingQuestionId(questionId);
    try {
      await deleteQuestionMutation.mutateAsync({ id: questionId, quizId });
      toast.success("Question deleted");
      await quizQuestionsQuery.refetch();
    } catch {
      toast.error("Failed to delete question");
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const deleteOption = async (optionId: number) => {
    const confirmed = window.confirm("Delete this option?");
    if (!confirmed) return;

    setDeletingOptionId(optionId);
    try {
      await deleteOptionMutation.mutateAsync({ id: optionId, quizId });
      toast.success("Option deleted");
      await quizQuestionsQuery.refetch();
    } catch {
      toast.error("Failed to delete option");
    } finally {
      setDeletingOptionId(null);
    }
  };

  // ─── Invalid quiz id ────────────────────────────────────────────────────────

  if (!isValidQuizId) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Invalid quiz id.
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              {quizDetailQuery.isLoading
                ? "Loading..."
                : (quizDetailQuery.data?.quizDto?.title ?? "Quiz Detail")}
            </h1>
            {quizDetailQuery.data?.quizDto?.description && (
              <p className="text-sm text-neutral-500 mt-0.5">
                {quizDetailQuery.data.quizDto.description}
              </p>
            )}
            {quizDetailQuery.data?.quizDto?.totalScore != null && (
              <p className="text-xs text-neutral-400 mt-0.5">
                Total score: {quizDetailQuery.data.quizDto.totalScore}
              </p>
            )}
          </div>
        </div>

        {!isFormOpen && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAiModal}
              className="flex items-center gap-1.5 rounded-lg border border-[#00bae2]/30 bg-[#00bae2]/10 px-3 py-2 text-sm font-medium text-[#007f9c] shadow-sm hover:bg-[#00bae2]/15 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Create Quiz with AI
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              Create Questions
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            Existing Questions ({existingQuestions.length})
          </h2>
          <button
            type="button"
            onClick={() => quizQuestionsQuery.refetch()}
            disabled={quizQuestionsQuery.isFetching}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            {quizQuestionsQuery.isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {quizQuestionsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading questions...
          </div>
        ) : quizQuestionsQuery.isError ? (
          <p className="text-sm text-red-600">Cannot load quiz questions.</p>
        ) : existingQuestions.length === 0 ? (
          <p className="text-sm text-neutral-500">No questions yet.</p>
        ) : (
          <div className="space-y-3">
            {[...existingQuestions]
              .sort((a, b) => a.orderNo - b.orderNo)
              .map((question, qIndex) => (
                <div
                  key={question.id}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-900">
                      Q{qIndex + 1}. {question.prompt}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] rounded bg-white px-2 py-1 text-neutral-600 border border-neutral-200">
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteQuestion(question.id)}
                        disabled={deletingQuestionId === question.id || deleteQuestionMutation.isPending}
                        className="text-xs rounded border border-red-300 bg-red-50 px-2 py-1 text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        {deletingQuestionId === question.id ? "Deleting..." : "Delete Question"}
                      </button>
                      {editingQuestionId === question.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => cancelEditQuestion()}
                            className="text-xs rounded border border-neutral-200 px-2 py-1 text-neutral-600 hover:bg-neutral-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveQuestion(question)}
                            disabled={updateQuestionMutation.isPending}
                            className="text-xs rounded border border-[#00bae2]/30 bg-[#00bae2]/10 px-2 py-1 text-[#007f9c] hover:bg-[#00bae2]/20 disabled:opacity-60"
                          >
                            {updateQuestionMutation.isPending ? "Saving..." : "Save Question"}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditQuestion(question)}
                          className="text-xs rounded border border-amber-300 bg-amber-50 px-2 py-1 text-amber-700 hover:bg-amber-100"
                        >
                          Edit Question
                        </button>
                      )}
                    </div>
                  </div>

                  {editingQuestionId === question.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={(questionEdits[question.id] ?? toQuestionDraft(question)).questionKey}
                        onChange={(e) => handleEditQuestionChange(question.id, "questionKey", e.target.value)}
                        className="rounded border border-neutral-300 px-2 py-1.5"
                        placeholder="Question key"
                      />
                      <select
                        value={(questionEdits[question.id] ?? toQuestionDraft(question)).type}
                        onChange={(e) =>
                          handleEditQuestionChange(
                            question.id,
                            "type",
                            Number(e.target.value) as QuizQuestionType
                          )
                        }
                        className="rounded border border-neutral-300 px-2 py-1.5"
                      >
                        {QUESTION_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={(questionEdits[question.id] ?? toQuestionDraft(question)).prompt}
                        onChange={(e) => handleEditQuestionChange(question.id, "prompt", e.target.value)}
                        className="md:col-span-2 rounded border border-neutral-300 px-2 py-1.5 min-h-[70px]"
                        placeholder="Prompt"
                      />
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={(questionEdits[question.id] ?? toQuestionDraft(question)).scoreWeight}
                        onChange={(e) => handleEditQuestionChange(question.id, "scoreWeight", Number(e.target.value))}
                        className="rounded border border-neutral-300 px-2 py-1.5"
                        placeholder="Score weight"
                      />
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={(questionEdits[question.id] ?? toQuestionDraft(question)).orderNo}
                        onChange={(e) => handleEditQuestionChange(question.id, "orderNo", Number(e.target.value))}
                        className="rounded border border-neutral-300 px-2 py-1.5"
                        placeholder="Order"
                      />
                      <label className="md:col-span-2 inline-flex items-center gap-2 text-xs text-neutral-700">
                        <input
                          type="checkbox"
                          checked={(questionEdits[question.id] ?? toQuestionDraft(question)).isRequired}
                          onChange={(e) => handleEditQuestionChange(question.id, "isRequired", e.target.checked)}
                        />
                        Required question
                      </label>
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-600">
                      Key: <span className="font-medium">{question.questionKey}</span> · Order: {question.orderNo}
                    </div>
                  )}

                  {question.options?.length ? (
                    <div className="space-y-1 pt-1">
                      {[...question.options]
                        .sort((a, b) => a.orderNo - b.orderNo)
                        .map((option) => (
                          <div
                            key={option.id}
                            className={`rounded-md border px-2.5 py-1.5 text-xs ${
                              option.isCorrect
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-neutral-200 bg-white text-neutral-700"
                            }`}
                          >
                            {editingOptionIds[option.id] ? (
                              <div className="space-y-1.5">
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={(optionEdits[option.id] ?? toOptionDraft(option)).valueKey}
                                    onChange={(e) =>
                                      handleEditOptionChange(option.id, "valueKey", e.target.value)
                                    }
                                    className="rounded border border-neutral-300 px-2 py-1"
                                    placeholder="Value key"
                                  />
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={(optionEdits[option.id] ?? toOptionDraft(option)).orderNo}
                                    onChange={(e) =>
                                      handleEditOptionChange(option.id, "orderNo", Number(e.target.value))
                                    }
                                    className="rounded border border-neutral-300 px-2 py-1"
                                    placeholder="Order"
                                  />
                                  <input
                                    type="text"
                                    value={(optionEdits[option.id] ?? toOptionDraft(option)).displayText}
                                    onChange={(e) =>
                                      handleEditOptionChange(option.id, "displayText", e.target.value)
                                    }
                                    className="col-span-2 rounded border border-neutral-300 px-2 py-1"
                                    placeholder="Display text"
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={(optionEdits[option.id] ?? toOptionDraft(option)).scoreValue ?? 0}
                                    onChange={(e) =>
                                      handleEditOptionChange(option.id, "scoreValue", Number(e.target.value))
                                    }
                                    className="rounded border border-neutral-300 px-2 py-1"
                                    placeholder="Score value"
                                  />
                                  {parseQuestionType(question.type) === QuizQuestionTypeEnum.SingleChoice ? (
                                    <label className="inline-flex items-center gap-2 text-xs text-neutral-700">
                                      <input
                                        type="radio"
                                        name={`existing-correct-${question.id}`}
                                        checked={(optionEdits[option.id] ?? toOptionDraft(option)).isCorrect}
                                        onChange={() => {
                                          selectSingleCorrectOption(question, option.id);
                                          handleEditOptionChange(option.id, "isCorrect", true);
                                        }}
                                      />
                                      Correct answer
                                    </label>
                                  ) : (
                                    <label className="inline-flex items-center gap-2 text-xs text-neutral-700">
                                      <input
                                        type="checkbox"
                                        checked={(optionEdits[option.id] ?? toOptionDraft(option)).isCorrect}
                                        onChange={(e) =>
                                          handleEditOptionChange(option.id, "isCorrect", e.target.checked)
                                        }
                                      />
                                      Correct answer
                                    </label>
                                  )}
                                </div>

                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => cancelEditOption(option.id)}
                                    className="rounded border border-neutral-300 px-2 py-1 text-[11px] text-neutral-600"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => saveOption(question, option)}
                                    disabled={updateOptionMutation.isPending}
                                    className="rounded border border-[#00bae2]/30 bg-[#00bae2]/10 px-2 py-1 text-[11px] text-[#007f9c] disabled:opacity-60"
                                  >
                                    {updateOptionMutation.isPending ? "Saving..." : "Save Option"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <span className="font-semibold mr-1">{option.valueKey}.</span>
                                  {option.displayText}
                                  {option.isCorrect && <span className="ml-2 font-semibold">(Correct)</span>}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => startEditOption(option)}
                                    className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] text-amber-700 hover:bg-amber-100"
                                  >
                                    Edit Option
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteOption(option.id)}
                                    disabled={deletingOptionId === option.id || deleteOptionMutation.isPending}
                                    className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-700 hover:bg-red-100 disabled:opacity-60"
                                  >
                                    {deletingOptionId === option.id ? "Deleting..." : "Delete Option"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 italic">No options for this question type.</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Batch question form */}
      {isFormOpen && (
        <div className="space-y-4">
          {/* Question cards */}
          {questions.map((q, qIdx) => (
            <div
              key={q._qid}
              className="rounded-xl border border-[#00bae2]/20 bg-[#00bae2]/5 p-5 space-y-4"
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-900">Question {qIdx + 1}</h2>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(q._qid)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>

              {/* Key + Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Question Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={q.questionKey}
                    onChange={(e) => updateQuestion(q._qid, { questionKey: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                    placeholder="ex: q_angular_1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">Type</label>
                  <select
                    value={q.type}
                    onChange={(e) => changeQuestionType(q._qid, Number(e.target.value) as QuizQuestionType)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={q.prompt}
                  onChange={(e) => updateQuestion(q._qid, { prompt: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none min-h-[80px] focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                  placeholder="Enter question prompt"
                />
              </div>

              {/* Score Weight + Order No + Is Required */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">Score Weight</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={q.scoreWeight}
                    onChange={(e) => updateQuestion(q._qid, { scoreWeight: Number(e.target.value) })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">Order No</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={q.orderNo}
                    onChange={(e) => updateQuestion(q._qid, { orderNo: Number(e.target.value) })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                  />
                </div>
                <div className="col-span-2 flex items-center pb-1">
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.isRequired}
                      onChange={(e) => updateQuestion(q._qid, { isRequired: e.target.checked })}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    Required question
                  </label>
                </div>
              </div>

              {/* Answer Options */}
              {HAS_OPTIONS(q.type) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-neutral-700">
                      Answer Options
                      <span className="ml-1 font-normal text-neutral-400">({q.options.length})</span>
                      {q.type === QuizQuestionTypeEnum.SingleChoice && (
                        <span className="ml-2 text-[10px] text-amber-600 font-normal">— only 1 correct</span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => addOption(q._qid)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#00bae2] border border-[#00bae2]/30 hover:bg-[#00bae2]/5 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Option
                    </button>
                  </div>

                  {q.options.length === 0 && (
                    <p className="text-xs text-neutral-400 italic">No options yet. Click "+ Add Option".</p>
                  )}

                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={opt._id}
                        className="rounded-lg border border-neutral-200 bg-white p-3 space-y-2"
                      >
                        {/* Option header */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-neutral-500">
                            Option {oIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeOption(q._qid, opt._id)}
                            className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Value Key + Score Value */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-medium text-neutral-600 mb-1">
                              Value Key <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={opt.valueKey}
                              onChange={(e) => updateOption(q._qid, opt._id, "valueKey", e.target.value)}
                              className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                              placeholder="ex: A"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-neutral-600 mb-1">
                              Score Value
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={opt.scoreValue ?? 0}
                              onChange={(e) => updateOption(q._qid, opt._id, "scoreValue", Number(e.target.value))}
                              className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                            />
                          </div>
                        </div>

                        {/* Display Text */}
                        <div>
                          <label className="block text-[10px] font-medium text-neutral-600 mb-1">
                            Display Text <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={opt.displayText}
                            onChange={(e) => updateOption(q._qid, opt._id, "displayText", e.target.value)}
                            className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                            placeholder="Option text shown to user"
                          />
                        </div>

                        {/* Correct answer — radio for Single, checkbox for Multiple */}
                        {q.type === QuizQuestionTypeEnum.SingleChoice ? (
                          <label className="inline-flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                            <input
                              type="radio"
                              name={`correct-${q._qid}`}
                              checked={opt.isCorrect}
                              onChange={() => updateOption(q._qid, opt._id, "isCorrect", true)}
                              className="h-3.5 w-3.5 border-neutral-300 text-[#00bae2]"
                            />
                            Correct answer
                          </label>
                        ) : (
                          <label className="inline-flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={opt.isCorrect}
                              onChange={(e) => updateOption(q._qid, opt._id, "isCorrect", e.target.checked)}
                              className="h-3.5 w-3.5 rounded border-neutral-300 text-[#00bae2]"
                            />
                            Correct answer
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add another question */}
          <button
            type="button"
            onClick={addQuestion}
            className="w-full rounded-xl border-2 border-dashed border-[#00bae2]/30 py-3 text-sm font-medium text-[#00bae2] hover:bg-[#00bae2]/5 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Another Question
          </button>

          {/* Submit / Cancel */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createQuestionMutation.isPending}
              className="flex-1 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              {createQuestionMutation.isPending ? (
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                `Save ${questions.length} Question${questions.length > 1 ? "s" : ""}`
              )}
            </button>
          </div>
        </div>
      )}

      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-950/55 backdrop-blur-sm"
            onClick={handleCloseAiModal}
          />

          <div className="relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Create Quiz with AI</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Generate questions for quiz #{quizId} and preview the AI response.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseAiModal}
                disabled={createAiQuizQuestionsMutation.isPending}
                className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span>
                      Quiz ID: <strong>{quizId}</strong>
                    </span>
                    <span>
                      Roadmap ID: <strong>{roadmapId ?? "N/A"}</strong>
                    </span>
                    <span>
                      Roadmap Node ID: <strong>{roadmapNodeId ?? "N/A"}</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-700">
                    Question Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={aiQuestionCount}
                    onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00bae2] focus:ring-2 focus:ring-[#00bae2]/10"
                  />
                </div>
              </div>

              {aiResponse?.message && (
                <div className="rounded-xl border border-[#00bae2]/20 bg-[#00bae2]/5 px-4 py-3 text-sm text-[#007f9c]">
                  {aiResponse.message}
                </div>
              )}

              {createAiQuizQuestionsMutation.isPending ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#00bae2]/30 bg-[#00bae2]/5 px-6 text-center">
                  <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#00bae2]" />
                  <p className="text-sm font-medium text-neutral-800">AI is generating quiz questions...</p>
                  <p className="mt-1 text-xs text-neutral-500">This may take a few seconds depending on the prompt context.</p>
                </div>
              ) : aiResponse ? (
                aiDraftQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {aiDraftQuestions.map((question, index) => {
                      const options = question.options ?? [];

                      return (
                        <div
                          key={question._qid}
                          className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">Q{index + 1}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setAiDraftQuestions((prev) =>
                                  prev
                                    .filter((q) => q._qid !== question._qid)
                                    .map((q, i) => ({ ...q, orderNo: i + 1 }))
                                )
                              }
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <input
                              type="text"
                              value={question.questionKey}
                              onChange={(e) => updateAiQuestion(question._qid, { questionKey: e.target.value })}
                              className="rounded border border-neutral-300 px-2 py-1.5"
                              placeholder="Question key"
                            />
                            <select
                              value={question.type}
                              onChange={(e) => changeAiQuestionType(question._qid, Number(e.target.value) as QuizQuestionType)}
                              className="rounded border border-neutral-300 px-2 py-1.5"
                            >
                              {QUESTION_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                            <textarea
                              value={question.prompt}
                              onChange={(e) => updateAiQuestion(question._qid, { prompt: e.target.value })}
                              className="md:col-span-2 rounded border border-neutral-300 px-2 py-1.5 min-h-[70px]"
                              placeholder="Prompt"
                            />
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={question.scoreWeight}
                              onChange={(e) => updateAiQuestion(question._qid, { scoreWeight: Number(e.target.value) })}
                              className="rounded border border-neutral-300 px-2 py-1.5"
                              placeholder="Score weight"
                            />
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={question.orderNo}
                              onChange={(e) => updateAiQuestion(question._qid, { orderNo: Number(e.target.value) })}
                              className="rounded border border-neutral-300 px-2 py-1.5"
                              placeholder="Order"
                            />
                            <label className="md:col-span-2 inline-flex items-center gap-2 text-xs text-neutral-700">
                              <input
                                type="checkbox"
                                checked={question.isRequired}
                                onChange={(e) => updateAiQuestion(question._qid, { isRequired: e.target.checked })}
                              />
                              Required question
                            </label>
                          </div>

                          {HAS_OPTIONS(question.type) && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-neutral-700">Answer Options ({options.length})</p>
                                <button
                                  type="button"
                                  onClick={() => addAiOption(question._qid)}
                                  className="rounded border border-[#00bae2]/30 px-2 py-1 text-[11px] font-medium text-[#007f9c]"
                                >
                                  Add Option
                                </button>
                              </div>

                              {options.map((option) => (
                                <div key={option._id} className="rounded-lg border border-neutral-200 bg-white p-3 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={option.valueKey}
                                      onChange={(e) => updateAiOption(question._qid, option._id, "valueKey", e.target.value)}
                                      className="rounded border border-neutral-300 px-2 py-1 text-xs"
                                      placeholder="Value key"
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      value={option.scoreValue ?? 0}
                                      onChange={(e) => updateAiOption(question._qid, option._id, "scoreValue", Number(e.target.value))}
                                      className="rounded border border-neutral-300 px-2 py-1 text-xs"
                                      placeholder="Score"
                                    />
                                    <input
                                      type="text"
                                      value={option.displayText}
                                      onChange={(e) => updateAiOption(question._qid, option._id, "displayText", e.target.value)}
                                      className="col-span-2 rounded border border-neutral-300 px-2 py-1 text-xs"
                                      placeholder="Display text"
                                    />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    {question.type === QuizQuestionTypeEnum.SingleChoice ? (
                                      <label className="inline-flex items-center gap-2 text-xs text-neutral-700">
                                        <input
                                          type="radio"
                                          name={`ai-correct-${question._qid}`}
                                          checked={option.isCorrect}
                                          onChange={() => updateAiOption(question._qid, option._id, "isCorrect", true)}
                                        />
                                        Correct answer
                                      </label>
                                    ) : (
                                      <label className="inline-flex items-center gap-2 text-xs text-neutral-700">
                                        <input
                                          type="checkbox"
                                          checked={option.isCorrect}
                                          onChange={(e) => updateAiOption(question._qid, option._id, "isCorrect", e.target.checked)}
                                        />
                                        Correct answer
                                      </label>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => removeAiOption(question._qid, option._id)}
                                      className="text-xs text-red-500 hover:text-red-700"
                                    >
                                      Remove Option
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() =>
                        setAiDraftQuestions((prev) => [...prev, newQuestion(prev.length + 1)])
                      }
                      className="w-full rounded-lg border border-dashed border-[#00bae2]/40 px-3 py-2 text-sm font-medium text-[#007f9c] hover:bg-[#00bae2]/5"
                    >
                      Add Question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-600">
                      AI returned a response, but no question list matched the current parser. Raw response is shown below.
                    </p>
                    <pre className="overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-950 p-4 text-xs text-neutral-100">
                      {JSON.stringify(aiResponse, null, 2)}
                    </pre>
                  </div>
                )
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-500">
                  Click <strong>Generate with AI</strong> to call the backend and preview the generated questions here.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-6 py-4">
              <p className="text-xs text-neutral-500">
                Review and edit AI-generated questions, then save them to database like manual creation.
              </p>
              <div className="flex items-center gap-2">
                {aiDraftQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSaveAiDraftToDb}
                    disabled={createQuestionMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#00bae2]/30 bg-[#00bae2]/10 px-4 py-2 text-sm font-medium text-[#007f9c] disabled:opacity-60"
                  >
                    {createQuestionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      `Save to DB (${aiDraftQuestions.length})`
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseAiModal}
                  className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCreateQuizWithAi}
                  disabled={createAiQuizQuestionsMutation.isPending || createQuestionMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md disabled:opacity-60"
                >
                  {createAiQuizQuestionsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {aiResponse ? "Generate Again" : "Generate with AI"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

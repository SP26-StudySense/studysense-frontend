import { use } from "react";
import { SurveyDetail } from "@/features/analyst/analyst-survey";

export default function SurveyDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const surveyId = parseInt(id, 10);
  return <SurveyDetail surveyId={surveyId} />;
}

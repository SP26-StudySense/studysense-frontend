import { use } from "react";
import { AnalystSurveyPage } from "@/features/analyst/analyst-survey/AnalystSurveyPage";

export default function SurveyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AnalystSurveyPage surveyId={id} />;
}

import { AdminSurveyPage } from "@/features/admin/admin-surveys/AdminSurveyPage";

export default function SurveyDetailPage({ params }: { params: { id: string } }) {
  return <AdminSurveyPage surveyId={params.id} />;
}

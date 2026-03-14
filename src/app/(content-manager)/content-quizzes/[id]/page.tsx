import { ContentQuizPage } from "@/features/content-manager/quizzes";

export default function ContentQuizDetailPage({ params }: { params: { id: string } }) {
  return <ContentQuizPage quizId={params.id} />;
}

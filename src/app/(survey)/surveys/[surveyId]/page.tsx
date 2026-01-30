import { SurveyPage } from '@/features/survey/components/SurveyPage';
import { SurveyTriggerReason } from '@/features/survey/types';

interface PageProps {
  params: Promise<{ surveyId: string }>;
}

export default async function SurveyResponsePage({ params }: PageProps) {
  // Await params in Next.js 15+
  const { surveyId: surveyIdParam } = await params;
  const surveyId = parseInt(surveyIdParam, 10);

  // Validate surveyId
  if (isNaN(surveyId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fef5fe] via-white to-[#e0f7ff]">
        <div className="glass-panel rounded-3xl border border-red-200 bg-red-50/40 p-8 text-center shadow-xl backdrop-blur-xl">
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">Invalid Survey ID</h3>
          <p className="text-sm text-neutral-600">Please provide a valid survey ID.</p>
        </div>
      </div>
    );
  }

  return (
    <SurveyPage 
      surveyId={surveyId}
      triggerReason={SurveyTriggerReason.MANUAL}
    />
  );
}

import { SurveyPage } from '@/features/survey/components/SurveyPage';
import { cookies } from 'next/headers';
import { env } from '@/shared/config';

interface PageProps {
  params: Promise<{ surveyId: string }>;
}

// Check if this survey is the initial required survey
async function checkIsInitialSurvey(surveyId: number): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(env.NEXT_PUBLIC_AUTH_TOKEN_KEY)?.value;
    
    if (!accessToken) return false;

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL_HTTP}/users/survey-status`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      // Check if this survey ID matches the required initial survey
      return data.requiresInitialSurvey && data.surveyId === surveyId;
    }
  } catch (error) {
    console.error('[Survey Page] Failed to check initial survey status:', error);
  }
  return false;
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

  // Check if this is the initial survey (dynamic check from API)
  const isInitialSurvey = await checkIsInitialSurvey(surveyId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5fe] via-white to-[#e0f7ff] py-12">
      <div className="container mx-auto px-4">
        <SurveyPage surveyId={surveyId} isInitialSurvey={isInitialSurvey} />
      </div>
    </div>
  );
}

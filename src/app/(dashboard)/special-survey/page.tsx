import { SurveyPage } from '@/features/survey/components/SurveyPage';

export default function SpecialSurveyPage() {
  // Fixed surveyId = 3, no status check
  const surveyId = 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5fe] via-white to-[#e0f7ff] py-12">
      <div className="container mx-auto px-4">
        <SurveyPage 
          surveyId={surveyId} 
          isInitialSurvey={false}
        />
      </div>
    </div>
  );
}

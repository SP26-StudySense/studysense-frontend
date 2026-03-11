import { SurveyPage } from '@/features/survey/components/SurveyPage';

export default function SpecialSurveyPage() {
  // Fixed surveyId = 3, no status check
  const surveyId = 3;

  return (
    <SurveyPage 
      surveyId={surveyId} 
      isInitialSurvey={false}
    />
  );
}

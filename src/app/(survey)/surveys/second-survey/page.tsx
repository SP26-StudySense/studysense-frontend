import { SurveyPage } from '@/features/survey/components/SurveyPage';
import { SurveyTriggerReason } from '@/features/survey/types';

export default async function SecondSurveyPage() {
  // Hardcoded surveyId = 3 for second survey
  const surveyId = 3;

  return (
    <SurveyPage 
      surveyId={surveyId}
      triggerReason={SurveyTriggerReason.INITIAL}
    />
  );
}

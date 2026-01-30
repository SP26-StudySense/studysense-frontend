import { SurveyPage } from '@/features/survey/components/SurveyPage';
import { SurveyTriggerReason } from '@/features/survey/types';

export default async function InitialSurveyPage() {
  // Hardcoded surveyId = 1 for initial survey
  const surveyId = 1;

  return (
    <SurveyPage 
      surveyId={surveyId}
      triggerReason={SurveyTriggerReason.INITIAL}
    />
  );
}

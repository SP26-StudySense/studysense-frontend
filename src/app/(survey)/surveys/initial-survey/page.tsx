import { SurveyPage } from '@/features/survey/components/SurveyPage';
import { SurveyTriggerReason } from '@/features/survey/types';

export default async function InitialSurveyPage() {
  // Hardcoded surveyCode for initial survey
  const surveyCode = 'LEARNING_BEHAVIOR';

  return (
    <SurveyPage 
      surveyCode={surveyCode}
      triggerReason={SurveyTriggerReason.INITIAL}
    />
  );
}

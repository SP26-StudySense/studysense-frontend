import { SurveyPage } from '@/features/survey/components/SurveyPage';
import { SurveyTriggerReason } from '@/features/survey/types';

export default async function SecondSurveyPage() {
  // Hardcoded surveyCode for second survey
  const surveyCode = 'ROADMAP_LEARNING_TARGET';

  return (
    <SurveyPage 
      surveyCode={surveyCode}
      triggerReason={SurveyTriggerReason.INITIAL}
    />
  );
}

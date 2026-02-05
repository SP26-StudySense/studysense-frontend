import { SurveyPage } from '@/features/survey/components/SurveyPage';
import { SurveyTriggerReason } from '@/features/survey/types';
import { SURVEY_CODES } from '@/shared/constants/survey-codes';

export default async function InitialSurveyPage() {
  const surveyCode = SURVEY_CODES.LEARNING_BEHAVIOR;

  return (
    <SurveyPage 
      surveyCode={surveyCode}
      triggerReason={SurveyTriggerReason.INITIAL}
    />
  );
}

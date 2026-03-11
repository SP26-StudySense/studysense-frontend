import { SurveyPage } from '@/features/survey/components/SurveyPage';
import { SurveyTriggerReason } from '@/features/survey/types';
import { SURVEY_CODES } from '@/shared/constants/survey-codes';

export default async function SecondSurveyPage() {
  const surveyCode = SURVEY_CODES.ROADMAP_LEARNING_TARGET;

  return (
    <SurveyPage 
      surveyCode={surveyCode}
      triggerReason={SurveyTriggerReason.INITIAL}
    />
  );
}

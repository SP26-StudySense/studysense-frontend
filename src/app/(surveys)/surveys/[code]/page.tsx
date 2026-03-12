import { SurveyPage } from '@/features/survey/components/SurveyPage';
import { SurveyTriggerReason } from '@/features/survey/types';

interface SurveyCodePageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ returnTo?: string; triggerReason?: string; roadmapId?: string }>;
}

/**
 * Dynamic survey page — used for trigger-based redirects.
 *
 * URL pattern:
 *   /surveys/[code]?triggerReason=TRIGGERED&returnTo=/home
 *
 * Both searchParams are optional:
 *  - triggerReason: defaults to TRIGGERED
 *  - returnTo:      defaults to /home
 */
export default async function SurveyCodePage({ params, searchParams }: SurveyCodePageProps) {
  const { code } = await params;
  const { returnTo = '/home', triggerReason, roadmapId } = await searchParams;

  const resolvedTriggerReason: SurveyTriggerReason =
    Object.values(SurveyTriggerReason).includes(triggerReason as SurveyTriggerReason)
      ? (triggerReason as SurveyTriggerReason)
      : SurveyTriggerReason.RESURVEY;

  return (
    <SurveyPage
      surveyCode={code}
      triggerReason={resolvedTriggerReason}
      returnTo={returnTo}
      roadmapId={roadmapId ? parseInt(roadmapId, 10) : undefined}
    />
  );
}

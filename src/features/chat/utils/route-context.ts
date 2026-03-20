export interface ChatRouteContext {
  studyPlanId: string | null;
  directRoadmapId: number | null;
}

function parseNumber(segment?: string): number | null {
  if (!segment) {
    return null;
  }

  const value = Number(segment);
  return Number.isFinite(value) ? value : null;
}

export function resolveChatRouteContext(pathname: string): ChatRouteContext {
  const studyPlanMatch = pathname.match(/^\/(study-plans|my-roadmap|roadmaps)\/(\d+)/);
  if (studyPlanMatch) {
    return {
      studyPlanId: studyPlanMatch[2],
      directRoadmapId: null,
    };
  }

  const chatRoadmapMatch = pathname.match(/^\/chat\/(\d+)/);
  if (chatRoadmapMatch) {
    return {
      studyPlanId: null,
      directRoadmapId: parseNumber(chatRoadmapMatch[1]),
    };
  }

  return {
    studyPlanId: null,
    directRoadmapId: null,
  };
}

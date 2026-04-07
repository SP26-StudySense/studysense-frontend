import {
  getAllSurveys,
  type SurveyDto,
} from "@/features/analyst/analyst-survey/api";
import {
  getAllSurveyTriggerTypes,
  getAllTriggerMappings,
  type SurveyTriggerMappingDto,
  type SurveyTriggerTypeDto,
} from "@/features/analyst/analyst-triggermapping/api";
import type {
  AnalystDashboardData,
  AnalystRecentMappingItem,
  AnalystTriggerTypeAdoptionRow,
} from "./types";

const PAGE_SIZE = 100;

function calculateCoverage(mappedSurveys: number, totalSurveys: number): number {
  if (totalSurveys <= 0) return 0;
  return Math.round((mappedSurveys / totalSurveys) * 100);
}

function dateToMillis(dateValue: string): number {
  const millis = new Date(dateValue).getTime();
  return Number.isNaN(millis) ? 0 : millis;
}

async function fetchAllSurveys(): Promise<{
  totalCount: number;
  surveys: SurveyDto[];
}> {
  let pageIndex = 1;
  let totalPages = 1;
  let totalCount = 0;
  const surveys: SurveyDto[] = [];

  while (pageIndex <= totalPages) {
    const response = await getAllSurveys({ pageIndex, pageSize: PAGE_SIZE });

    totalPages = Math.max(response.totalPages, 1);
    totalCount = response.totalCount;
    surveys.push(...response.items);

    pageIndex += 1;
  }

  return { totalCount, surveys };
}

async function fetchAllTriggerMappings(): Promise<{
  totalCount: number;
  mappings: SurveyTriggerMappingDto[];
}> {
  let pageIndex = 1;
  let totalPages = 1;
  let totalCount = 0;
  const mappings: SurveyTriggerMappingDto[] = [];

  while (pageIndex <= totalPages) {
    const response = await getAllTriggerMappings({ pageIndex, pageSize: PAGE_SIZE });

    totalPages = Math.max(response.totalPages, 1);
    totalCount = response.totalCount;
    mappings.push(...response.items);

    pageIndex += 1;
  }

  return { totalCount, mappings };
}

function buildTriggerTypeAdoption(
  mappings: SurveyTriggerMappingDto[],
  triggerTypes: SurveyTriggerTypeDto[]
): AnalystTriggerTypeAdoptionRow[] {
  const countByType = new Map<string, number>();

  for (const mapping of mappings) {
    countByType.set(
      mapping.triggerType,
      (countByType.get(mapping.triggerType) ?? 0) + 1
    );
  }

  if (triggerTypes.length === 0) {
    return Array.from(countByType.entries())
      .map(([code, count]) => ({
        code,
        displayName: code,
        isActive: true,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  return triggerTypes
    .map((type) => ({
      code: type.code,
      displayName: type.displayName,
      isActive: type.isActive,
      count: countByType.get(type.code) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function buildRecentMappings(
  mappings: SurveyTriggerMappingDto[],
  surveyMap: Map<number, SurveyDto>
): AnalystRecentMappingItem[] {
  return [...mappings]
    .sort((a, b) => dateToMillis(b.createdAt) - dateToMillis(a.createdAt))
    .slice(0, 6)
    .map((mapping) => {
      const survey = surveyMap.get(mapping.surveyId);

      return {
        id: mapping.id,
        surveyId: mapping.surveyId,
        surveyLabel: survey?.title || survey?.code || `Survey #${mapping.surveyId}`,
        surveyStatus: survey?.status || "Unknown",
        triggerType: mapping.triggerType,
        createdAt: mapping.createdAt,
      };
    });
}

export async function getAnalystDashboardData(): Promise<AnalystDashboardData> {
  const [{ totalCount: totalSurveys, surveys }, { totalCount: totalMappings, mappings }, triggerTypes] =
    await Promise.all([
      fetchAllSurveys(),
      fetchAllTriggerMappings(),
      getAllSurveyTriggerTypes(),
    ]);

  const surveyMap = new Map(surveys.map((survey) => [survey.id, survey]));
  const mappedSurveyIds = new Set(mappings.map((mapping) => mapping.surveyId));

  const publishedCount = surveys.filter((survey) => survey.status === "Published").length;
  const draftCount = surveys.filter((survey) => survey.status === "Draft").length;
  const activeMappings = mappings.filter((mapping) => mapping.isActive).length;
  const mappedSurveys = mappedSurveyIds.size;
  const coverage = calculateCoverage(mappedSurveys, totalSurveys);
  const unmappedSurveys = Math.max(totalSurveys - mappedSurveys, 0);

  return {
    stats: {
      totalSurveys,
      publishedCount,
      draftCount,
      totalMappings,
      activeMappings,
      mappedSurveys,
      coverage,
      unmappedSurveys,
    },
    triggerTypeAdoption: buildTriggerTypeAdoption(mappings, triggerTypes),
    recentMappings: buildRecentMappings(mappings, surveyMap),
  };
}

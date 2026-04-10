'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQueries } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RoadmapCard } from './components/RoadmapCard';
import { SearchFilterBar } from './components/SearchFilterBar';
import { useLearningCategories, useLearningSubjects, useRoadmaps, RoadmapListItemDTO, RoadmapGraphDTO } from './api';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useStudyPlans, StudyPlanItem } from '@/features/study-plan/api';
import { StudyPlanDto, ModuleStatus } from '@/features/study-plan/api/types';
import type { RoadmapFilters, RoadmapTemplate, UserLearningRoadmap } from './types';

// Map API response to RoadmapTemplate format
function mapApiToTemplate(item: RoadmapListItemDTO, nodeCount?: number): RoadmapTemplate {
    return {
        id: String(item.id),
        subjectId: item.subjectId,
        subjectName: item.subjectName ?? undefined,
        title: item.title,
        description: item.description || 'No description available',
        difficulty: 'intermediate', // Default, could be derived from nodes later
        category: 'other', // Default category
        estimatedHours: 20, // No longer displayed
        totalNodes: nodeCount ?? 0,
        icon: 'Map', // Default icon
    };
}

// Map Study Plan Item to UserLearningRoadmap format for "Continue" cards
function mapStudyPlanToLearningRoadmap(
    item: StudyPlanItem,
    moduleStats?: { completedModules: number; totalModules: number }
): UserLearningRoadmap {
    return {
        id: String(item.roadmapId), // Roadmap ID for display
        studyPlanId: String(item.id), // Study Plan ID for navigation
        templateId: String(item.roadmapId),
        subjectName: undefined,
        title: item.roadmapTitle,
        description: item.roadmapDescription || 'No description available',
        difficulty: 'intermediate',
        category: 'other',
        progress:
            moduleStats && moduleStats.totalModules > 0
                ? Math.round((moduleStats.completedModules / moduleStats.totalModules) * 100)
                : 0,
        completedNodes: moduleStats?.completedModules ?? 0,
        totalNodes: moduleStats?.totalModules ?? 0,
        estimatedHours: 0,
        lastAccessed: new Date(item.createdAt),
        timeSpent: 0,
        icon: 'Map',
    };
}

// Hook to fetch node counts for multiple roadmaps
function useRoadmapNodeCounts(roadmapIds: number[]) {
    const queries = useQueries({
        queries: roadmapIds.map((id) => ({
            queryKey: ['roadmaps', 'nodeCount', id],
            queryFn: async () => {
                const data = await get<RoadmapGraphDTO>(endpoints.roadmaps.byId(String(id)), {
                    headers: {
                        'x-skip-auth-redirect': '1',
                    },
                });
                return { id, count: data?.nodes?.length ?? 0 };
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
        })),
    });

    const nodeCounts = useMemo(() => {
        const map = new Map<number, number>();
        queries.forEach((q) => {
            if (q.data) {
                map.set(q.data.id, q.data.count);
            }
        });
        return map;
    }, [queries]);

    return nodeCounts;
}

function useStudyPlanModuleStats(studyPlanIds: number[]) {
    const queries = useQueries({
        queries: studyPlanIds.map((id) => ({
            queryKey: ['studyPlans', 'detail', id],
            queryFn: async () => {
                const data = await get<StudyPlanDto>(endpoints.studyPlans.byId(String(id)));
                const modules = data?.modules ?? [];
                const completedModules = modules.filter((m) => m.status === ModuleStatus.Completed).length;
                return {
                    id,
                    completedModules,
                    totalModules: modules.length,
                };
            },
            staleTime: 5 * 60 * 1000,
        })),
    });

    return useMemo(() => {
        const map = new Map<number, { completedModules: number; totalModules: number }>();
        queries.forEach((q) => {
            if (q.data) {
                map.set(q.data.id, {
                    completedModules: q.data.completedModules,
                    totalModules: q.data.totalModules,
                });
            }
        });
        return map;
    }, [queries]);
}

export function RoadmapsList() {
    const { isAuthenticated } = useAuth();
    const [hasMounted, setHasMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'explore' | 'my-roadmap'>('explore');
    const [exploreFilters, setExploreFilters] = useState<RoadmapFilters>({
        search: '',
        categoryId: undefined,
        subjectId: undefined,
    });
    const [myRoadmapFilters, setMyRoadmapFilters] = useState<RoadmapFilters>({
        search: '',
    });

    // Fetch user's study plans from API
    const { 
        data: studyPlans = [], 
        isLoading: isLoadingStudyPlans, 
        error: studyPlansError 
    } = useStudyPlans(isAuthenticated);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!isAuthenticated && activeTab === 'my-roadmap') {
            setActiveTab('explore');
        }
    }, [isAuthenticated, activeTab]);

    const { data: categoriesResult } = useLearningCategories({
        pageIndex: 1,
        pageSize: 100,
    });

    const { data: subjectsResult, isLoading: isSubjectsLoading } = useLearningSubjects({
        pageIndex: 1,
        pageSize: 100,
        categoryId: exploreFilters.categoryId,
    });

    const categories = useMemo(
        () => categoriesResult?.categories.items.filter((category) => category.isActive) ?? [],
        [categoriesResult]
    );

    const subjects = useMemo(
        () => subjectsResult?.subjects.items.filter((subject) => subject.isActive) ?? [],
        [subjectsResult]
    );

    // Fetch roadmaps from API
    const { data: roadmapsData, isLoading, error } = useRoadmaps({
        pageIndex: 1,
        pageSize: 100,
        q: exploreFilters.search || undefined,
        isLatest: true,
        status: 'Active',
        subjectId: exploreFilters.subjectId,
    });

    // Get roadmap IDs for fetching node counts
    const roadmapIds = useMemo(() => {
        if (!roadmapsData?.roadmaps?.items) return [];
        return roadmapsData.roadmaps.items.map((item) => item.id);
    }, [roadmapsData]);

    // Fetch node counts for all roadmaps
    const nodeCounts = useRoadmapNodeCounts(roadmapIds);

    // Map API data to template format with node counts
    const apiTemplates = useMemo(() => {
        if (!roadmapsData?.roadmaps?.items) return [];
        return roadmapsData.roadmaps.items.map((item) =>
            mapApiToTemplate(item, nodeCounts.get(item.id))
        );
    }, [roadmapsData, nodeCounts]);

    const selectedCategorySubjectIds = useMemo(() => {
        if (!exploreFilters.categoryId) {
            return null;
        }

        return new Set(subjects.map((subject) => subject.id));
    }, [exploreFilters.categoryId, subjects]);

    // Filter templates based on category and subject selection
    const filteredTemplates = useMemo(() => {
        return apiTemplates.filter((roadmap) => {
            if (exploreFilters.subjectId && roadmap.subjectId !== exploreFilters.subjectId) {
                return false;
            }

            if (
                exploreFilters.categoryId &&
                selectedCategorySubjectIds &&
                !selectedCategorySubjectIds.has(roadmap.subjectId)
            ) {
                return false;
            }

            return true;
        });
    }, [apiTemplates, exploreFilters.categoryId, exploreFilters.subjectId, selectedCategorySubjectIds]);

    const studyPlanIds = useMemo(() => studyPlans.map((plan) => plan.id), [studyPlans]);
    const studyPlanModuleStats = useStudyPlanModuleStats(studyPlanIds);

    // Map study plans to learning roadmaps - NO FILTER for My Learning Roadmaps
    const learningRoadmaps = useMemo(
        () =>
            studyPlans.map((plan) =>
                mapStudyPlanToLearningRoadmap(plan, studyPlanModuleStats.get(plan.id))
            ),
        [studyPlans, studyPlanModuleStats]
    );

    const filteredLearningRoadmaps = useMemo(() => {
        const search = myRoadmapFilters.search.trim().toLowerCase();

        return learningRoadmaps.filter((roadmap) => {
            if (search) {
                const haystack = `${roadmap.title} ${roadmap.description}`.toLowerCase();
                if (!haystack.includes(search)) {
                    return false;
                }
            }

            return true;
        });
    }, [learningRoadmaps, myRoadmapFilters]);

    // Create set of roadmap IDs that already have study plans
    const existingRoadmapIds = useMemo(
        () => new Set(studyPlans.map((plan) => plan.roadmapId)),
        [studyPlans]
    );

    // Create map of roadmapId -> studyPlanId for existing plans
    const roadmapToStudyPlanMap = useMemo(
        () => new Map(studyPlans.map((plan) => [plan.roadmapId, plan.id])),
        [studyPlans]
    );

    const activeFilters = activeTab === 'explore' ? exploreFilters : myRoadmapFilters;
    const setActiveFilters = activeTab === 'explore' ? setExploreFilters : setMyRoadmapFilters;
    const hasActiveFilters = Boolean(activeFilters.search || activeFilters.categoryId || activeFilters.subjectId);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Roadmaps
                </h1>
                <p className="text-neutral-600">
                    Explore learning paths and continue your journey
                </p>
            </div>

            {/* Search and Filters */}
            <SearchFilterBar
                filters={activeFilters}
                onFiltersChange={setActiveFilters}
                categories={categories}
                subjects={subjects}
                isSubjectsLoading={isSubjectsLoading}
                showTaxonomyFilters={activeTab === 'explore'}
            />

            {/* Tabs */}
            <div className="border-b border-neutral-200">
                <div className="flex items-center gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('explore')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-colors ${
                            activeTab === 'explore'
                                ? 'bg-[#e9faff] text-[#008fb1] border border-b-0 border-[#bfefff]'
                                : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                        }`}
                    >
                        <span>Explore Roadmaps</span>
                        <span className="inline-flex min-w-6 justify-center rounded-full bg-white/80 px-1.5 py-0.5 text-xs text-neutral-700">
                            {isLoading ? '...' : filteredTemplates.length}
                        </span>
                    </button>

                    {hasMounted && isAuthenticated && (
                        <button
                            onClick={() => setActiveTab('my-roadmap')}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-colors ${
                                activeTab === 'my-roadmap'
                                    ? 'bg-[#f2f0ff] text-[#5c4fba] border border-b-0 border-[#ddd7ff]'
                                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                            }`}
                        >
                            <span>My Roadmaps</span>
                            <span className="inline-flex min-w-6 justify-center rounded-full bg-white/80 px-1.5 py-0.5 text-xs text-neutral-700">
                                {isLoadingStudyPlans ? '...' : filteredLearningRoadmaps.length}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'my-roadmap' ? (
                <section className="space-y-4">
                    {isLoadingStudyPlans ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : studyPlansError ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-neutral-500">Failed to load your roadmaps. Please try again.</p>
                        </div>
                    ) : filteredLearningRoadmaps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredLearningRoadmaps.map((roadmap) => (
                                <RoadmapCard
                                    key={roadmap.id}
                                    roadmap={roadmap}
                                    variant="learning"
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState hasFilters={hasActiveFilters} />
                    )}
                </section>
            ) : (
                <section className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-16">
                            <p className="text-neutral-500">Failed to load roadmaps. Please try again.</p>
                        </div>
                    ) : filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map((roadmap) => (
                                <RoadmapCard
                                    key={roadmap.id}
                                    roadmap={roadmap}
                                    variant="template"
                                    existingRoadmapIds={existingRoadmapIds}
                                    roadmapToStudyPlanMap={roadmapToStudyPlanMap}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState hasFilters={hasActiveFilters} />
                    )}
                </section>
            )}

        </div>
    );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <svg
                    className="w-10 h-10 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {hasFilters ? 'No roadmaps found' : 'No roadmaps available'}
            </h3>
            <p className="text-sm text-neutral-600 text-center max-w-md">
                {hasFilters
                    ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                    : 'Check back later for new learning paths and roadmaps.'}
            </p>
        </div>
    );
}


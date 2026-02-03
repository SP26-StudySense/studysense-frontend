'use client';

import { useState, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { RoadmapCard } from './components/RoadmapCard';
import { SearchFilterBar } from './components/SearchFilterBar';
import { RoadmapPreviewModal } from './components/RoadmapPreviewModal';
import { USER_LEARNING_ROADMAPS, filterRoadmaps } from './mock-data';
import { useRoadmaps, RoadmapListItemDTO, RoadmapGraphDTO } from './api';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { RoadmapFilters, RoadmapTemplate } from './types';

// Map API response to RoadmapTemplate format
function mapApiToTemplate(item: RoadmapListItemDTO, nodeCount?: number): RoadmapTemplate {
    return {
        id: String(item.id),
        title: item.title,
        description: item.description || 'No description available',
        difficulty: 'intermediate', // Default, could be derived from nodes later
        category: 'other', // Default category
        estimatedHours: 20, // No longer displayed
        totalNodes: nodeCount ?? 0,
        icon: 'Map', // Default icon
    };
}

// Hook to fetch node counts for multiple roadmaps
function useRoadmapNodeCounts(roadmapIds: number[]) {
    const queries = useQueries({
        queries: roadmapIds.map((id) => ({
            queryKey: ['roadmaps', 'nodeCount', id],
            queryFn: async () => {
                const data = await get<RoadmapGraphDTO>(endpoints.roadmaps.byId(String(id)));
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

export function RoadmapsList() {
    const [filters, setFilters] = useState<RoadmapFilters>({
        search: '',
        difficulty: 'all',
        category: 'all',
    });

    const [previewRoadmap, setPreviewRoadmap] = useState<RoadmapTemplate | null>(null);

    // Fetch roadmaps from API
    const { data: roadmapsData, isLoading, error } = useRoadmaps({
        pageIndex: 1,
        pageSize: 50,
        q: filters.search || undefined,
        isLatest: true,
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

    // Filter templates based on filters (difficulty and category)
    const filteredTemplates = useMemo(() => {
        return apiTemplates.filter(roadmap => {
            if (filters.difficulty !== 'all' && roadmap.difficulty !== filters.difficulty) {
                return false;
            }
            if (filters.category !== 'all' && roadmap.category !== filters.category) {
                return false;
            }
            return true;
        });
    }, [apiTemplates, filters]);

    // Filter learning roadmaps (still using mock data)
    const filteredLearningRoadmaps = useMemo(
        () => filterRoadmaps(USER_LEARNING_ROADMAPS, filters),
        [filters]
    );

    const hasActiveFilters = Boolean(filters.search || filters.difficulty !== 'all' || filters.category !== 'all');

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
            <SearchFilterBar filters={filters} onFiltersChange={setFilters} />

            {/* My Learning Roadmaps Section */}
            {filteredLearningRoadmaps.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-neutral-900">
                            My Learning Roadmaps
                        </h2>
                        <span className="text-sm text-neutral-500">
                            {filteredLearningRoadmaps.length} active
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLearningRoadmaps.map((roadmap) => (
                            <RoadmapCard
                                key={roadmap.id}
                                roadmap={roadmap}
                                variant="learning"
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Template Roadmaps Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-neutral-900">
                        {hasActiveFilters ? 'Search Results' : 'Explore Templates'}
                    </h2>
                    {!isLoading && (
                        <span className="text-sm text-neutral-500">
                            {filteredTemplates.length} roadmap{filteredTemplates.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-[#00bae2]" />
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
                                onPreview={() => setPreviewRoadmap(roadmap)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState hasFilters={hasActiveFilters} />
                )}
            </section>

            {/* Preview Modal */}
            {previewRoadmap && (
                <RoadmapPreviewModal
                    roadmap={previewRoadmap}
                    isOpen={!!previewRoadmap}
                    onClose={() => setPreviewRoadmap(null)}
                />
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


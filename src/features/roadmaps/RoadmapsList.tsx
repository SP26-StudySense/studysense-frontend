'use client';

import { useState, useMemo } from 'react';
import { RoadmapCard } from './components/RoadmapCard';
import { SearchFilterBar } from './components/SearchFilterBar';
import { RoadmapPreviewModal } from './components/RoadmapPreviewModal';
import { TEMPLATE_ROADMAPS, USER_LEARNING_ROADMAPS, filterRoadmaps } from './mock-data';
import type { RoadmapFilters, RoadmapTemplate } from './types';

export function RoadmapsList() {
    const [filters, setFilters] = useState<RoadmapFilters>({
        search: '',
        difficulty: 'all',
        category: 'all',
    });

    const [previewRoadmap, setPreviewRoadmap] = useState<RoadmapTemplate | null>(null);

    // Filter roadmaps based on current filters
    const filteredTemplates = useMemo(
        () => filterRoadmaps(TEMPLATE_ROADMAPS, filters),
        [filters]
    );

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
                    <span className="text-sm text-neutral-500">
                        {filteredTemplates.length} roadmap{filteredTemplates.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {filteredTemplates.length > 0 ? (
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

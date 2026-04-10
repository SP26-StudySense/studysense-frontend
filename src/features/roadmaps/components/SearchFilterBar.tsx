'use client';

import { Search, X } from 'lucide-react';
import type { RoadmapFilters } from '../types';
import type { LearningCategoryDto, LearningSubjectDto } from '../api';

interface SearchFilterBarProps {
    filters: RoadmapFilters;
    onFiltersChange: (filters: RoadmapFilters) => void;
    categories: LearningCategoryDto[];
    subjects: LearningSubjectDto[];
    isSubjectsLoading?: boolean;
    showTaxonomyFilters?: boolean;
}

export function SearchFilterBar({
    filters,
    onFiltersChange,
    categories,
    subjects,
    isSubjectsLoading,
    showTaxonomyFilters = true,
}: SearchFilterBarProps) {
    const hasActiveFilters = Boolean(filters.search || filters.categoryId || filters.subjectId);

    const handleClearFilters = () => {
        onFiltersChange({
            search: '',
            categoryId: undefined,
            subjectId: undefined,
        });
    };

    const activeCategoryId = filters.categoryId;

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 max-w-md space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Search
                </label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search roadmaps..."
                        value={filters.search}
                        onChange={(e) =>
                            onFiltersChange({ ...filters, search: e.target.value })
                        }
                        className="w-full rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl py-3 pl-11 pr-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                    />
                </div>
            </div>

            {showTaxonomyFilters && (
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Category
                    </label>
                    <div className="relative">
                        <select
                            value={filters.categoryId ?? ''}
                            onChange={(e) =>
                                onFiltersChange({
                                    ...filters,
                                    categoryId: e.target.value ? Number(e.target.value) : undefined,
                                    subjectId: undefined,
                                })
                            }
                            className="appearance-none w-full sm:w-auto rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-5 py-3 pr-10 text-sm font-medium text-neutral-700 outline-none transition-all hover:bg-white focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {showTaxonomyFilters && (
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Subject
                    </label>
                    <div className="relative">
                        <select
                            value={filters.subjectId ?? ''}
                            onChange={(e) =>
                                onFiltersChange({
                                    ...filters,
                                    subjectId: e.target.value ? Number(e.target.value) : undefined,
                                })
                            }
                            disabled={!activeCategoryId || isSubjectsLoading}
                            className="appearance-none w-full sm:w-auto rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-5 py-3 pr-10 text-sm font-medium text-neutral-700 outline-none transition-all hover:bg-white focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 cursor-pointer disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                        >
                            <option value="">
                                {!activeCategoryId ? 'Select category first' : 'All Subjects'}
                            </option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-transparent select-none">
                        Actions
                    </label>
                    <button
                        onClick={handleClearFilters}
                        className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 px-5 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-white"
                    >
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                </div>
            )}
        </div>
    );
}

'use client';

import { Search, Filter, X } from 'lucide-react';
import { RoadmapDifficulty, RoadmapCategory, RoadmapFilters } from '../types';

interface SearchFilterBarProps {
    filters: RoadmapFilters;
    onFiltersChange: (filters: RoadmapFilters) => void;
}

const difficultyOptions: { value: RoadmapDifficulty | 'all'; label: string }[] = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
];

const categoryOptions: { value: RoadmapCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'devops', label: 'DevOps' },
    { value: 'ai-data', label: 'AI & Data' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'other', label: 'Other' },
];

export function SearchFilterBar({ filters, onFiltersChange }: SearchFilterBarProps) {
    const hasActiveFilters = filters.search || filters.difficulty !== 'all' || filters.category !== 'all';

    const handleClearFilters = () => {
        onFiltersChange({
            search: '',
            difficulty: 'all',
            category: 'all',
        });
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Search roadmaps..."
                    value={filters.search}
                    onChange={(e) =>
                        onFiltersChange({ ...filters, search: e.target.value })
                    }
                    className="w-full rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                />
            </div>

            {/* Difficulty Filter */}
            <div className="relative">
                <select
                    value={filters.difficulty}
                    onChange={(e) =>
                        onFiltersChange({
                            ...filters,
                            difficulty: e.target.value as RoadmapDifficulty | 'all',
                        })
                    }
                    className="appearance-none w-full sm:w-auto rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-5 py-3 pr-10 text-sm font-medium text-neutral-700 outline-none transition-all hover:bg-white focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 cursor-pointer"
                >
                    {difficultyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <Filter className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
                <select
                    value={filters.category}
                    onChange={(e) =>
                        onFiltersChange({
                            ...filters,
                            category: e.target.value as RoadmapCategory | 'all',
                        })
                    }
                    className="appearance-none w-full sm:w-auto rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-5 py-3 pr-10 text-sm font-medium text-neutral-700 outline-none transition-all hover:bg-white focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 cursor-pointer"
                >
                    {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <Filter className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <button
                    onClick={handleClearFilters}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-white hover:border-neutral-300 transition-all"
                >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear</span>
                </button>
            )}
        </div>
    );
}

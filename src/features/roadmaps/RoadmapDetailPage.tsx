'use client';

import { Search, Filter, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RoadmapPreviewGraph } from './components/RoadmapPreviewGraph';
import { useStudyPlan } from '@/features/study-plan/api';

export interface RoadmapDetailPageProps {
    studyPlanId: number;
}

export function RoadmapDetailPage({ studyPlanId }: RoadmapDetailPageProps) {
    const router = useRouter();

    // Fetch study plan to get roadmapId
    const { data: studyPlan, isLoading: isLoadingStudyPlan, error: studyPlanError } = useStudyPlan(
        studyPlanId.toString()
    );

    // Loading state
    if (isLoadingStudyPlan) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-160px)]">
                <Loader2 className="h-8 w-8 animate-spin text-[#00bae2]" />
            </div>
        );
    }

    // Error state
    if (studyPlanError) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] gap-4">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                        Failed to load study plan
                    </h2>
                    <p className="text-neutral-600 mb-4">
                        {studyPlanError?.toString()}
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 rounded-xl bg-[#00bae2] text-white font-medium hover:bg-[#00a5c9] transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // No data state
    if (!studyPlan || !studyPlan.roadmapId) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] gap-4">
                <h2 className="text-xl font-semibold text-neutral-900">No roadmap data found</h2>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 rounded-xl bg-[#00bae2] text-white font-medium hover:bg-[#00a5c9] transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-160px)]">
            {/* Left - Graph */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Search & Filter Bar */}
                <div className="flex items-center gap-3 lg:gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search topics..."
                            className="w-full rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                        />
                    </div>
                    <button className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition-all">
                        <Filter className="h-4 w-4" />
                        Filters
                    </button>
                </div>

                {/* Graph Container */}
                <div className="flex-1 min-h-0 rounded-2xl border border-neutral-200 bg-white/50 backdrop-blur-xl overflow-hidden">
                    <RoadmapPreviewGraph
                        roadmapId={studyPlan.roadmapId}
                        className="h-full"
                    />
                </div>
            </div>
        </div>
    );
}

'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useRoadmapGraph } from './api';
import { RoadmapPreviewGraph } from './components/RoadmapPreviewGraph';
import { useStudyPlan } from '@/features/study-plan/api';

export interface RoadmapDetailPageProps {
    studyPlanId?: number;
    roadmapId?: number;
}

export function RoadmapDetailPage({ studyPlanId, roadmapId }: RoadmapDetailPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const shouldDisableContentLinks = pathname?.startsWith('/roadmaps/') ?? false;
    const isStudyPlanMode = typeof studyPlanId === 'number' && !Number.isNaN(studyPlanId);

    // Fetch study plan to get roadmapId
    const {
        data: studyPlan,
        isLoading: isLoadingStudyPlan,
        error: studyPlanError,
    } = useStudyPlan(isStudyPlanMode ? studyPlanId.toString() : undefined, {
        enabled: isStudyPlanMode,
    });

    const resolvedRoadmapId = roadmapId ?? studyPlan?.roadmapId;
    const { data: roadmapGraph } = useRoadmapGraph(shouldDisableContentLinks ? resolvedRoadmapId ?? null : null);
    const roadmapTitle = roadmapGraph?.roadmap?.title ?? studyPlan?.roadmapName ?? 'Detail';

    // Update document title with roadmap name
    useEffect(() => {
        if (isStudyPlanMode && studyPlan?.roadmapName) {
            document.title = `${studyPlan.roadmapName} - My Roadmap | StudySense`;
        }
        return () => {
            document.title = 'My Roadmap | StudySense';
        };
    }, [isStudyPlanMode, studyPlan?.roadmapName]);

    // Loading state
    if (isStudyPlanMode && isLoadingStudyPlan) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-160px)]">
                <Loader2 className="h-8 w-8 animate-spin text-[#00bae2]" />
            </div>
        );
    }

    // Error state
    if (isStudyPlanMode && studyPlanError) {
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
    if (!resolvedRoadmapId) {
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
        <div className="space-y-3">
            {shouldDisableContentLinks ? (
                <div className="mx-auto flex w-full items-center justify-between gap-3 px-1">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-1 py-1 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
                        <button
                            onClick={() => router.push('/roadmaps')}
                            className="font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                        >
                            Roadmaps
                        </button>
                        <span>/</span>
                        <span className="font-medium text-neutral-700">{roadmapTitle}</span>
                    </div>
                </div>
            ) : null}

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-200px)]">
            {/* Left - Graph */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Graph Container */}
                <div className="flex-1 min-h-0 rounded-2xl border border-neutral-200 bg-white/50 backdrop-blur-xl overflow-hidden">
                    <RoadmapPreviewGraph
                        roadmapId={resolvedRoadmapId}
                        disableContentLinks={shouldDisableContentLinks}
                        className="h-full"
                    />
                </div>
            </div>
            </div>
        </div>
    );
}

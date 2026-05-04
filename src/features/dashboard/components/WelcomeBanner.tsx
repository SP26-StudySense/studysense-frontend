'use client';

import { Button } from "@/components/ui/button";
import { Play, Loader2, Briefcase, Gauge, CalendarClock, Sparkles } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useStudyPlan } from '@/features/study-plan/api/queries';
import { useLearningTargetByRoadmap } from '@/features/dashboard/api/queries';

interface WelcomeBannerProps {
    studyPlanId?: string;
}

export const WelcomeBanner = ({ studyPlanId }: WelcomeBannerProps) => {
    const router = useRouter();
    const { data: studyPlan, isLoading } = useStudyPlan(studyPlanId, {
        enabled: !!studyPlanId,
    });
    const roadmapId = studyPlan?.roadmapId ? String(studyPlan.roadmapId) : undefined;
    const { data: learningTarget, isLoading: isLearningTargetLoading } = useLearningTargetByRoadmap(roadmapId, {
        enabled: !!roadmapId,
    });

    const handleContinueStudying = () => {
        if (studyPlanId) {
            router.push(`/study-plans/${studyPlanId}`);
        }
    };

    return (
        <div className="flex flex-col gap-6 py-2 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold text-neutral-900">
                    Welcome!
                </h2>
                {isLoading && studyPlanId ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                        <p className="text-neutral-500">Loading...</p>
                    </div>
                ) : studyPlan?.roadmapName ? (
                    <p className="text-neutral-500">
                        You are progressing on <span className="font-semibold text-[#00bae2]">{studyPlan.roadmapName}</span>
                    </p>
                ) : (
                    <p className="text-neutral-500">
                        Let&apos;s keep your learning momentum today.
                    </p>
                )}

                {isLearningTargetLoading && roadmapId ? (
                    <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                        Loading learning target...
                    </div>
                ) : learningTarget ? (
                    <div className="mt-5 rounded-2xl border border-cyan-200/70 bg-gradient-to-br from-cyan-50 via-white to-sky-50 p-4 shadow-sm shadow-cyan-100/70">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-white">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <p className="text-sm font-semibold text-neutral-900">Your Learning Target</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-cyan-100 bg-white/90 p-3">
                                <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
                                    <Briefcase className="h-3.5 w-3.5 text-cyan-600" />
                                    Target Role
                                </div>
                                <p className="text-base font-bold text-neutral-900">{learningTarget.targetRole}</p>
                            </div>

                            <div className="rounded-xl border border-cyan-100 bg-white/90 p-3">
                                <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
                                    <Gauge className="h-3.5 w-3.5 text-cyan-600" />
                                    Current Level
                                </div>
                                <p className="text-base font-bold text-neutral-900">{learningTarget.currentLevel}</p>
                            </div>

                            <div className="rounded-xl border border-cyan-100 bg-white/90 p-3">
                                <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
                                    <CalendarClock className="h-3.5 w-3.5 text-cyan-600" />
                                    Target Deadline
                                </div>
                                <p className="text-base font-bold text-neutral-900">{learningTarget.targetDeadlineMonths} months</p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            <Button
                onClick={handleContinueStudying}
                disabled={!studyPlanId}
                className="group w-full rounded-full bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-8 py-6 text-sm font-bold text-neutral-900 shadow-lg shadow-[#00bae2]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#00bae2]/30 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
            >
                <Play className="mr-2 h-4 w-4 fill-current" />
                Continue Studying
            </Button>
        </div>
    );
};

'use client';

import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useStudyPlan } from '@/features/study-plan/api/queries';

interface WelcomeBannerProps {
    studyPlanId?: string;
}

export const WelcomeBanner = ({ studyPlanId }: WelcomeBannerProps) => {
    const router = useRouter();
    const { data: studyPlan, isLoading } = useStudyPlan(studyPlanId, {
        enabled: !!studyPlanId,
    });

    const handleContinueStudying = () => {
        if (studyPlanId) {
            router.push(`/study-plans/${studyPlanId}`);
        }
    };

    return (
        <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold text-neutral-900">
                    Welcome back!
                </h2>
                {isLoading && studyPlanId ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                        <p className="text-neutral-500">Loading...</p>
                    </div>
                ) : studyPlan?.roadmapName ? (
                    <p className="text-neutral-500">
                        Continue your journey with <span className="font-semibold text-[#00bae2]">{studyPlan.roadmapName}</span>
                    </p>
                ) : (
                    <p className="text-neutral-500">
                        Ready to continue your learning journey?
                    </p>
                )}
            </div>

            <Button
                onClick={handleContinueStudying}
                disabled={!studyPlanId}
                className="group rounded-full bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-8 py-6 text-sm font-bold text-neutral-900 shadow-lg shadow-[#00bae2]/20 hover:shadow-xl hover:shadow-[#00bae2]/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Play className="mr-2 h-4 w-4 fill-current" />
                Continue Studying
            </Button>
        </div>
    );
};

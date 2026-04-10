'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, Home, Map } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { useSessionStore, useActiveStudyPlanId } from '@/store/session.store';

interface SessionSuccessScreenProps {
    isOpen: boolean;
    className?: string;
}

function formatDuration(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function SessionSuccessScreen({ isOpen, className }: SessionSuccessScreenProps) {
    const router = useRouter();
    const resetSessionFlow = useSessionStore((state) => state.resetSessionFlow);
    const summaryData = useSessionStore((state) => state.summaryData);
    const activeStudyPlanId = useActiveStudyPlanId();
    const [autoRedirectSeconds, setAutoRedirectSeconds] = useState(10);
    const hasAutoRedirectedRef = useRef(false);
    const canRender = isOpen;

    const handleBackToDashboard = useCallback(() => {
        resetSessionFlow();
        const dashboardPath = activeStudyPlanId ? `/dashboard/${activeStudyPlanId}` : '/dashboard';
        router.push(dashboardPath);
    }, [activeStudyPlanId, resetSessionFlow, router]);

    const handleBackToStudyPlan = useCallback(() => {
        resetSessionFlow();
        const studyPlanPath = activeStudyPlanId ? `/study-plans/${activeStudyPlanId}` : '/study-plans';
        router.push(studyPlanPath);
    }, [activeStudyPlanId, resetSessionFlow, router]);

    const handleViewRoadmap = () => {
        resetSessionFlow();
        router.push('/roadmaps');
    };

    useEffect(() => {
        if (!canRender) {
            hasAutoRedirectedRef.current = false;
            return;
        }

        setAutoRedirectSeconds(10);
        hasAutoRedirectedRef.current = false;

        const intervalId = window.setInterval(() => {
            setAutoRedirectSeconds((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [canRender]);

    useEffect(() => {
        if (!canRender) {
            return;
        }

        if (autoRedirectSeconds === 0 && !hasAutoRedirectedRef.current) {
            hasAutoRedirectedRef.current = true;
            handleBackToDashboard();
        }
    }, [autoRedirectSeconds, canRender, handleBackToDashboard]);

    if (!canRender) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-emerald-50/50 to-white",
            className
        )}>
            {/* Content */}
            <div className="flex flex-col items-center text-center px-8">
                {/* Icon */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 mb-6">
                    <Sparkles className="h-10 w-10 text-emerald-600" />
                </div>

                {/* Text */}
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Great work!</h1>
                <p className="text-neutral-500 mb-4">
                    Your session has been saved. Keep up the momentum!
                </p>
                <p className="text-xs text-neutral-500 mb-6">
                    Redirecting to dashboard in {autoRedirectSeconds}s
                </p>

                {/* Real stats from API */}
                {summaryData && (
                    <div className="flex items-center gap-6 mb-8 p-4 rounded-2xl bg-white/80 border border-neutral-100 shadow-sm">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-neutral-900">{formatDuration(summaryData.timeStudiedSeconds)}</p>
                            <p className="text-xs text-neutral-500">mm:ss</p>
                        </div>
                        <div className="h-8 w-px bg-neutral-200" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-neutral-900">{summaryData.tasksCompleted}/{summaryData.totalTasks}</p>
                            <p className="text-xs text-neutral-500">tasks</p>
                        </div>
                        <div className="h-8 w-px bg-neutral-200" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-amber-600">+{summaryData.xpEarned}</p>
                            <p className="text-xs text-neutral-500">XP earned</p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBackToStudyPlan}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
                    >
                        <Home className="h-5 w-5" />
                        Back to Study Plan
                    </button>
                    <button
                        onClick={handleViewRoadmap}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 font-semibold shadow-sm hover:bg-neutral-50 hover:scale-[1.02] transition-all"
                    >
                        <Map className="h-5 w-5" />
                        View Roadmap
                    </button>
                </div>
            </div>
        </div>
    );
}

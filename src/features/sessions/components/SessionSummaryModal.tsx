import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, Sparkles, Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSessionStore } from '@/store/session.store';
import { useEndSession } from '../api/mutations';
import { SessionEndedReason } from '@/shared/types';
import { toast } from '@/shared/lib';
import { queryKeys } from '@/shared/api/query-keys';

interface SessionSummaryModalProps {
    isOpen: boolean;
    className?: string;
}

const AUTO_CONTINUE_SECONDS = 30;

function formatDuration(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function SessionSummaryModal({ isOpen, className }: SessionSummaryModalProps) {
    const queryClient = useQueryClient();
    const summaryData = useSessionStore((state) => state.summaryData);
    const setSummaryData = useSessionStore((state) => state.setSummaryData);
    const sessionId = useSessionStore((state) => state.sessionId);
    const activeStudyPlanId = useSessionStore((state) => state.activeStudyPlanId);
    const selectedTasks = useSessionStore((state) => state.selectedTasks);
    const elapsedSeconds = useSessionStore((state) => state.elapsedSeconds);
    const completeSession = useSessionStore((state) => state.completeSession);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [autoContinueSeconds, setAutoContinueSeconds] = useState(AUTO_CONTINUE_SECONDS);
    const hasAutoSubmittedRef = useRef(false);
    const hasSubmittedRef = useRef(false);
    const submitSessionRef = useRef<() => void>(() => {
        // no-op until initialized in render
    });

    const endMutation = useEndSession();
    const isSubmitting = endMutation.isPending;
    const canRender = isOpen && !!summaryData;

    const handleStarClick = (rating: number) => {
        if (!summaryData) return;
        setSummaryData({ ...summaryData, rating });
    };

    submitSessionRef.current = () => {
        if (!summaryData) return;
        if (!sessionId) return;
        if (hasSubmittedRef.current) return;
        if (isSubmitting) return;
        if (!summaryData.rating || summaryData.rating < 1) {
            toast.warning('Please rate your session before continuing.');
            return;
        }

        hasSubmittedRef.current = true;

        const tasksPayload = selectedTasks
            .map((task) => {
                const taskId = Number(task.id);

                if (!Number.isFinite(taskId) || taskId <= 0) {
                    return null;
                }

                return {
                    taskId,
                    startTime: task.startedAt || null,
                    endTime: task.isCompleted ? task.completedAt || new Date().toISOString() : null,
                };
            })
            .filter((task): task is { taskId: number; startTime: string | null; endTime: string | null } => task !== null);

        endMutation.mutate(
            {
                id: sessionId,
                request: {
                    endedReason: SessionEndedReason.COMPLETED,
                    selfRating: summaryData.rating || undefined,
                    actualDurationSeconds: elapsedSeconds,
                    tasks: tasksPayload,
                },
            },
            {
                onSuccess: async (data) => {
                    const numericPlanId = Number(activeStudyPlanId);
                    const resolvedPlanId = Number.isFinite(numericPlanId) && numericPlanId > 0
                        ? numericPlanId
                        : undefined;

                    // Prevent stale "active session" data from restoring a just-ended session.
                    await Promise.allSettled([
                        queryClient.cancelQueries({ queryKey: queryKeys.studySessions.active() }),
                        resolvedPlanId
                            ? queryClient.cancelQueries({ queryKey: queryKeys.studySessions.active(resolvedPlanId) })
                            : Promise.resolve(),
                    ]);

                    queryClient.setQueriesData(
                        { queryKey: queryKeys.studySessions.active() },
                        () => null
                    );

                    completeSession(data);

                    // Don't block UX transition on cache work; refresh in background.
                    void Promise.allSettled([
                        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
                        queryClient.invalidateQueries({ queryKey: ['studyPlans'] }),
                        queryClient.invalidateQueries({ queryKey: queryKeys.studySessions.all }),
                    ]);
                },
                onError: (error) => {
                    hasSubmittedRef.current = false;
                    toast.apiError(error, 'Failed to end session');
                },
            }
        );
    };

    const handleSaveAndContinue = () => {
        submitSessionRef.current();
    };

    useEffect(() => {
        if (!canRender) {
            hasAutoSubmittedRef.current = false;
            hasSubmittedRef.current = false;
            return;
        }

        setAutoContinueSeconds(AUTO_CONTINUE_SECONDS);
        hasAutoSubmittedRef.current = false;
        hasSubmittedRef.current = false;

        const intervalId = window.setInterval(() => {
            setAutoContinueSeconds((prev) => {
                if (prev <= 1) {
                    window.clearInterval(intervalId);

                    if (!hasAutoSubmittedRef.current) {
                        hasAutoSubmittedRef.current = true;
                        submitSessionRef.current();
                    }

                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [canRender]);

    if (!canRender || !summaryData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            {/* Modal */}
            <div className={cn(
                "relative w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto overflow-x-hidden bg-gradient-to-b from-emerald-50/95 to-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-900/20",
                isSubmitting && 'pointer-events-none',
                className
            )}>
                {isSubmitting && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur-[2px]">
                        <div className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-md">
                            Saving session...
                        </div>
                    </div>
                )}
                {/* Header */}
                <div className="flex flex-col items-center pt-10 pb-6 px-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/40 mb-4">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-1">Session Complete!</h2>
                    <p className="text-neutral-500">Here&apos;s a summary of your study session</p>
                </div>

                {/* Stats Grid */}
                <div className="px-8 pb-6">
                    <div className="grid grid-cols-3 gap-4">
                        {/* Time Studied */}
                        <div className="flex flex-col items-center p-5 rounded-2xl bg-white/80 border border-neutral-100 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
                                <Clock className="h-5 w-5" />
                            </div>
                            <span className="text-2xl font-bold text-neutral-900">{formatDuration(summaryData.timeStudiedSeconds)}</span>
                            <span className="text-xs text-neutral-500">mm:ss</span>
                            <span className="text-[10px] text-neutral-400 mt-0.5">Time Studied</span>
                        </div>

                        {/* Tasks Completed */}
                        <div className="flex flex-col items-center p-5 rounded-2xl bg-white/80 border border-neutral-100 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <span className="text-2xl font-bold text-neutral-900">{summaryData.tasksCompleted}</span>
                            <span className="text-xs text-neutral-500">of {summaryData.totalTasks}</span>
                            <span className="text-[10px] text-neutral-400 mt-0.5">Tasks Completed</span>
                        </div>

                        {/* XP Earned */}
                        <div className="flex flex-col items-center p-5 rounded-2xl bg-white/80 border border-neutral-100 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 mb-3">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <span className="text-2xl font-bold text-neutral-900">+{summaryData.xpEarned}</span>
                            <span className="text-xs text-neutral-500">XP</span>
                            <span className="text-[10px] text-neutral-400 mt-0.5">XP Earned</span>
                        </div>
                    </div>
                </div>

                {/* Rating Section */}
                <div className="mx-8 mb-6 p-5 rounded-2xl bg-white/80 border border-neutral-100 shadow-sm">
                    <h3 className="font-semibold text-neutral-900 mb-1">How was your session?</h3>
                    <p className="text-sm text-neutral-500 mb-4">Rate your focus and productivity</p>

                    <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => handleStarClick(star)}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                disabled={isSubmitting}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <Star
                                    className={cn(
                                        "h-8 w-8 transition-colors",
                                        (hoveredStar >= star || summaryData.rating >= star)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-neutral-300"
                                    )}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between text-xs text-neutral-400 mt-2 px-2">
                        <span>Struggled</span>
                        <span>Great focus!</span>
                    </div>
                </div>

                {/* Save Button */}
                <div className="px-8 pb-8">
                    <p className="mb-3 text-center text-xs text-neutral-500">
                        Auto continue in {autoContinueSeconds}s
                    </p>
                    <button
                        type="button"
                        onClick={handleSaveAndContinue}
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Save & Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}

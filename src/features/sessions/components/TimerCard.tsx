'use client';

import { useEffect, useCallback, useState } from 'react';
import { Play, Pause, Square, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSessionStore } from '@/store/session.store';
import { useStartSession, usePauseSession, useResumeSession } from '../api/mutations';
import { SessionStatus } from '@/shared/types';
import { toast } from '@/shared/lib';
import { ApiException } from '@/shared/api/errors';
import { useAnalytics } from '@/shared/hooks/use-analytics';

interface TimerCardProps {
    className?: string;
}

export function TimerCard({ className }: TimerCardProps) {
    const timerRunning = useSessionStore((state) => state.timerRunning);
    const elapsedSeconds = useSessionStore((state) => state.elapsedSeconds);
    const sessionId = useSessionStore((state) => state.sessionId);
    const sessionStatus = useSessionStore((state) => state.sessionStatus);
    const incrementElapsed = useSessionStore((state) => state.incrementElapsed);
    const incrementPauseSeconds = useSessionStore((state) => state.incrementPauseSeconds);
    const selectedNode = useSessionStore((state) => state.selectedNode);
    const activeStudyPlanId = useSessionStore((state) => state.activeStudyPlanId);
    const selectedTasks = useSessionStore((state) => state.selectedTasks);

    // Store actions
    const storeStartSession = useSessionStore((state) => state.startSession);
    const storePauseSession = useSessionStore((state) => state.pauseSession);
    const storeResumeSession = useSessionStore((state) => state.resumeSession);
    const storeEndSession = useSessionStore((state) => state.endSession);

    // API mutations
    const startMutation = useStartSession();
    const pauseMutation = usePauseSession();
    const resumeMutation = useResumeSession();

    // Analytics
    const { trackClick, trackInteraction } = useAnalytics();

    // Error state for start session
    const [startError, setStartError] = useState<string | null>(null);

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const hasStarted = sessionStatus !== SessionStatus.NOT_STARTED;

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (timerRunning) {
            interval = setInterval(() => {
                incrementElapsed();
            }, 1000);
        } else if (hasStarted) {
            interval = setInterval(() => {
                incrementPauseSeconds();
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timerRunning, incrementElapsed, incrementPauseSeconds]);

    /** Safely convert a string ID to number, returning undefined if not a valid integer */
    const safeNumberId = (value: string | undefined | null): number | undefined => {
        if (!value) return undefined;
        const num = Number(value);
        return Number.isFinite(num) && num > 0 ? num : undefined;
    };

    const doStartSession = useCallback(() => {
        setStartError(null);
        const taskIds = selectedTasks
            .map((task) => safeNumberId(task.id))
            .filter((id): id is number => typeof id === 'number');

        const plannedDurationSeconds = selectedTasks.reduce((total, task) => {
            const taskMinutes = Number.isFinite(task.estimatedMinutes) ? task.estimatedMinutes : 0;
            return total + Math.max(0, taskMinutes) * 60;
        }, 0);

        const resolvedStudyPlanId = safeNumberId(activeStudyPlanId) ?? safeNumberId(selectedNode?.planId);
        const resolvedModuleId = safeNumberId(selectedNode?.id);

        const payload = {
            studyPlanId: resolvedStudyPlanId,
            nodeId: selectedNode?.roadmapNodeId ?? safeNumberId(selectedNode?.id),
            moduleId: resolvedModuleId,
            taskIds: taskIds.length > 0 ? taskIds : undefined,
            plannedDurationSeconds: plannedDurationSeconds > 0 ? plannedDurationSeconds : undefined,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        console.log('🚀 [StartSession] Raw values:', {
            activeStudyPlanId,
            'selectedNode?.id': selectedNode?.id,
            'selectedNode?.roadmapNodeId': selectedNode?.roadmapNodeId,
            selectedNode,
        });
        console.log('🚀 [StartSession] Payload:', JSON.stringify(payload, null, 2));

        startMutation.mutate(
            payload,
            {
                onSuccess: (data) => {
                    storeStartSession(data.sessionId, data.tasks);
                    trackInteraction('session_started', {
                        sessionId: data.sessionId,
                        nodeId: payload.nodeId,
                        studyPlanId: payload.studyPlanId,
                        moduleId: payload.moduleId,
                        taskCount: selectedTasks.length,
                    });
                    toast.success('Session started!');
                },
                onError: (error) => {
                    const message = error instanceof ApiException
                        ? error.message
                        : error.message || 'Failed to start session';

                    // Check if error is about an existing active session
                    const isActiveSessionError = message.toLowerCase().includes('active')
                        || message.toLowerCase().includes('already')
                        || (error instanceof ApiException && error.status === 409);

                    if (isActiveSessionError) {
                        setStartError('You already have an active session. Please end it before starting a new one.');
                    } else {
                        setStartError(message);
                    }
                    toast.apiError(error, 'Failed to start session');
                },
            }
        );
    }, [startMutation, activeStudyPlanId, selectedNode, selectedTasks, storeStartSession]);

    const handleStart = useCallback(async () => {
        setStartError(null);
        // Start session directly — if backend returns error about active session, we handle it in onError
        doStartSession();
    }, [doStartSession]);

    const handlePause = useCallback(() => {
        if (!sessionId) return;
        trackClick('pause_session', { sessionId, elapsedSeconds });
        pauseMutation.mutate(sessionId, {
            onSuccess: (data) => {
                storePauseSession();
                useSessionStore.getState().setPauseData(data.pauseCount, data.pauseSeconds);
            },
        });
    }, [sessionId, pauseMutation, storePauseSession, trackClick, elapsedSeconds]);

    const handleResume = useCallback(() => {
        if (!sessionId) return;
        trackClick('resume_session', { sessionId, elapsedSeconds });
        resumeMutation.mutate(sessionId, {
            onSuccess: () => {
                storeResumeSession();
            },
        });
    }, [sessionId, resumeMutation, storeResumeSession, trackClick, elapsedSeconds]);

    const handleEndSession = useCallback(() => {
        trackInteraction('session_ended', {
            sessionId,
            totalSeconds: elapsedSeconds,
            taskCount: selectedTasks.length,
        });
        storeEndSession();
    }, [storeEndSession, trackInteraction, sessionId, elapsedSeconds, selectedTasks.length]);

    const isAnyPending = startMutation.isPending || pauseMutation.isPending || resumeMutation.isPending;

    return (
        <div className={cn(
            "relative overflow-hidden flex flex-col items-center justify-center rounded-3xl bg-white/70 backdrop-blur-xl border border-neutral-200/60 p-12 shadow-xl shadow-neutral-900/5",
            className
        )}>
            {/* Decorative gradient */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-[#00bae2]/20 to-[#fec5fb]/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-tr from-[#fec5fb]/20 to-[#00bae2]/10 blur-2xl" />

            {/* Timer Display */}
            <div className="relative text-8xl font-bold tracking-tighter text-neutral-900 font-mono bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text">
                {formatTime(elapsedSeconds)}
            </div>

            {/* Status */}
            <p className={cn(
                "mt-3 text-sm font-medium",
                timerRunning ? "text-emerald-600" : hasStarted ? "text-amber-600" : startError ? "text-red-500" : "text-neutral-500"
            )}>
                {timerRunning ? '● Session in progress' : hasStarted ? '● Paused' : 'Ready to start'}
            </p>

            {/* Error message */}
            {startError && !hasStarted && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 max-w-md">
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{startError}</p>
                </div>
            )}

            {/* Controls */}
            <div className="relative mt-8 flex items-center gap-3">
                {!hasStarted ? (
                    <button
                        onClick={handleStart}
                        disabled={isAnyPending}
                        className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" />
                        {startMutation.isPending ? 'Starting...' : 'Start Session'}
                    </button>
                ) : (
                    <>
                        {timerRunning ? (
                            <button
                                onClick={handlePause}
                                disabled={isAnyPending}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50"
                            >
                                <Pause className="h-5 w-5" fill="currentColor" />
                                {pauseMutation.isPending ? 'Pausing...' : 'Pause'}
                            </button>
                        ) : (
                            <button
                                onClick={handleResume}
                                disabled={isAnyPending}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/40 hover:scale-105 transition-all duration-300 disabled:opacity-50"
                            >
                                <Play className="h-5 w-5" fill="currentColor" />
                                {resumeMutation.isPending ? 'Resuming...' : 'Resume'}
                            </button>
                        )}
                        <button
                            onClick={handleEndSession}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 hover:scale-105 transition-all duration-300"
                        >
                            <Square className="h-4 w-4" fill="currentColor" />
                            End Session
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

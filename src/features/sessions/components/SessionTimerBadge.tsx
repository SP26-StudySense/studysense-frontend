'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Clock, Pause, Play, Square } from 'lucide-react';
import { cn, toast } from '@/shared/lib';
import { useSessionStore } from '@/store/session.store';
import { SessionEndedReason, SessionStatus } from '@/shared/types';
import { usePauseSession, useResumeSession, useEndSession } from '../api/mutations';

export function SessionTimerBadge() {
    const pathname = usePathname();
    const router = useRouter();

    const sessionId = useSessionStore((state) => state.sessionId);
    const sessionStatus = useSessionStore((state) => state.sessionStatus);
    const elapsedSeconds = useSessionStore((state) => state.elapsedSeconds);
    const timerRunning = useSessionStore((state) => state.timerRunning);
    const incrementElapsed = useSessionStore((state) => state.incrementElapsed);
    const incrementPauseSeconds = useSessionStore((state) => state.incrementPauseSeconds);
    const setPauseData = useSessionStore((state) => state.setPauseData);
    const storePauseSession = useSessionStore((state) => state.pauseSession);
    const storeResumeSession = useSessionStore((state) => state.resumeSession);
    const resetSessionFlow = useSessionStore((state) => state.resetSessionFlow);

    const pauseMutation = usePauseSession();
    const resumeMutation = useResumeSession();
    const endMutation = useEndSession();

    const [isHovered, setIsHovered] = useState(false);

    const hasActiveSession = !!sessionId && sessionStatus !== SessionStatus.NOT_STARTED;
    const isOnSessionsPage = pathname.startsWith('/sessions');

    useEffect(() => {
        if (!hasActiveSession || isOnSessionsPage) return;

        let interval: NodeJS.Timeout | null = null;

        if (timerRunning) {
            interval = setInterval(() => {
                incrementElapsed();
            }, 1000);
        } else {
            interval = setInterval(() => {
                incrementPauseSeconds();
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [
        hasActiveSession,
        incrementElapsed,
        incrementPauseSeconds,
        isOnSessionsPage,
        timerRunning,
    ]);

    if (!hasActiveSession || isOnSessionsPage) return null;

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleBackToSession = () => {
        router.push('/sessions');
    };

    const handleTogglePause = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!sessionId) return;

        if (timerRunning) {
            pauseMutation.mutate(sessionId, {
                onSuccess: (data) => {
                    storePauseSession();
                    setPauseData(data.pauseCount, data.pauseSeconds);
                    toast.success('Session paused');
                },
                onError: (error) => {
                    toast.apiError(error, 'Failed to pause session');
                },
            });
            return;
        }

        resumeMutation.mutate(sessionId, {
            onSuccess: () => {
                storeResumeSession();
                toast.success('Session resumed');
            },
            onError: (error) => {
                toast.apiError(error, 'Failed to resume session');
            },
        });
    };

    const handleEndSession = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!sessionId) return;

        endMutation.mutate(
            {
                id: sessionId,
                request: {
                    endedReason: SessionEndedReason.CANCELLED,
                    actualDurationSeconds: elapsedSeconds,
                },
            },
            {
                onSuccess: () => {
                    resetSessionFlow();
                    toast.success('Session ended');
                },
                onError: (error) => {
                    toast.apiError(error, 'Failed to end session');
                },
            }
        );
    };

    const isBusy = pauseMutation.isPending || resumeMutation.isPending || endMutation.isPending;

    return (
        <div
            className="fixed bottom-8 right-8 z-40"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={cn(
                    'group relative flex items-center rounded-2xl pr-2 shadow-lg transition-all duration-300 hover:shadow-xl',
                    timerRunning
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                )}
            >
                <button
                    onClick={handleBackToSession}
                    className="flex items-center gap-3 px-4 py-3 font-mono font-semibold text-sm"
                    title="Click to return to session"
                >
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(elapsedSeconds)}</span>
                    {timerRunning && <div className="ml-1 h-2 w-2 rounded-full bg-white animate-pulse" />}
                </button>

                <div
                    className={cn(
                        'flex items-center gap-1 overflow-hidden transition-all duration-200',
                        isHovered ? 'max-w-24 opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0'
                    )}
                >
                    <button
                        onClick={handleTogglePause}
                        disabled={isBusy}
                        className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center disabled:opacity-50"
                        title={timerRunning ? 'Pause session' : 'Resume session'}
                    >
                        {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={handleEndSession}
                        disabled={isBusy}
                        className="h-7 w-7 rounded-lg bg-red-500/70 hover:bg-red-500 flex items-center justify-center disabled:opacity-50"
                        title="End session"
                    >
                        <Square className="h-3.5 w-3.5" fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
}

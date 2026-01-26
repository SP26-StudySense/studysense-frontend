'use client';

import { useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Square } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSessionStore } from '@/store/session.store';

interface TimerCardProps {
    onSessionStart?: () => void;
    onSessionEnd?: () => void;
    className?: string;
}

export function TimerCard({ onSessionStart, onSessionEnd, className }: TimerCardProps) {
    const timerRunning = useSessionStore((state) => state.timerRunning);
    const elapsedSeconds = useSessionStore((state) => state.elapsedSeconds);
    const startTimer = useSessionStore((state) => state.startTimer);
    const pauseTimer = useSessionStore((state) => state.pauseTimer);
    const resetTimer = useSessionStore((state) => state.resetTimer);
    const incrementElapsed = useSessionStore((state) => state.incrementElapsed);
    const endSession = useSessionStore((state) => state.endSession);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (timerRunning) {
            interval = setInterval(() => {
                incrementElapsed();
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timerRunning, incrementElapsed]);

    const handleStart = useCallback(() => {
        startTimer();
        onSessionStart?.();
    }, [startTimer, onSessionStart]);

    const handlePause = useCallback(() => {
        pauseTimer();
    }, [pauseTimer]);

    const handleResume = useCallback(() => {
        startTimer();
    }, [startTimer]);

    const handleReset = useCallback(() => {
        resetTimer();
    }, [resetTimer]);

    const handleEndSession = useCallback(() => {
        endSession();
        onSessionEnd?.();
    }, [endSession, onSessionEnd]);

    const hasStarted = elapsedSeconds > 0 || timerRunning;

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
                timerRunning ? "text-emerald-600" : hasStarted ? "text-amber-600" : "text-neutral-500"
            )}>
                {timerRunning ? '● Session in progress' : hasStarted ? '● Paused' : 'Ready to start'}
            </p>

            {/* Controls */}
            <div className="relative mt-8 flex items-center gap-3">
                {!hasStarted ? (
                    <button
                        onClick={handleStart}
                        className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/40 hover:scale-105 transition-all duration-300"
                    >
                        <Play className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" />
                        Start Session
                    </button>
                ) : (
                    <>
                        {timerRunning ? (
                            <button
                                onClick={handlePause}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300"
                            >
                                <Pause className="h-5 w-5" fill="currentColor" />
                                Pause
                            </button>
                        ) : (
                            <button
                                onClick={handleResume}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/40 hover:scale-105 transition-all duration-300"
                            >
                                <Play className="h-5 w-5" fill="currentColor" />
                                Resume
                            </button>
                        )}
                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white/80 p-4 text-neutral-600 shadow-sm hover:bg-neutral-50 hover:text-neutral-900 hover:scale-105 transition-all duration-300"
                            title="Reset"
                        >
                            <RotateCcw className="h-5 w-5" />
                        </button>
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


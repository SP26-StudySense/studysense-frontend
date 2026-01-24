'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface TimerCardProps {
    onSessionStart?: () => void;
    onSessionEnd?: () => void;
    className?: string;
}

export function TimerCard({ onSessionStart, onSessionEnd, className }: TimerCardProps) {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning]);

    const handleStart = useCallback(() => {
        setIsRunning(true);
        onSessionStart?.();
    }, [onSessionStart]);

    const handlePause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const handleReset = useCallback(() => {
        setIsRunning(false);
        setSeconds(0);
        onSessionEnd?.();
    }, [onSessionEnd]);

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
                {formatTime(seconds)}
            </div>

            {/* Status */}
            <p className={cn(
                "mt-3 text-sm font-medium",
                isRunning ? "text-violet-600" : "text-neutral-500"
            )}>
                {isRunning ? '● Session in progress' : 'Ready to start'}
            </p>

            {/* Controls */}
            <div className="relative mt-8 flex items-center gap-3">
                {!isRunning ? (
                    <button
                        onClick={handleStart}
                        className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-violet-600/30 hover:shadow-2xl hover:shadow-violet-600/40 hover:scale-105 transition-all duration-300"
                    >
                        <Play className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" />
                        Start Session
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handlePause}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300"
                        >
                            <Pause className="h-5 w-5" fill="currentColor" />
                            Pause
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white/80 p-4 text-neutral-600 shadow-sm hover:bg-neutral-50 hover:text-neutral-900 hover:scale-105 transition-all duration-300"
                        >
                            <RotateCcw className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

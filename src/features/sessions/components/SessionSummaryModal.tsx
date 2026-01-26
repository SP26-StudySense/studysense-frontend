'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, Sparkles, Star, ArrowRight, Map } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSessionStore, SessionSummaryData } from '@/store/session.store';

interface SessionSummaryModalProps {
    isOpen: boolean;
    onSaveAndContinue: () => void;
    className?: string;
}

export function SessionSummaryModal({ isOpen, onSaveAndContinue, className }: SessionSummaryModalProps) {
    const summaryData = useSessionStore((state) => state.summaryData);
    const setSummaryData = useSessionStore((state) => state.setSummaryData);
    const [hoveredStar, setHoveredStar] = useState(0);

    if (!isOpen || !summaryData) return null;

    const handleStarClick = (rating: number) => {
        setSummaryData({ ...summaryData, rating });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            {/* Modal */}
            <div className={cn(
                "relative w-full max-w-xl mx-4 bg-gradient-to-b from-emerald-50/95 to-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-900/20 overflow-hidden",
                className
            )}>
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
                            <span className="text-2xl font-bold text-neutral-900">{summaryData.timeStudiedMinutes}</span>
                            <span className="text-xs text-neutral-500">minutes</span>
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
                                onClick={() => handleStarClick(star)}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
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

                {/* Suggested Next Step */}
                <div className="mx-8 mb-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        <h3 className="font-semibold text-neutral-900">Suggested Next Step</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                        Based on your progress, we recommend continuing with the next topic in your roadmap tomorrow. Consistency is key!
                    </p>
                    <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-neutral-200 bg-white/80 text-sm font-medium text-neutral-700 hover:bg-white transition-all">
                        <Map className="h-4 w-4" />
                        View Roadmap
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Save Button */}
                <div className="px-8 pb-8">
                    <button
                        onClick={onSaveAndContinue}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
                    >
                        Save & Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

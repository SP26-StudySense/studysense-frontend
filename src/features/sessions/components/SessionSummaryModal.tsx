import { useState } from 'react';
import { CheckCircle2, Clock, Sparkles, Star, ArrowRight, Map, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSessionStore, SessionSummaryData } from '@/store/session.store';
import { useEndSession } from '../api/mutations';
import { SessionEndedReason } from '@/shared/types';
import { toast } from '@/shared/lib';

interface SessionSummaryModalProps {
    isOpen: boolean;
    className?: string;
}

export function SessionSummaryModal({ isOpen, className }: SessionSummaryModalProps) {
    const summaryData = useSessionStore((state) => state.summaryData);
    const setSummaryData = useSessionStore((state) => state.setSummaryData);
    const sessionId = useSessionStore((state) => state.sessionId);
    const selectedTasks = useSessionStore((state) => state.selectedTasks);
    const elapsedSeconds = useSessionStore((state) => state.elapsedSeconds);
    const completeSession = useSessionStore((state) => state.completeSession);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [notes, setNotes] = useState('');

    const endMutation = useEndSession();

    const { mutateAsync: endSessionApi, isPending } = useEndSession();
    const endSessionStore = useSessionStore((state) => state.endSession);

    if (!isOpen || !summaryData) return null;

    const handleStarClick = (rating: number) => {
        setSummaryData({ ...summaryData, rating });
    };

    const handleSaveAndContinue = () => {
        if (!sessionId) return;

        const completedTaskIds = selectedTasks
            .filter((t) => t.isCompleted)
            .map((t) => Number(t.id));

        endMutation.mutate(
            {
                id: sessionId,
                request: {
                    endedReason: SessionEndedReason.COMPLETED,
                    selfRating: summaryData.rating || undefined,
                    notes: notes || undefined,
                    actualDurationSeconds: elapsedSeconds,
                    activeSeconds: elapsedSeconds,
                    tasksCompleted: completedTaskIds.length > 0 ? completedTaskIds : undefined,
                },
            },
            {
                onSuccess: (data) => {
                    completeSession(data);
                },
                onError: (error) => {
                    toast.apiError(error, 'Failed to end session');
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            {/* Modal */}
            <div className={cn(
                "relative w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto overflow-x-hidden bg-gradient-to-b from-emerald-50/95 to-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-900/20",
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

                {/* Notes Section */}
                <div className="mx-8 mb-6">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this session (optional)..."
                        className="w-full p-4 rounded-2xl bg-white/80 border border-neutral-100 shadow-sm text-sm text-neutral-700 placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
                        rows={3}
                    />
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
                        onClick={handleSaveAndContinue}
                        disabled={endMutation.isPending}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {endMutation.isPending ? 'Saving...' : 'Save & Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}

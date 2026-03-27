'use client';

import { useState } from 'react';
import { Calendar, Clock, CheckCircle2, TrendingUp, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSessionHistory, useSessionStatistics } from './api/queries';
import type { SessionHistoryItem as HistoryItem } from './types';
import { useSessionStore } from '@/store/session.store';

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    }
}

function formatDuration(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const hrs = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;

    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function StarRating({ rating }: { rating: number | null }) {
    const safeRating = rating ?? 0;

    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={cn(
                        "h-4 w-4",
                        star <= safeRating ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                    )}
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}

function SessionCard({ session }: { session: HistoryItem }) {
    const completionRate = session.totalTasks > 0
        ? Math.round((session.tasksCompleted / session.totalTasks) * 100)
        : 0;

    return (
        <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-neutral-200/60 p-5 shadow-lg shadow-neutral-900/5 hover:shadow-xl transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-neutral-900">{session.nodeTitle ?? 'Unknown module'}</h3>
                    <p className="text-sm text-neutral-500">{session.planTitle ?? 'Unknown plan'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        session.status === 'Completed'
                            ? "bg-emerald-50 text-emerald-600"
                            : session.status === 'Cancelled'
                            ? "bg-red-50 text-red-600"
                            : "bg-neutral-100 text-neutral-600"
                    )}>
                        {session.status}
                    </span>
                    <span className="text-xs text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-lg">
                        {formatDate(session.date)}
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Clock className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-900">{formatDuration(session.durationSeconds)}</p>
                        <p className="text-[10px] text-neutral-400">Duration</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-900">{session.tasksCompleted}/{session.totalTasks}</p>
                        <p className="text-[10px] text-neutral-400">Tasks</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-900">+{session.xpEarned}</p>
                        <p className="text-[10px] text-neutral-400">XP</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Focus rating:</span>
                    <StarRating rating={session.rating} />
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-16 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                    <span className="text-xs text-neutral-500">{completionRate}%</span>
                </div>
            </div>
        </div>
    );
}

export function SessionHistoryPage() {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const activeStudyPlanId = useSessionStore((state) => state.activeStudyPlanId);

    const parsedPlanId = activeStudyPlanId ? Number(activeStudyPlanId) : undefined;
    const planId =
        typeof parsedPlanId === 'number' && Number.isFinite(parsedPlanId) && parsedPlanId > 0
            ? parsedPlanId
            : undefined;

    // Fetch real data from API
    const { data: historyData, isLoading: historyLoading } = useSessionHistory({
        planId,
        pageNumber: page,
        pageSize,
        sortBy: 'date',
        sortOrder: 'desc',
    });

    const { data: stats, isLoading: statsLoading } = useSessionStatistics('all');

    const sessions = historyData?.items ?? [];
    const totalPages = historyData?.totalPages ?? 0;
    const totalCount = historyData?.totalCount ?? 0;

    return (
        <div className="max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Session History</h1>
                <p className="text-neutral-500">Review your past study sessions and track your progress</p>
                {planId && (
                    <p className="mt-2 inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Filtered by current roadmap
                    </p>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-2xl bg-neutral-100 p-5 animate-pulse h-28" />
                    ))
                ) : (
                    <>
                        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white">
                            <Calendar className="h-6 w-6 mb-2 opacity-80" />
                            <p className="text-3xl font-bold">{stats?.totalSessions ?? 0}</p>
                            <p className="text-sm opacity-80">Total Sessions</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white">
                            <Clock className="h-6 w-6 mb-2 opacity-80" />
                            <p className="text-3xl font-bold">
                                {formatDuration(stats?.totalSeconds ?? 0)}
                            </p>
                            <p className="text-sm opacity-80">Time Studied</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white">
                            <TrendingUp className="h-6 w-6 mb-2 opacity-80" />
                            <p className="text-3xl font-bold">{stats?.totalXpEarned ?? 0}</p>
                            <p className="text-sm opacity-80">XP Earned</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white">
                            <svg className="h-6 w-6 mb-2 opacity-80 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <p className="text-3xl font-bold">{(stats?.averageRating ?? 0).toFixed(1)}</p>
                            <p className="text-sm opacity-80">Avg Rating</p>
                        </div>
                    </>
                )}
            </div>

            {/* Session List */}
            {historyLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                </div>
            ) : sessions.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8 px-2">
                            <p className="text-sm text-neutral-500">
                                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>
                                <span className="text-sm text-neutral-600 px-2">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Empty State */
                <div className="text-center py-16">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No sessions yet</h3>
                    <p className="text-neutral-500 mb-6">Start your first study session to see your history here</p>
                </div>
            )}

        </div>
    );
}

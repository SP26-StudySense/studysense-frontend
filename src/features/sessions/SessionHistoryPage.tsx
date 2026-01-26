'use client';

import { Calendar, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// Mock session history data
const MOCK_HISTORY = [
    {
        id: '1',
        date: '2026-01-26',
        nodeTitle: 'React Hooks Deep Dive',
        planTitle: 'Frontend Development Path',
        durationMinutes: 45,
        tasksCompleted: 3,
        totalTasks: 4,
        xpEarned: 85,
        rating: 4,
    },
    {
        id: '2',
        date: '2026-01-25',
        nodeTitle: 'TypeScript Fundamentals',
        planTitle: 'Frontend Development Path',
        durationMinutes: 60,
        tasksCompleted: 5,
        totalTasks: 5,
        xpEarned: 120,
        rating: 5,
    },
    {
        id: '3',
        date: '2026-01-24',
        nodeTitle: 'CSS Grid & Flexbox',
        planTitle: 'Frontend Development Path',
        durationMinutes: 30,
        tasksCompleted: 2,
        totalTasks: 3,
        xpEarned: 55,
        rating: 3,
    },
    {
        id: '4',
        date: '2026-01-23',
        nodeTitle: 'JavaScript ES6+',
        planTitle: 'Frontend Development Path',
        durationMinutes: 90,
        tasksCompleted: 6,
        totalTasks: 6,
        xpEarned: 180,
        rating: 5,
    },
    {
        id: '5',
        date: '2026-01-22',
        nodeTitle: 'HTML Semantics',
        planTitle: 'Frontend Development Path',
        durationMinutes: 25,
        tasksCompleted: 4,
        totalTasks: 4,
        xpEarned: 65,
        rating: 4,
    },
];

interface SessionHistoryItem {
    id: string;
    date: string;
    nodeTitle: string;
    planTitle: string;
    durationMinutes: number;
    tasksCompleted: number;
    totalTasks: number;
    xpEarned: number;
    rating: number;
}

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

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={cn(
                        "h-4 w-4",
                        star <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                    )}
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}

function SessionCard({ session }: { session: SessionHistoryItem }) {
    const completionRate = Math.round((session.tasksCompleted / session.totalTasks) * 100);

    return (
        <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-neutral-200/60 p-5 shadow-lg shadow-neutral-900/5 hover:shadow-xl transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-neutral-900">{session.nodeTitle}</h3>
                    <p className="text-sm text-neutral-500">{session.planTitle}</p>
                </div>
                <span className="text-xs text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-lg">
                    {formatDate(session.date)}
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Clock className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-900">{session.durationMinutes}m</p>
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
    // Calculate stats
    const totalSessions = MOCK_HISTORY.length;
    const totalMinutes = MOCK_HISTORY.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalXP = MOCK_HISTORY.reduce((sum, s) => sum + s.xpEarned, 0);
    const avgRating = MOCK_HISTORY.reduce((sum, s) => sum + s.rating, 0) / totalSessions;

    return (
        <div className="max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Session History</h1>
                <p className="text-neutral-500">Review your past study sessions and track your progress</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white">
                    <Calendar className="h-6 w-6 mb-2 opacity-80" />
                    <p className="text-3xl font-bold">{totalSessions}</p>
                    <p className="text-sm opacity-80">Total Sessions</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white">
                    <Clock className="h-6 w-6 mb-2 opacity-80" />
                    <p className="text-3xl font-bold">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
                    <p className="text-sm opacity-80">Time Studied</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white">
                    <TrendingUp className="h-6 w-6 mb-2 opacity-80" />
                    <p className="text-3xl font-bold">{totalXP}</p>
                    <p className="text-sm opacity-80">XP Earned</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white">
                    <svg className="h-6 w-6 mb-2 opacity-80 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-3xl font-bold">{avgRating.toFixed(1)}</p>
                    <p className="text-sm opacity-80">Avg Rating</p>
                </div>
            </div>

            {/* Session List */}
            <div className="space-y-4">
                {MOCK_HISTORY.map((session) => (
                    <SessionCard key={session.id} session={session} />
                ))}
            </div>

            {/* Empty State (hidden when there's data) */}
            {MOCK_HISTORY.length === 0 && (
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

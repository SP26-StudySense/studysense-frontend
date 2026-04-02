'use client';

import { Clock } from "lucide-react";
import { useDashboardOverview } from "../api/queries";

interface RecentSessionsProps {
    studyPlanId?: string;
}

export const RecentSessions = ({ studyPlanId }: RecentSessionsProps) => {
    const { data } = useDashboardOverview(studyPlanId);
    const sessions = data?.recentSessions ?? [];

    return (
        <div className="glass-panel rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            <div className="mb-6">
                <h3 className="font-bold text-neutral-900">Recent Sessions</h3>
                <p className="text-xs text-neutral-500">Your study activity</p>
            </div>

            <div className="space-y-4">
                {sessions.length === 0 && (
                    <p className="text-sm text-neutral-500">No completed sessions yet.</p>
                )}

                {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between rounded-2xl border border-transparent bg-white/50 p-4 transition-all hover:border-[#00bae2]/20 hover:bg-white hover:shadow-lg hover:shadow-[#00bae2]/5 hover:-translate-y-0.5 cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e0faff] text-[#00bae2]">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-neutral-900">{Math.max(1, Math.round(session.durationSeconds / 60))} minute session</p>
                                <p className="text-xs text-neutral-500">{session.tasksCompleted} tasks completed</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold text-neutral-900">{session.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

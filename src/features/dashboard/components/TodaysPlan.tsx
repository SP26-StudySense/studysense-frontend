'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { useDashboardOverview } from "../api/queries";
import { useSessionStore } from '@/store/session.store';
import { routes } from '@/shared/config/routes';

interface TodaysPlanProps {
    studyPlanId?: string;
}

export const TodaysPlan = ({ studyPlanId }: TodaysPlanProps) => {
    const router = useRouter();
    const setSelectedTasks = useSessionStore((state) => state.setSelectedTasks);
    const setSelectedNode = useSessionStore((state) => state.setSelectedNode);
    const setActiveStudyPlanId = useSessionStore((state) => state.setActiveStudyPlanId);

    const { data } = useDashboardOverview(studyPlanId);
    const focus = data?.todaysFocus;
    const upcomingTasks = data?.upcomingTasks ?? [];

    const handleStartTask = () => {
        if (!focus) return;

        if (studyPlanId) {
            setActiveStudyPlanId(studyPlanId);
        }

        setSelectedNode({
            id: String(focus.moduleId),
            title: focus.moduleTitle,
            planId: studyPlanId,
            planTitle: data?.roadmapTitle,
        });

        setSelectedTasks([
            {
                id: String(focus.taskId),
                title: focus.taskTitle,
                description: focus.description || undefined,
                estimatedMinutes: focus.estimatedMinutes,
                isCompleted: false,
            },
        ]);

        router.push(routes.dashboard.sessions.list);
    };

    return (
        <div className="glass-panel rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#00bae2]" />
                <div>
                    <h3 className="font-bold text-neutral-900">Today&apos;s Plan</h3>
                    <p className="text-xs text-neutral-500">Your recommended tasks for today</p>
                </div>
            </div>

            {/* Active Task */}
            <div className="mb-6 rounded-2xl border border-white bg-white/60 p-5 shadow-sm transition-all hover:shadow-[#00bae2]/10 hover:shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{focus?.moduleTitle || 'No active module'}</span>
                        <h4 className="mt-1 text-lg font-bold text-neutral-900">{focus?.taskTitle || 'No task for today'}</h4>
                        <p className="mt-1 text-sm text-neutral-500">{focus?.description || 'Add tasks in Schedule to see recommendations.'}</p>
                    </div>
                    <span className="rounded-full bg-[#e0faff] px-3 py-1 text-xs font-bold text-[#00bae2]">{focus ? `${focus.estimatedMinutes} min` : '—'}</span>
                </div>
                <Button
                    onClick={handleStartTask}
                    disabled={!focus}
                    className="mt-4 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-6 py-2 text-xs font-bold text-neutral-900 shadow-md shadow-[#00bae2]/10 hover:shadow-[#00bae2]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Start Task
                </Button>
            </div>

            {/* Upcoming List */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-neutral-600">Coming up next</h4>
                {upcomingTasks.length === 0 && (
                    <p className="text-sm text-neutral-500">No upcoming tasks yet.</p>
                )}

                {upcomingTasks.map((task) => (
                    <div key={task.taskId} className="flex items-center justify-between rounded-xl border border-transparent bg-white/30 px-4 py-3 hover:bg-white/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-neutral-400 group-hover:text-[#00bae2] transition-colors" />
                            <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">{task.taskTitle}</span>
                        </div>
                        <span className="text-xs font-medium text-neutral-400">{task.estimatedMinutes} min</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

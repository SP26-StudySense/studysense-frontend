'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Map, PlayCircle, Settings2 } from "lucide-react";
import { routes } from '@/shared/config/routes';

interface QuickActionsProps {
    studyPlanId?: string;
}

export const QuickActions = ({ studyPlanId }: QuickActionsProps) => {
    const router = useRouter();

    const actions = [
        {
            icon: Map,
            label: "View Roadmap",
            href: studyPlanId
                ? routes.dashboard.myRoadmap(studyPlanId)
                : routes.dashboard.roadmaps.list,
        },
        { icon: PlayCircle, label: "Start Session", href: routes.dashboard.sessions.list },
        {
            icon: Settings2,
            label: "Adjust Plan",
            href: studyPlanId
                ? routes.dashboard.studyPlans.detail(studyPlanId)
                : routes.dashboard.studyPlans.list,
        },
    ];

    return (
        <div className="glass-panel h-fit rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            <div className="mb-6">
                <h3 className="font-bold text-neutral-900">Quick Actions</h3>
                <p className="text-xs text-neutral-500">Common tasks and shortcuts</p>
            </div>

            <div className="space-y-3">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => router.push(action.href)}
                        className="group flex w-full items-center justify-between rounded-xl border border-white bg-white/50 px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:border-[#00bae2]/30 hover:bg-white hover:text-neutral-900 hover:shadow-lg hover:shadow-[#00bae2]/10 hover:-translate-y-0.5"
                    >
                        <div className="flex items-center gap-3">
                            <action.icon className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-[#00bae2]" />
                            {action.label}
                        </div>
                        <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-[#00bae2]" />
                    </button>
                ))}
            </div>
        </div>
    );
};

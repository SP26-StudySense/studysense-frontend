'use client';

import { Check, Play, Lock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface RoadmapModule {
    id: string;
    title: string;
    status: 'completed' | 'in_progress' | 'locked';
    completedDate?: string;
    dueDate?: string;
    currentTopic?: string;
}

interface RoadmapTimelineProps {
    modules: RoadmapModule[];
    className?: string;
}

export function RoadmapTimeline({ modules, className }: RoadmapTimelineProps) {
    return (
        <div className={cn(
            "rounded-3xl bg-white/70 backdrop-blur-xl border border-neutral-200/60 p-6 shadow-xl shadow-neutral-900/5",
            className
        )}>
            <div className="mb-5">
                <h3 className="text-lg font-bold text-neutral-900">Roadmap</h3>
                <p className="text-sm text-neutral-500">Your learning path milestones</p>
            </div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#00bae2]/50 via-violet-300/50 to-neutral-200" />

                <div className="space-y-4">
                    {modules.map((module, index) => (
                        <div key={module.id} className="relative flex gap-4">
                            {/* Status icon */}
                            <div className={cn(
                                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-lg transition-all duration-300",
                                module.status === 'completed' && "bg-gradient-to-br from-[#00bae2] to-[#00a0c6] text-white shadow-[#00bae2]/30",
                                module.status === 'in_progress' && "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/30",
                                module.status === 'locked' && "bg-neutral-100 text-neutral-400 shadow-none"
                            )}>
                                {module.status === 'completed' && <Check className="h-4 w-4" />}
                                {module.status === 'in_progress' && <Play className="h-4 w-4" />}
                                {module.status === 'locked' && <Lock className="h-3.5 w-3.5" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-4">
                                <h4 className={cn(
                                    "font-semibold",
                                    module.status === 'locked' ? "text-neutral-400" : "text-neutral-900"
                                )}>
                                    {module.title}
                                </h4>

                                {module.status === 'completed' && module.completedDate && (
                                    <p className="text-xs text-[#00889e] font-medium mt-0.5">
                                        ✓ Completed on {module.completedDate}
                                    </p>
                                )}

                                {module.status === 'in_progress' && (
                                    <div>
                                        <p className="text-xs text-violet-600 font-medium mt-0.5">
                                            In Progress • Due {module.dueDate}
                                        </p>
                                        {module.currentTopic && (
                                            <div className="mt-2 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 px-3 py-2 text-xs text-violet-700 border border-violet-100">
                                                Currently: {module.currentTopic}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {module.status === 'locked' && (
                                    <p className="text-xs text-neutral-400 mt-0.5">Locked</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

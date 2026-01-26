'use client';

import { Check, Play, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface RoadmapModule {
    id: string;
    title: string;
    status: 'completed' | 'in_progress' | 'not_started' | 'locked';
    completedDate?: string;
    dueDate?: string;
    currentTopic?: string;
    taskCount?: number;
}

interface RoadmapTimelineProps {
    modules: RoadmapModule[];
    selectedModuleId?: string | null;
    onModuleClick?: (moduleId: string) => void;
    className?: string;
}

export function RoadmapTimeline({ modules, selectedModuleId, onModuleClick, className }: RoadmapTimelineProps) {
    return (
        <div className={cn(
            "rounded-3xl bg-white/70 backdrop-blur-xl border border-neutral-200/60 p-6 shadow-xl shadow-neutral-900/5",
            className
        )}>
            <div className="mb-5">
                <h3 className="text-lg font-bold text-neutral-900">Modules</h3>
                <p className="text-sm text-neutral-500">Click a module to view tasks</p>
            </div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#00bae2]/50 via-violet-300/50 to-neutral-200" />

                <div className="space-y-3">
                    {modules.map((module) => {
                        const isClickable = module.status !== 'locked';
                        const isSelected = selectedModuleId === module.id;

                        return (
                            <button
                                key={module.id}
                                onClick={() => isClickable && onModuleClick?.(module.id)}
                                disabled={!isClickable}
                                className={cn(
                                    "relative flex gap-4 w-full text-left rounded-2xl p-3 -ml-1 transition-all duration-200",
                                    isClickable && !isSelected && "hover:bg-neutral-50 cursor-pointer",
                                    isSelected && "bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200",
                                    !isClickable && "cursor-not-allowed opacity-70"
                                )}
                            >
                                {/* Status icon */}
                                <div className={cn(
                                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-lg transition-all duration-300",
                                    module.status === 'completed' && "bg-gradient-to-br from-[#00bae2] to-[#00a0c6] text-white shadow-[#00bae2]/30",
                                    module.status === 'in_progress' && "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/30",
                                    module.status === 'not_started' && "bg-white border-2 border-neutral-200 text-neutral-400",
                                    module.status === 'locked' && "bg-neutral-100 text-neutral-400 shadow-none"
                                )}>
                                    {module.status === 'completed' && <Check className="h-4 w-4" />}
                                    {module.status === 'in_progress' && <Play className="h-4 w-4" />}
                                    {module.status === 'not_started' && <div className="h-2 w-2 rounded-full bg-neutral-300" />}
                                    {module.status === 'locked' && <Lock className="h-3.5 w-3.5" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h4 className={cn(
                                        "font-semibold truncate",
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
                                        <p className="text-xs text-violet-600 font-medium mt-0.5">
                                            In Progress {module.dueDate && `• Due ${module.dueDate}`}
                                        </p>
                                    )}

                                    {module.status === 'not_started' && (
                                        <p className="text-xs text-neutral-400 mt-0.5">
                                            {module.taskCount ? `${module.taskCount} tasks` : 'Not started'}
                                        </p>
                                    )}

                                    {module.status === 'locked' && (
                                        <p className="text-xs text-neutral-400 mt-0.5">Locked</p>
                                    )}
                                </div>

                                {/* Arrow indicator for clickable modules */}
                                {isClickable && (
                                    <div className={cn(
                                        "flex items-center justify-center transition-all",
                                        isSelected ? "text-violet-500" : "text-neutral-300"
                                    )}>
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


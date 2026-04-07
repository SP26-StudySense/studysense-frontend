'use client';

import { CheckCircle2, Clock, PlayCircle, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface SessionTask {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    duration: number; // minutes
    isActive: boolean;
    isCompleted: boolean;
}

interface TaskSelectorProps {
    tasks: SessionTask[];
    canInteract: boolean;
    onSetActiveTask?: (taskId: string) => void;
    onCompleteTask?: (taskId: string) => void;
    className?: string;
}

export function TaskSelector({
    tasks,
    canInteract,
    onSetActiveTask,
    onCompleteTask,
    className,
}: TaskSelectorProps) {
    return (
        <div className={cn(
            "rounded-3xl bg-white/70 backdrop-blur-xl border border-neutral-200/60 p-6 shadow-xl shadow-neutral-900/5",
            className
        )}>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00bae2] to-[#00a0c6] text-white shadow-lg shadow-[#00bae2]/30">
                    <CheckCircle2 className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Session Tasks</h3>
            </div>
            <p className="text-sm text-neutral-500 mb-5 ml-10">
                {canInteract
                    ? 'Select the task you are currently studying and mark it done when finished'
                    : 'Tasks are locked until you start the session'}
            </p>

            {/* Task List */}
            <div className="space-y-3">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        onClick={() => {
                            if (canInteract && !task.isCompleted) {
                                onSetActiveTask?.(task.id);
                            }
                        }}
                        className={cn(
                            "group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300",
                            canInteract && !task.isCompleted && 'cursor-pointer',
                            task.isCompleted
                                ? "bg-emerald-50/70 border border-emerald-200"
                                : task.isActive
                                ? "bg-gradient-to-r from-[#00bae2]/10 to-[#fec5fb]/10 border-2 border-[#00bae2] shadow-lg shadow-[#00bae2]/10"
                                : "bg-white/50 border border-neutral-100 hover:border-neutral-200 hover:shadow-md hover:bg-white/80"
                        )}
                    >
                        {/* Active marker */}
                        <div className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                            task.isCompleted
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                : task.isActive
                                    ? "bg-gradient-to-br from-[#00bae2] to-[#00a0c6] text-white shadow-lg shadow-[#00bae2]/30"
                                    : "border-2 border-neutral-300"
                        )}>
                            {task.isCompleted ? (
                                <Check className="h-3.5 w-3.5" />
                            ) : task.isActive ? (
                                <PlayCircle className="h-3.5 w-3.5" />
                            ) : null}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className={cn(
                                "font-semibold transition-colors",
                                task.isActive || task.isCompleted ? "text-neutral-900" : "text-neutral-700 group-hover:text-neutral-900"
                            )}>
                                {task.title}
                            </h4>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                {task.category} › {task.subcategory}
                            </p>
                            <p className="text-xs mt-1 font-medium text-neutral-500">
                                {task.isCompleted ? 'Completed' : task.isActive ? 'In progress' : 'Pending'}
                            </p>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                                task.isActive
                                    ? "bg-[#00bae2]/20 text-[#00889e]"
                                    : "bg-neutral-100 text-neutral-500"
                            )}>
                                <Clock className="h-3.5 w-3.5" />
                                {task.duration}m
                            </div>

                            {canInteract && task.isActive && !task.isCompleted && (
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onCompleteTask?.(task.id);
                                    }}
                                    className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                                >
                                    Done
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

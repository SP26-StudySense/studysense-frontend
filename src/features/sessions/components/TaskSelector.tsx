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
    const completedCount = tasks.filter((task) => task.isCompleted).length;

    return (
        <div className={cn(
            "rounded-3xl border border-neutral-200/70 bg-white/80 p-6 shadow-xl shadow-neutral-900/5 backdrop-blur-xl flex flex-col",
            className
        )}>
            {/* Header */}
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/30">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900">Session Tasks</h3>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {completedCount}/{tasks.length} done
                </span>
            </div>
            <p className="mb-5 ml-12 text-sm text-neutral-500">
                {canInteract
                    ? 'Pick your active task and mark it done when complete'
                    : 'Tasks stay locked until the session starts'}
            </p>

            {/* Task List */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
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
                            !canInteract && 'cursor-not-allowed opacity-75',
                            task.isCompleted
                                ? "border border-emerald-200 bg-emerald-50/80"
                                : task.isActive
                                ? "border-2 border-cyan-300 bg-gradient-to-r from-cyan-50 to-emerald-50 shadow-lg shadow-cyan-500/10"
                                : "border border-neutral-100 bg-white/60 hover:border-neutral-200 hover:bg-white/90 hover:shadow-md"
                        )}
                    >
                        {/* Active marker */}
                        <div className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                            task.isCompleted
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                : task.isActive
                                    ? "bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/30"
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
                                "font-semibold transition-colors line-clamp-1",
                                task.isActive || task.isCompleted ? "text-neutral-900" : "text-neutral-700 group-hover:text-neutral-900"
                            )}>
                                {task.title}
                            </h4>
                            <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">
                                {task.category} {task.subcategory ? `• ${task.subcategory}` : ''}
                            </p>
                            <p className="mt-1 text-xs font-medium text-neutral-500">
                                {task.isCompleted ? 'Completed' : task.isActive ? 'In progress' : canInteract ? 'Pending' : 'Locked'}
                            </p>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                                task.isActive
                                    ? "bg-cyan-100 text-cyan-700"
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
                                    className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-95"
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

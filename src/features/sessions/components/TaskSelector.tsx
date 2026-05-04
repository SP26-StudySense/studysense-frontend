'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, PlayCircle, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface SessionTask {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    description?: string;
    expectedOutput?: string;
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
    const [flippedTaskIds, setFlippedTaskIds] = useState<Set<string>>(new Set());

    const toggleTaskFlip = (taskId: string) => {
        setFlippedTaskIds((prev) => {
            const next = new Set(prev);
            if (next.has(taskId)) {
                next.delete(taskId);
            } else {
                next.add(taskId);
            }
            return next;
        });
    };

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
            <div className="space-y-3 pr-1">
                {tasks.map(task => {
                    const isFlipped = flippedTaskIds.has(task.id);

                    return (
                    <div
                        key={task.id}
                        onClick={() => {
                            if (canInteract && !task.isCompleted) {
                                onSetActiveTask?.(task.id);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                if (canInteract && !task.isCompleted) {
                                    onSetActiveTask?.(task.id);
                                }
                            }
                        }}
                        className={cn(
                            "group relative w-full rounded-2xl text-left transition-all duration-300 [perspective:1200px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-300",
                            !canInteract && 'opacity-75'
                        )}
                    >
                        <div
                            className={cn(
                                "relative h-[180px] transition-transform duration-500 [transform-style:preserve-3d]",
                                isFlipped && "[transform:rotateY(180deg)]"
                            )}
                        >
                            <div className={cn(
                                "absolute inset-0 flex w-full items-center gap-3.5 rounded-2xl border p-3.5 [backface-visibility:hidden]",
                                task.isCompleted
                                    ? "border-emerald-200 bg-emerald-50/80"
                                    : task.isActive
                                        ? "border-2 border-cyan-300 bg-gradient-to-r from-cyan-50 to-emerald-50 shadow-lg shadow-cyan-500/10"
                                        : "border-neutral-100 bg-white/60 hover:border-neutral-200 hover:bg-white/90 hover:shadow-md"
                            )}>
                                <div className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                                    task.isCompleted
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                        : task.isActive
                                            ? "bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/30"
                                            : "border-2 border-neutral-300"
                                )}>
                                    {task.isCompleted ? (
                                        <Check className="h-4 w-4" />
                                    ) : task.isActive ? (
                                        <PlayCircle className="h-4 w-4" />
                                    ) : null}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={cn(
                                        "text-[15px] font-semibold leading-snug transition-colors line-clamp-2",
                                        task.isActive || task.isCompleted ? "text-neutral-900" : "text-neutral-700 group-hover:text-neutral-900"
                                    )}>
                                        {task.title}
                                    </h4>
                                    <p className="mt-1 text-sm text-neutral-500 line-clamp-1">
                                        {task.category} {task.subcategory ? `• ${task.subcategory}` : ''}
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-neutral-500">
                                        {task.isCompleted ? 'Completed' : task.isActive ? 'In progress' : canInteract ? 'Pending' : 'Locked'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            toggleTaskFlip(task.id);
                                        }}
                                        className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-700 underline-offset-2 transition-colors hover:text-cyan-800 hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-300 rounded-sm"
                                        aria-expanded={isFlipped}
                                    >
                                        Click to view description and output
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                                        task.isActive
                                            ? "bg-cyan-100 text-cyan-700"
                                            : "bg-neutral-100 text-neutral-500"
                                    )}>
                                        <Clock className="h-4 w-4" />
                                        {task.duration}m
                                    </div>

                                    {canInteract && task.isActive && !task.isCompleted && (
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onCompleteTask?.(task.id);
                                            }}
                                            className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-sm font-semibold text-white transition-all hover:opacity-95"
                                        >
                                            Done
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="absolute inset-0 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50 p-3.5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                <div className="flex h-full flex-col">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 line-clamp-1">
                                            {task.title}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                toggleTaskFlip(task.id);
                                            }}
                                            className="rounded-md border border-violet-200 bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700 transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                                        >
                                            Back to task
                                        </button>
                                    </div>
                                    <div className="mt-2 flex-1 space-y-2 overflow-y-auto pr-1">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Description</p>
                                            <p className="mt-1 text-xs leading-relaxed text-neutral-700 whitespace-pre-line">
                                                {task.description?.trim() || 'No description.'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Output</p>
                                            <p className="mt-1 text-xs leading-relaxed text-neutral-700 whitespace-pre-line">
                                                {task.expectedOutput?.trim() || 'No expected output.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}

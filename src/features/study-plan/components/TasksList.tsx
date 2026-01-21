'use client';

import { Check, Plus, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface Task {
    id: string;
    title: string;
    description?: string;
    duration: number; // in minutes
    isCompleted: boolean;
}

interface TasksListProps {
    date: Date;
    tasks: Task[];
    onToggleTask: (taskId: string) => void;
    onAddTask?: () => void;
    className?: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

export function TasksList({ date, tasks, onToggleTask, onAddTask, className }: TasksListProps) {
    const formatDuration = (minutes: number) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${minutes}m`;
    };

    return (
        <div className={cn(
            "rounded-3xl bg-white/70 backdrop-blur-xl border border-neutral-200/60 p-6 shadow-xl shadow-neutral-900/5",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-neutral-900">
                    Tasks for {MONTHS[date.getMonth()]} {date.getDate()}
                </h3>
                {onAddTask && (
                    <button
                        onClick={onAddTask}
                        className="flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Task
                    </button>
                )}
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <p className="text-sm text-neutral-500 py-6 text-center">
                        No tasks for this day
                    </p>
                ) : (
                    tasks.map(task => (
                        <div
                            key={task.id}
                            className={cn(
                                "group flex items-start gap-4 rounded-2xl p-4 transition-all duration-300",
                                task.isCompleted
                                    ? "bg-neutral-50/80 opacity-60"
                                    : "bg-white/80 border border-neutral-100 hover:border-neutral-200 hover:shadow-lg hover:bg-white"
                            )}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => onToggleTask(task.id)}
                                className={cn(
                                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                                    task.isCompleted
                                        ? "bg-gradient-to-br from-[#00bae2] to-[#00a0c6] text-white shadow-lg shadow-[#00bae2]/30"
                                        : "border-2 border-neutral-300 hover:border-violet-400 hover:scale-110"
                                )}
                            >
                                {task.isCompleted && <Check className="h-3.5 w-3.5" />}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                    "font-semibold",
                                    task.isCompleted
                                        ? "text-neutral-500"
                                        : "text-neutral-900"
                                )}>
                                    {task.title}
                                </h4>
                                {task.description && (
                                    <p className={cn(
                                        "text-sm mt-0.5",
                                        task.isCompleted ? "text-neutral-400" : "text-neutral-500"
                                    )}>
                                        {task.description}
                                    </p>
                                )}
                            </div>

                            {/* Duration Badge */}
                            <div className={cn(
                                "shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold",
                                task.isCompleted
                                    ? "bg-neutral-100 text-neutral-400"
                                    : "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-600"
                            )}>
                                <Clock className="h-3.5 w-3.5" />
                                {formatDuration(task.duration)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

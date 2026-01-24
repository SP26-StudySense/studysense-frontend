'use client';

import { CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface SessionTask {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    duration: number; // minutes
    isSelected: boolean;
}

interface TaskSelectorProps {
    tasks: SessionTask[];
    onToggleTask: (taskId: string) => void;
    className?: string;
}

export function TaskSelector({ tasks, onToggleTask, className }: TaskSelectorProps) {
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
                <h3 className="text-lg font-bold text-neutral-900">Select Tasks</h3>
            </div>
            <p className="text-sm text-neutral-500 mb-5 ml-10">
                Choose tasks to focus on during this session
            </p>

            {/* Task List */}
            <div className="space-y-3">
                {tasks.map(task => (
                    <button
                        key={task.id}
                        onClick={() => onToggleTask(task.id)}
                        className={cn(
                            "group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300",
                            task.isSelected
                                ? "bg-gradient-to-r from-[#00bae2]/10 to-[#fec5fb]/10 border-2 border-[#00bae2] shadow-lg shadow-[#00bae2]/10"
                                : "bg-white/50 border border-neutral-100 hover:border-neutral-200 hover:shadow-md hover:bg-white/80"
                        )}
                    >
                        {/* Checkbox */}
                        <div className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                            task.isSelected
                                ? "bg-gradient-to-br from-[#00bae2] to-[#00a0c6] text-white shadow-lg shadow-[#00bae2]/30"
                                : "border-2 border-neutral-300 group-hover:border-[#00bae2]/50"
                        )}>
                            {task.isSelected && (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className={cn(
                                "font-semibold transition-colors",
                                task.isSelected ? "text-neutral-900" : "text-neutral-700 group-hover:text-neutral-900"
                            )}>
                                {task.title}
                            </h4>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                {task.category} › {task.subcategory}
                            </p>
                        </div>

                        {/* Duration */}
                        <div className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                            task.isSelected
                                ? "bg-[#00bae2]/20 text-[#00889e]"
                                : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200"
                        )}>
                            <Clock className="h-3.5 w-3.5" />
                            {task.duration}m
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

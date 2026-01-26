'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Play, Clock, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSessionStore, SelectedTask, SelectedNodeInfo } from '@/store/session.store';

export interface ModuleTask {
    id: string;
    title: string;
    description?: string;
    estimatedMinutes: number;
    isCompleted: boolean;
}

export interface ModuleData {
    id: string;
    title: string;
    status: 'completed' | 'in_progress' | 'not_started' | 'locked';
    tasks: ModuleTask[];
}

interface ModuleTasksPanelProps {
    module: ModuleData | null;
    onClose: () => void;
    className?: string;
}

export function ModuleTasksPanel({ module, onClose, className }: ModuleTasksPanelProps) {
    const router = useRouter();
    const setSelectedNode = useSessionStore((state) => state.setSelectedNode);
    const setSelectedTasks = useSessionStore((state) => state.setSelectedTasks);
    const resetSessionFlow = useSessionStore((state) => state.resetSessionFlow);

    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

    if (!module) return null;

    const handleTaskToggle = (taskId: string) => {
        setSelectedTaskIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const incompleteTasks = module.tasks.filter(t => !t.isCompleted);
        if (selectedTaskIds.size === incompleteTasks.length) {
            setSelectedTaskIds(new Set());
        } else {
            setSelectedTaskIds(new Set(incompleteTasks.map(t => t.id)));
        }
    };

    const handleStartLearning = () => {
        // Reset any previous session state
        resetSessionFlow();

        // Set selected node info
        const nodeInfo: SelectedNodeInfo = {
            id: module.id,
            title: module.title,
            planId: '1',
            planTitle: 'Learning Path',
        };
        setSelectedNode(nodeInfo);

        // Get tasks to study - either selected or all incomplete
        const tasksToStudy: SelectedTask[] = module.tasks
            .filter(task => selectedTaskIds.size === 0
                ? !task.isCompleted
                : selectedTaskIds.has(task.id))
            .map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                estimatedMinutes: task.estimatedMinutes,
                isCompleted: task.isCompleted,
            }));

        setSelectedTasks(tasksToStudy);

        // Navigate to sessions page
        router.push('/sessions');
    };

    const selectedCount = selectedTaskIds.size;
    const incompleteTasks = module.tasks.filter(t => !t.isCompleted);
    const totalEstimatedTime = module.tasks
        .filter(t => selectedTaskIds.size === 0 ? !t.isCompleted : selectedTaskIds.has(t.id))
        .reduce((sum, t) => sum + t.estimatedMinutes, 0);

    const isLocked = module.status === 'locked';

    return (
        <div className={cn(
            "rounded-3xl bg-white/90 backdrop-blur-xl border border-neutral-200/60 shadow-2xl shadow-neutral-900/10 flex flex-col",
            className
        )}>
            {/* Header */}
            <div className="p-6 border-b border-neutral-100">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-neutral-900 mb-2">
                            {module.title}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
                                module.status === 'completed' && "bg-emerald-100 text-emerald-700",
                                module.status === 'in_progress' && "bg-violet-100 text-violet-700",
                                module.status === 'not_started' && "bg-neutral-100 text-neutral-600",
                                module.status === 'locked' && "bg-neutral-100 text-neutral-400"
                            )}>
                                {module.status === 'completed' && 'Completed'}
                                {module.status === 'in_progress' && 'In Progress'}
                                {module.status === 'not_started' && 'Not Started'}
                                {module.status === 'locked' && 'Locked'}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-neutral-500">
                                <Clock className="h-4 w-4" />
                                {module.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)} min total
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-neutral-400" />
                    </button>
                </div>
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLocked ? (
                    <div className="text-center py-8 text-neutral-400">
                        <p className="text-sm">Complete previous modules to unlock this one</p>
                    </div>
                ) : (
                    <>
                        {/* Select All */}
                        {incompleteTasks.length > 0 && (
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-neutral-700">
                                    Select tasks to study
                                </span>
                                <button
                                    onClick={handleSelectAll}
                                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                                >
                                    {selectedTaskIds.size === incompleteTasks.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                        )}

                        {/* Tasks */}
                        <div className="space-y-2">
                            {module.tasks.map(task => {
                                const isSelected = selectedTaskIds.has(task.id);
                                return (
                                    <button
                                        key={task.id}
                                        onClick={() => !task.isCompleted && handleTaskToggle(task.id)}
                                        disabled={task.isCompleted}
                                        className={cn(
                                            "w-full flex items-start gap-3 text-sm p-4 rounded-2xl transition-all text-left",
                                            task.isCompleted
                                                ? "bg-neutral-50 opacity-60 cursor-not-allowed"
                                                : isSelected
                                                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400"
                                                    : "bg-white/80 border border-neutral-100 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md"
                                        )}
                                    >
                                        {/* Checkbox */}
                                        <div className={cn(
                                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                                            task.isCompleted
                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                : isSelected
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : "border-neutral-300"
                                        )}>
                                            {(task.isCompleted || isSelected) && (
                                                <Check className="h-3 w-3" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "font-medium",
                                                task.isCompleted ? "text-neutral-500" : "text-neutral-800"
                                            )}>
                                                {task.title}
                                            </p>
                                            {task.description && (
                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Duration */}
                                        <span className={cn(
                                            "shrink-0 text-xs font-medium px-2 py-1 rounded-lg",
                                            task.isCompleted
                                                ? "bg-neutral-100 text-neutral-400"
                                                : "bg-violet-100 text-violet-600"
                                        )}>
                                            {task.estimatedMinutes}m
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            {!isLocked && incompleteTasks.length > 0 && (
                <div className="p-6 border-t border-neutral-100 space-y-3">
                    {/* Summary */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">
                            {selectedCount > 0 ? `${selectedCount} tasks selected` : `${incompleteTasks.length} tasks available`}
                        </span>
                        <span className="font-medium text-neutral-700">
                            ~{totalEstimatedTime} min
                        </span>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={handleStartLearning}
                        className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-white shadow-xl transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40"
                    >
                        <Play className="h-5 w-5" fill="currentColor" />
                        {selectedCount > 0
                            ? `Start Learning (${selectedCount} task${selectedCount > 1 ? 's' : ''})`
                            : `Start Learning (${incompleteTasks.length} task${incompleteTasks.length > 1 ? 's' : ''})`
                        }
                    </button>
                </div>
            )}

            {/* All Completed Message */}
            {!isLocked && incompleteTasks.length === 0 && (
                <div className="p-6 border-t border-neutral-100">
                    <div className="text-center py-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3">
                            <Check className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-neutral-700">All tasks completed!</p>
                        <p className="text-xs text-neutral-500 mt-1">Great job on finishing this module</p>
                    </div>
                </div>
            )}
        </div>
    );
}

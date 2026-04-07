'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    formatLocalDate,
    getTodayLocalDateInput,
    isIsoDateBeforeTodayLocal,
    localDateInputToUtcIso,
    toLocalDateInputValue,
} from '@/shared/lib/date-time';

export interface AiPreviewTask {
    title: string;
    description?: string;
    estimatedMinutes?: number;
    scheduledDate?: string;
}

interface AiTaskPreviewPanelProps {
    isVisible: boolean;
    tasks: AiPreviewTask[];
    message?: string | null;
    onDiscard: () => void;
    onAccept: (tasks: AiPreviewTask[]) => void;
}

export function AiTaskPreviewPanel({
    isVisible,
    tasks,
    message,
    onDiscard,
    onAccept,
}: AiTaskPreviewPanelProps) {
    const [mounted, setMounted] = useState(false);
    const [draftTasks, setDraftTasks] = useState<AiPreviewTask[]>([]);
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isVisible) {
            setDraftTasks(tasks);
            setIsAccepting(false);
        }
    }, [isVisible, tasks]);

    const hasTasks = draftTasks.length > 0;
    const hasInvalidTask = useMemo(
        () => draftTasks.some((task) => !task.title?.trim()),
        [draftTasks]
    );
    const hasPastDateTask = useMemo(
        () => draftTasks.some((task) => isIsoDateBeforeTodayLocal(task.scheduledDate)),
        [draftTasks]
    );

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            await onAccept(draftTasks);
        } finally {
            setIsAccepting(false);
        }
    };

    const updateTask = (index: number, patch: Partial<AiPreviewTask>) => {
        setDraftTasks((prev) => prev.map((task, i) => (i === index ? { ...task, ...patch } : task)));
    };

    const removeTask = (index: number) => {
        setDraftTasks((prev) => prev.filter((_, i) => i !== index));
    };

    const formatDeadline = (value?: string): string => formatLocalDate(value);

    if (!isVisible || !mounted) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            {/* Backdrop - prevent click */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-violet-200 bg-white shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-violet-900">AI generated tasks preview</h3>
                    <span className="text-xs font-medium text-violet-700">{draftTasks.length} items</span>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {message && <p className="text-sm text-violet-700">{message}</p>}

                    {!hasTasks && (
                        <p className="text-sm text-neutral-500">No tasks to accept.</p>
                    )}

                    {draftTasks.map((task, index) => (
                        <div key={`${task.title}-${index}`} className="rounded-xl border border-violet-100 bg-violet-50/30 p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <p className="text-xs font-semibold text-violet-700">Task {index + 1}</p>
                                <button
                                    onClick={() => removeTask(index)}
                                    className="text-xs font-medium text-rose-600 hover:text-rose-700"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="space-y-3">
                                <input
                                    value={task.title}
                                    onChange={(e) => updateTask(index, { title: e.target.value })}
                                    placeholder="Task title"
                                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-violet-300"
                                />

                                <textarea
                                    value={task.description ?? ''}
                                    onChange={(e) => updateTask(index, { description: e.target.value || undefined })}
                                    placeholder="Task description"
                                    rows={4}
                                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label className="text-xs text-neutral-600">
                                        Estimated minutes
                                        <input
                                            type="number"
                                            min={1}
                                            value={task.estimatedMinutes ?? ''}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                updateTask(index, {
                                                    estimatedMinutes: Number.isFinite(value) && value > 0 ? value : undefined,
                                                });
                                            }}
                                            className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-violet-300"
                                        />
                                    </label>

                                    <label className="text-xs text-neutral-600">
                                        Deadline
                                        <input
                                            type="date"
                                            value={toLocalDateInputValue(task.scheduledDate)}
                                            onChange={(e) => {
                                                const iso = e.target.value ? localDateInputToUtcIso(e.target.value) : undefined;
                                                updateTask(index, { scheduledDate: iso });
                                            }}
                                            min={getTodayLocalDateInput()}
                                            className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-violet-300"
                                        />
                                    </label>
                                </div>

                                {isIsoDateBeforeTodayLocal(task.scheduledDate) && (
                                    <p className="text-[11px] text-rose-600">
                                        Deadline cannot be in the past.
                                    </p>
                                )}

                                <p className="text-[11px] text-neutral-500">
                                    Display deadline: {formatDeadline(task.scheduledDate)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-2 bg-white">
                    <button
                        onClick={onDiscard}
                        disabled={isAccepting}
                        className="inline-flex items-center px-4 py-2 rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleAccept}
                        disabled={!hasTasks || hasInvalidTask || hasPastDateTask || isAccepting}
                        className="inline-flex items-center px-4 py-2 rounded-lg border border-violet-200 bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAccepting ? 'Saving...' : 'Accept'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

'use client';

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
    onAccept: () => void;
}

export function AiTaskPreviewPanel({
    isVisible,
    tasks,
    message,
    onDiscard,
    onAccept,
}: AiTaskPreviewPanelProps) {
    const formatDeadline = (value?: string): string => {
        if (!value) {
            return 'N/A';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-violet-900">AI generated tasks preview</h3>
                <span className="text-xs font-medium text-violet-700">{tasks.length} items</span>
            </div>

            {message && (
                <p className="text-xs text-violet-700">{message}</p>
            )}

            {tasks.length > 0 && (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {tasks.map((task, index) => (
                        <div
                            key={`${task.title}-${index}`}
                            className="rounded-xl border border-violet-100 bg-white/90 p-3"
                        >
                            <p className="text-sm font-medium text-neutral-900">{task.title}</p>
                            <p className="text-xs text-neutral-500 mt-1">
                                Deadline: {formatDeadline(task.scheduledDate)}
                            </p>
                            {task.description && (
                                <p className="text-xs text-neutral-600 mt-1">{task.description}</p>
                            )}
                            {typeof task.estimatedMinutes === 'number' && (
                                <p className="text-[11px] font-medium text-neutral-500 mt-1">
                                    ~{task.estimatedMinutes} min
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={onDiscard}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                    Discard
                </button>
                <button
                    onClick={onAccept}
                    disabled={tasks.length === 0}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-600 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Accept
                </button>
            </div>
        </div>
    );
}

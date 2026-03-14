'use client';

import { BookOpenText, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSessionStore } from '@/store/session.store';
import { useStudyPlan } from '@/features/study-plan/api';
import { useNodeContents } from '@/features/roadmaps/api';

interface SessionContentProps {
    className?: string;
}

function toPositiveNumber(value: string | number | undefined | null): number | null {
    if (value === undefined || value === null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function SessionContent({ className }: SessionContentProps) {
    const selectedNode = useSessionStore((state) => state.selectedNode);
    const activeStudyPlanId = useSessionStore((state) => state.activeStudyPlanId);

    const studyPlanId = toPositiveNumber(selectedNode?.planId ?? activeStudyPlanId);
    const nodeId = selectedNode?.roadmapNodeId ?? toPositiveNumber(selectedNode?.id);

    const { data: studyPlan, isLoading: isPlanLoading } = useStudyPlan(
        studyPlanId ? String(studyPlanId) : undefined
    );

    const roadmapId = studyPlan?.roadmapId ?? null;

    const {
        data: nodeContents = [],
        isLoading: isContentsLoading,
        isFetching: isContentsFetching,
        error: contentsError,
    } = useNodeContents(roadmapId, nodeId ?? null);

    const isLoading = isPlanLoading || (Boolean(roadmapId) && isContentsLoading);
    const hasContext = Boolean(selectedNode && nodeId && studyPlanId);
    const errorMessage = contentsError instanceof Error
        ? contentsError.message
        : 'Failed to load module contents';

    return (
        <div
            className={cn(
                'rounded-3xl bg-white/70 backdrop-blur-xl border border-neutral-200/60 p-6 shadow-xl shadow-neutral-900/5',
                className
            )}
        >
            <div className="flex items-center gap-2.5 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/30">
                    <BookOpenText className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Content</h3>
            </div>

            <p className="text-sm text-neutral-500 mb-4 ml-10">
                Learning materials for this module
            </p>

            {!hasContext && (
                <div className="rounded-2xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-500">
                    Select tasks from My Schedule to load module content.
                </div>
            )}

            {hasContext && isLoading && (
                <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading module content...
                </div>
            )}

            {hasContext && !isLoading && contentsError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {errorMessage}
                </div>
            )}

            {hasContext && !isLoading && !contentsError && nodeContents.length === 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-500">
                    No content found for this module.
                </div>
            )}

            {hasContext && !isLoading && !contentsError && nodeContents.length > 0 && (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {nodeContents.map((content) => (
                        <div
                            key={content.id}
                            className="rounded-2xl border border-neutral-200 bg-white/80 p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-neutral-900 leading-snug">{content.title}</h4>
                                    {content.description && (
                                        <p className="mt-1 text-sm text-neutral-600 line-clamp-3">{content.description}</p>
                                    )}
                                </div>
                                <span className="shrink-0 rounded-lg bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                                    {content.contentType}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-xs text-neutral-500">
                                    {content.estimatedMinutes ? `${content.estimatedMinutes} min` : 'Duration not set'}
                                </span>
                                {content.url && (
                                    <a
                                        href={content.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800"
                                    >
                                        Open
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isContentsFetching && !isLoading && (
                <p className="mt-3 text-xs text-neutral-400">Refreshing content...</p>
            )}
        </div>
    );
}

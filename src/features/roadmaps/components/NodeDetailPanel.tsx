'use client';

import { useRouter } from 'next/navigation';
import { X, Clock, FileText, BookOpen, Video, Circle, Play } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RoadmapNodeData, DifficultyLevel } from './RoadmapNode';

interface NodeResource {
    id: string;
    title: string;
    type: 'docs' | 'article' | 'video';
}

interface NodeTask {
    id: string;
    title: string;
    isCompleted: boolean;
}

interface NodeDetailData extends RoadmapNodeData {
    description: string;
    prerequisites: string[];
    resources: NodeResource[];
    tasks: NodeTask[];
}

interface NodeDetailPanelProps {
    node: NodeDetailData | null;
    onClose: () => void;
    className?: string;
}

const difficultyConfig: Record<DifficultyLevel, { label: string; color: string }> = {
    beginner: { label: 'Beginner', color: 'bg-emerald-100 text-emerald-700' },
    intermediate: { label: 'Intermediate', color: 'bg-amber-100 text-amber-700' },
    advanced: { label: 'Advanced', color: 'bg-red-100 text-red-700' },
};

const resourceIcons = {
    docs: FileText,
    article: BookOpen,
    video: Video,
};

export function NodeDetailPanel({ node, onClose, className }: NodeDetailPanelProps) {
    const router = useRouter();

    if (!node) return null;

    const difficulty = difficultyConfig[node.difficulty];

    const handleStartLearning = () => {
        // Navigate to study plan page (hardcoded to /study-plans/1 for now)
        router.push('/study-plans/1');
    };

    return (
        <div className={cn(
            "w-full lg:w-96 xl:w-[420px] rounded-3xl bg-white/90 backdrop-blur-xl border border-neutral-200/60 shadow-2xl shadow-neutral-900/10 flex flex-col max-h-[calc(100vh-200px)] lg:max-h-full",
            className
        )}>
            {/* Header */}
            <div className="p-4 lg:p-6 border-b border-neutral-100">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-neutral-900 mb-2">
                            {node.title}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
                                difficulty.color
                            )}>
                                {difficulty.label}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-neutral-500">
                                <Clock className="h-4 w-4" />
                                {node.duration} min
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

                <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                    {node.description}
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
                {/* Prerequisites */}
                {node.prerequisites.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-neutral-900 mb-3">Prerequisites</h3>
                        <div className="space-y-2">
                            {node.prerequisites.map((prereq, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 text-sm text-neutral-600"
                                >
                                    <Circle className="h-4 w-4 text-neutral-400" />
                                    {prereq}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resources */}
                {node.resources.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-neutral-900 mb-3">Recommended Resources</h3>
                        <div className="space-y-2">
                            {node.resources.map(resource => {
                                const Icon = resourceIcons[resource.type];
                                return (
                                    <div
                                        key={resource.id}
                                        className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 hover:bg-neutral-100 transition-colors cursor-pointer"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                                            <Icon className="h-4 w-4 text-neutral-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">
                                                {resource.title}
                                            </p>
                                            <p className="text-xs text-neutral-500 capitalize">
                                                {resource.type}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-100">
                <button
                    onClick={handleStartLearning}
                    className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-white shadow-xl transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40"
                >
                    <Play className="h-5 w-5" fill="currentColor" />
                    Start Learning
                </button>
            </div>
        </div>
    );
}

export type { NodeDetailData, NodeResource, NodeTask };


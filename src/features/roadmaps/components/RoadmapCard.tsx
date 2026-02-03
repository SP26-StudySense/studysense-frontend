'use client';

import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { RoadmapTemplate, UserLearningRoadmap } from '../types';
import { cn } from '@/shared/lib/utils';

interface RoadmapCardProps {
    roadmap: RoadmapTemplate | UserLearningRoadmap;
    variant: 'template' | 'learning';
    onPreview?: () => void;
}

const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    advanced: 'bg-red-100 text-red-700 border-red-200',
};

export function RoadmapCard({ roadmap, variant, onPreview }: RoadmapCardProps) {
    const router = useRouter();
    const Icon = LucideIcons[roadmap.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }> || LucideIcons.Map;

    const isLearningRoadmap = (r: RoadmapTemplate | UserLearningRoadmap): r is UserLearningRoadmap => {
        return 'progress' in r;
    };

    const handleClick = () => {
        if (variant === 'learning' && isLearningRoadmap(roadmap)) {
            // Continue learning -> go to dashboard
            router.push('/dashboard');
        } else {
            // Start new template roadmap -> go to survey first
            router.push('/surveys/initial-survey');
        }
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTimeSpent = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-500 cursor-pointer",
                variant === 'template'
                    ? "bg-white border-neutral-200 hover:shadow-xl hover:-translate-y-1"
                    : "bg-gradient-to-br from-white to-neutral-50 border-neutral-200 hover:shadow-xl hover:scale-[1.02]"
            )}
        >
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
                        variant === 'template'
                            ? "bg-neutral-100 text-neutral-900 group-hover:bg-[#00bae2]/10 group-hover:text-[#00bae2]"
                            : "bg-[#00bae2]/10 text-[#00bae2]"
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <span className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium",
                        difficultyColors[roadmap.difficulty]
                    )}>
                        {roadmap.difficulty.charAt(0).toUpperCase() + roadmap.difficulty.slice(1)}
                    </span>
                </div>

                <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-[#00bae2] transition-colors">
                    {roadmap.title}
                </h3>
                <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                    {roadmap.description}
                </p>

                {/* Stats */}
                {variant === 'template' ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <LucideIcons.Target className="h-3.5 w-3.5" />
                            <span>{roadmap.totalNodes} nodes</span>
                        </div>
                        {/* Eye Icon for Preview */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onPreview?.();
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 hover:bg-[#00bae2]/10 hover:text-[#00bae2] text-neutral-600 transition-all duration-200 hover:scale-110"
                            title="Preview roadmap"
                        >
                            <LucideIcons.Eye className="h-4 w-4" />
                        </button>
                    </div>
                ) : isLearningRoadmap(roadmap) && (
                    <div className="space-y-3">
                        {/* Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-medium text-neutral-700">Progress</span>
                                <span className="text-xs font-semibold text-[#00bae2]">{roadmap.progress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#00bae2] to-[#00d4ff] transition-all duration-500"
                                    style={{ width: `${roadmap.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <div className="flex items-center gap-1.5">
                                <LucideIcons.CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                <span>{roadmap.completedNodes}/{roadmap.totalNodes}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <LucideIcons.Clock className="h-3.5 w-3.5" />
                                <span>{formatTimeSpent(roadmap.timeSpent)}</span>
                            </div>
                        </div>

                        {/* Last Accessed */}
                        <div className="text-xs text-neutral-400">
                            Last accessed {formatDate(roadmap.lastAccessed)}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="mt-auto border-t border-neutral-100 p-4 bg-neutral-50/50 group-hover:bg-neutral-50 transition-colors">
                <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 group-hover:text-[#00bae2] transition-colors">
                    {variant === 'template' ? 'Start Learning' : 'Continue'}
                    <LucideIcons.ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
            </div>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#00bae2]/0 via-[#00bae2]/0 to-[#fec5fb]/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
        </div>
    );
}

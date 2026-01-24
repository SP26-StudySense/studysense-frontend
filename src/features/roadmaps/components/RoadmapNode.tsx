'use client';

import { CheckCircle2, Clock, Circle, Lock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type NodeStatus = 'done' | 'in_progress' | 'not_started' | 'locked';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface RoadmapNodeData {
    id: string;
    title: string;
    status: NodeStatus;
    completedTasks: number;
    totalTasks: number;
    duration: number; // minutes
    difficulty: DifficultyLevel;
    x: number;
    y: number;
}

interface RoadmapNodeProps {
    node: RoadmapNodeData;
    isSelected: boolean;
    onClick: (node: RoadmapNodeData) => void;
}

const statusConfig = {
    done: {
        bg: 'bg-gradient-to-br from-[#00bae2]/20 to-[#00bae2]/5',
        border: 'border-[#00bae2]',
        icon: CheckCircle2,
        iconColor: 'text-[#00bae2]',
        badge: 'bg-[#00bae2]/20 text-[#00889e]',
        badgeText: 'Done',
    },
    in_progress: {
        bg: 'bg-gradient-to-br from-amber-100/80 to-amber-50/50',
        border: 'border-amber-400',
        icon: Circle,
        iconColor: 'text-amber-500',
        badge: 'bg-amber-100 text-amber-700',
        badgeText: 'In Progress',
    },
    not_started: {
        bg: 'bg-white/80',
        border: 'border-neutral-200',
        icon: Circle,
        iconColor: 'text-neutral-400',
        badge: 'bg-neutral-100 text-neutral-500',
        badgeText: 'Not Started',
    },
    locked: {
        bg: 'bg-neutral-50/80',
        border: 'border-neutral-200 border-dashed',
        icon: Lock,
        iconColor: 'text-neutral-400',
        badge: 'bg-neutral-100 text-neutral-400',
        badgeText: 'Locked',
    },
};

const difficultyColors = {
    beginner: 'bg-emerald-500',
    intermediate: 'bg-amber-500',
    advanced: 'bg-red-500',
};

export function RoadmapNode({ node, isSelected, onClick }: RoadmapNodeProps) {
    const config = statusConfig[node.status];
    const StatusIcon = config.icon;

    return (
        <button
            onClick={() => onClick(node)}
            className={cn(
                "absolute w-48 h-[120px] rounded-2xl border-2 p-4 backdrop-blur-xl shadow-lg transition-all duration-300 text-left flex flex-col justify-between",
                config.bg,
                config.border,
                isSelected && "ring-4 ring-violet-500/30 scale-105 shadow-xl",
                node.status !== 'locked' && "hover:scale-105 hover:shadow-xl cursor-pointer",
                node.status === 'locked' && "opacity-60 cursor-not-allowed"
            )}
            style={{ left: node.x, top: node.y }}
            disabled={node.status === 'locked'}
        >
            {/* Difficulty indicator */}
            <div className={cn(
                "absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full",
                difficultyColors[node.difficulty]
            )} />

            {/* Title */}
            <div className="flex items-start gap-2 mb-2">
                <StatusIcon className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconColor)} />
                <h4 className="font-semibold text-sm text-neutral-900 line-clamp-2">
                    {node.title}
                </h4>
            </div>

            {/* Status badge */}
            <div className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium mb-2",
                config.badge
            )}>
                {config.badgeText}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{node.completedTasks}/{node.totalTasks} tasks</span>
                <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {node.duration}m
                </span>
            </div>
        </button>
    );
}

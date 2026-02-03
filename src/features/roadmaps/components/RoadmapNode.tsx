'use client';

import { CheckCircle2, Circle, Lock } from 'lucide-react';
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
    },
    in_progress: {
        bg: 'bg-gradient-to-br from-amber-100/80 to-amber-50/50',
        border: 'border-amber-400',
        icon: Circle,
        iconColor: 'text-amber-500',
    },
    not_started: {
        bg: 'bg-white/80',
        border: 'border-neutral-200',
        icon: Circle,
        iconColor: 'text-neutral-400',
    },
    locked: {
        bg: 'bg-neutral-50/80',
        border: 'border-neutral-200 border-dashed',
        icon: Lock,
        iconColor: 'text-neutral-400',
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
                "absolute w-48 rounded-2xl border-2 p-4 backdrop-blur-xl shadow-lg transition-all duration-300 text-left flex items-center gap-3",
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

            {/* Status Icon */}
            <StatusIcon className={cn("h-5 w-5 shrink-0", config.iconColor)} />

            {/* Title only */}
            <h4 className="font-semibold text-sm text-neutral-900 line-clamp-2">
                {node.title}
            </h4>
        </button>
    );
}


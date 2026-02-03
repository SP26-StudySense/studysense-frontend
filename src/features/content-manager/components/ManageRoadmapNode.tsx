'use client';

import { Circle, Trash2, Edit } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RoadmapNodeDTO, NodeDifficulty } from '@/features/roadmaps/api/types';

interface ManageRoadmapNodeProps {
    node: RoadmapNodeDTO;
    isSelected: boolean;
    onClick: (node: RoadmapNodeDTO) => void;
    onDelete?: (nodeId: number) => void;
    onEdit?: (node: RoadmapNodeDTO) => void;
}

const difficultyColors = {
    [NodeDifficulty.Beginner]: 'bg-emerald-500',
    [NodeDifficulty.Intermediate]: 'bg-amber-500',
    [NodeDifficulty.Advanced]: 'bg-red-500',
} as const;

export function ManageRoadmapNode({ node, isSelected, onClick, onDelete, onEdit }: ManageRoadmapNodeProps) {
    return (
        <div
            onClick={() => onClick(node)}
            className={cn(
                "absolute w-48 rounded-2xl border-2 p-4 backdrop-blur-xl shadow-lg transition-all duration-300 flex items-center gap-3 cursor-pointer group",
                "bg-white/80 border-neutral-200",
                isSelected && "ring-4 ring-[#00bae2]/30 scale-105 shadow-xl border-[#00bae2]",
                "hover:scale-105 hover:shadow-xl"
            )}
            style={{ 
                left: `${(node.orderNo || 0) * 250}px`, 
                top: `${Math.floor(((node.orderNo || 1) - 1) / 4) * 150}px` 
            }}
        >
            {/* Difficulty indicator */}
            <div className={cn(
                "absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full",
                node.difficulty !== null ? difficultyColors[node.difficulty as NodeDifficulty] : 'bg-neutral-400'
            )} />

            {/* Icon */}
            <Circle className="h-5 w-5 shrink-0 text-neutral-400" />

            {/* Title */}
            <h4 className="font-semibold text-sm text-neutral-900 line-clamp-2 flex-1">
                {node.title}
            </h4>

            {/* Action Buttons */}
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {onEdit && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(node);
                        }}
                        className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                        title="Edit Node"
                    >
                        <Edit className="h-3 w-3" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(node.id);
                        }}
                        className="w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                        title="Delete Node"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                )}
            </div>
        </div>
    );
}

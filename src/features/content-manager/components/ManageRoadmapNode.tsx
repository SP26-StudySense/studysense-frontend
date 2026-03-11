'use client';

import { Circle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RoadmapNodeDTO, NodeDifficulty } from '@/features/roadmaps/api/types';

interface ManageRoadmapNodeProps {
  node: RoadmapNodeDTO;
  isSelected: boolean;
  onClick: (node: RoadmapNodeDTO) => void;
  style?: React.CSSProperties;
}

const difficultyColors = {
  [NodeDifficulty.Beginner]: 'bg-emerald-500',
  [NodeDifficulty.Intermediate]: 'bg-amber-500',
  [NodeDifficulty.Advanced]: 'bg-red-500',
  'Beginner': 'bg-emerald-500',
  'Intermediate': 'bg-amber-500',
  'Advanced': 'bg-red-500',
} as const;

export function ManageRoadmapNode({ node, isSelected, onClick, style }: ManageRoadmapNodeProps) {
  // Get difficulty color - handle both enum and string values
  const getDifficultyColor = () => {
    if (node.difficulty === null || node.difficulty === undefined) return 'bg-neutral-400';
    
    // Check if it's a number (enum)
    if (typeof node.difficulty === 'number') {
      return difficultyColors[node.difficulty as NodeDifficulty] || 'bg-neutral-400';
    }
    
    // Check if it's a string
    if (typeof node.difficulty === 'string') {
      return difficultyColors[node.difficulty as keyof typeof difficultyColors] || 'bg-neutral-400';
    }
    
    return 'bg-neutral-400';
  };

  return (
    <div
      onClick={() => onClick(node)}
      className={cn(
        "absolute w-48 rounded-2xl border-2 p-4 backdrop-blur-xl shadow-lg transition-all duration-300 flex items-center gap-3 cursor-pointer group",
        "bg-white/80 border-neutral-200",
        isSelected && "ring-4 ring-[#00bae2]/30 scale-105 shadow-xl border-[#00bae2]",
        "hover:scale-105 hover:shadow-xl"
      )}
      style={style}
    >
      <div
        className={cn(
          "absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full",
          getDifficultyColor()
        )}
      />
      <Circle className="h-5 w-5 shrink-0 text-neutral-400" />
      <h4 className="font-semibold text-sm text-neutral-900 line-clamp-2 flex-1">{node.title}</h4>
    </div>
  );
}

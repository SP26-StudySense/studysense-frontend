export type RoadmapDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type RoadmapCategory = 'frontend' | 'backend' | 'devops' | 'ai-data' | 'mobile' | 'other';

export interface RoadmapTemplate {
    id: string;
    title: string;
    description: string;
    difficulty: RoadmapDifficulty;
    category: RoadmapCategory;
    estimatedHours: number;
    totalNodes: number;
    icon: string; // Lucide icon name
}

export interface UserLearningRoadmap {
    id: string;
    templateId: string;
    title: string;
    description: string;
    difficulty: RoadmapDifficulty;
    category: RoadmapCategory;
    progress: number; // 0-100
    completedNodes: number;
    totalNodes: number;
    estimatedHours: number;
    lastAccessed: Date;
    timeSpent: number; // in minutes
    icon: string; // Lucide icon name
}

export interface RoadmapFilters {
    search: string;
    difficulty: RoadmapDifficulty | 'all';
    category: RoadmapCategory | 'all';
}

import { 
  RoadmapListItemDTO, 
  RoadmapGraphDTO, 
  RoadmapNodeDTO, 
  RoadmapEdgeDTO,
  NodeContentItemDTO,
  NodeDifficulty,
  EdgeType
} from '@/features/roadmaps/api/types';

export interface ContentManager {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  learningSubjectId: number;
  learningSubjectName: string;
  categoryId: number;
  categoryName: string;
  joinedAt: string;
}

// Extend API types for Content Manager use
export interface ContentManagerRoadmap extends RoadmapListItemDTO {
  subjectName: string;
  nodeCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentManagerRoadmapDetail extends RoadmapGraphDTO {
  subjectName: string;
}

export interface RoadmapVersion {
  version: number;
  publishedAt: string;
  changes: string;
}

export interface ContentManagerStats {
  totalRoadmaps: number;
  publishedRoadmaps: number;
  draftRoadmaps: number;
  totalViews: number;
  totalLikes: number;
  totalNodes: number;
}

export interface RoadmapFilters {
  search: string;
  version?: number;
  isLatest?: boolean;
  pageIndex: number;
  pageSize: number;
}

export interface NodeContentWithActions extends NodeContentItemDTO {
  isEditing?: boolean;
}

export type { 
  RoadmapNodeDTO, 
  RoadmapEdgeDTO, 
  NodeContentItemDTO,
  NodeDifficulty,
  EdgeType
};

import { RoadmapTemplate, UserLearningRoadmap, RoadmapFilters } from './types';

export const TEMPLATE_ROADMAPS: RoadmapTemplate[] = [
    {
        id: 'frontend-basics',
        title: 'Frontend Engineering',
        description: 'Master HTML, CSS, JavaScript, and modern frameworks like React and Vue. Build responsive, accessible interfaces.',
        difficulty: 'beginner',
        category: 'frontend',
        estimatedHours: 120,
        totalNodes: 24,
        icon: 'Monitor',
    },
    {
        id: 'react-deep-dive',
        title: 'React Mastery',
        description: 'Deep dive into React ecosystem including hooks, state management, performance optimization, and testing.',
        difficulty: 'intermediate',
        category: 'frontend',
        estimatedHours: 80,
        totalNodes: 18,
        icon: 'Boxes',
    },
    {
        id: 'backend-fundamentals',
        title: 'Backend Development',
        description: 'Dive deep into server-side logic, databases, APIs, and authentication. Learn Python, Go, Node.js and SQL.',
        difficulty: 'beginner',
        category: 'backend',
        estimatedHours: 150,
        totalNodes: 28,
        icon: 'Server',
    },
    {
        id: 'nodejs-advanced',
        title: 'Node.js Expert Path',
        description: 'Advanced Node.js patterns, microservices, event-driven architecture, and scalable backend systems.',
        difficulty: 'advanced',
        category: 'backend',
        estimatedHours: 100,
        totalNodes: 22,
        icon: 'FileCode',
    },
    {
        id: 'devops-essentials',
        title: 'DevOps Engineering',
        description: 'Containerization, CI/CD pipelines, Cloud Infrastructure, and automation tools.',
        difficulty: 'intermediate',
        category: 'devops',
        estimatedHours: 90,
        totalNodes: 20,
        icon: 'Container',
    },
    {
        id: 'kubernetes-mastery',
        title: 'Kubernetes Mastery',
        description: 'Container orchestration, deployment strategies, service mesh, and production-grade K8s clusters.',
        difficulty: 'advanced',
        category: 'devops',
        estimatedHours: 70,
        totalNodes: 16,
        icon: 'Globe',
    },
    {
        id: 'ai-ml-fundamentals',
        title: 'AI & Machine Learning',
        description: 'Machine Learning fundamentals, Data Science pipelines, and working with modern LLMs.',
        difficulty: 'intermediate',
        category: 'ai-data',
        estimatedHours: 140,
        totalNodes: 30,
        icon: 'BrainCircuit',
    },
    {
        id: 'deep-learning',
        title: 'Deep Learning Path',
        description: 'Neural networks, computer vision, NLP, and deploying AI models at scale.',
        difficulty: 'advanced',
        category: 'ai-data',
        estimatedHours: 160,
        totalNodes: 32,
        icon: 'NetworkConnections',
    },
    {
        id: 'mobile-ios',
        title: 'iOS Development',
        description: 'Build native iOS apps with Swift, SwiftUI, and modern Apple frameworks.',
        difficulty: 'beginner',
        category: 'mobile',
        estimatedHours: 110,
        totalNodes: 25,
        icon: 'Smartphone',
    },
    {
        id: 'flutter-cross-platform',
        title: 'Flutter Development',
        description: 'Cross-platform mobile development with Flutter and Dart for iOS and Android.',
        difficulty: 'intermediate',
        category: 'mobile',
        estimatedHours: 95,
        totalNodes: 21,
        icon: 'TabletSmartphone',
    },
    {
        id: 'system-design',
        title: 'System Design',
        description: 'Design scalable distributed systems, learn architecture patterns, and prepare for system design interviews.',
        difficulty: 'advanced',
        category: 'other',
        estimatedHours: 85,
        totalNodes: 19,
        icon: 'Network',
    },
    {
        id: 'typescript-mastery',
        title: 'TypeScript Mastery',
        description: 'Advanced TypeScript patterns, generics, type inference, and building type-safe applications.',
        difficulty: 'intermediate',
        category: 'frontend',
        estimatedHours: 60,
        totalNodes: 15,
        icon: 'Code',
    },
];

export const USER_LEARNING_ROADMAPS: UserLearningRoadmap[] = [
    {
        id: 'user-frontend-1',
        templateId: 'frontend-basics',
        title: 'Frontend Engineering',
        description: 'Master HTML, CSS, JavaScript, and modern frameworks like React and Vue.',
        difficulty: 'beginner',
        category: 'frontend',
        progress: 65,
        completedNodes: 16,
        totalNodes: 24,
        estimatedHours: 120,
        lastAccessed: new Date('2026-01-25T14:30:00'),
        timeSpent: 1840, // minutes
        icon: 'Monitor',
    },
    {
        id: 'user-react-1',
        templateId: 'react-deep-dive',
        title: 'React Mastery',
        description: 'Deep dive into React ecosystem including hooks, state management, and performance optimization.',
        difficulty: 'intermediate',
        category: 'frontend',
        progress: 35,
        completedNodes: 6,
        totalNodes: 18,
        estimatedHours: 80,
        lastAccessed: new Date('2026-01-27T10:15:00'),
        timeSpent: 520,
        icon: 'Boxes',
    },
    {
        id: 'user-devops-1',
        templateId: 'devops-essentials',
        title: 'DevOps Engineering',
        description: 'Containerization, CI/CD pipelines, Cloud Infrastructure.',
        difficulty: 'intermediate',
        category: 'devops',
        progress: 12,
        completedNodes: 2,
        totalNodes: 20,
        estimatedHours: 90,
        lastAccessed: new Date('2026-01-20T09:00:00'),
        timeSpent: 180,
        icon: 'Container',
    },
];

// Helper function to filter roadmaps
export function filterRoadmaps<T extends RoadmapTemplate | UserLearningRoadmap>(
    roadmaps: T[],
    filters: RoadmapFilters
): T[] {
    return roadmaps.filter((roadmap) => {
        // Search filter
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
            !filters.search ||
            roadmap.title.toLowerCase().includes(searchLower) ||
            roadmap.description.toLowerCase().includes(searchLower);

        // Difficulty filter
        const matchesDifficulty =
            filters.difficulty === 'all' || roadmap.difficulty === filters.difficulty;

        // Category filter
        const matchesCategory =
            filters.category === 'all' || roadmap.category === filters.category;

        return matchesSearch && matchesDifficulty && matchesCategory;
    });
}

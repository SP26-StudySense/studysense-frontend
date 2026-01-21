'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { RoadmapGraph, RoadmapEdge } from './components/RoadmapGraph';
import { RoadmapNodeData } from './components/RoadmapNode';
import { NodeDetailPanel, NodeDetailData } from './components/NodeDetailPanel';

// Mock data - wider spacing for better visibility
const MOCK_NODES: RoadmapNodeData[] = [
    { id: '1', title: 'HTML Basics', status: 'done', completedTasks: 4, totalTasks: 4, duration: 120, difficulty: 'beginner', x: 320, y: 20 },
    { id: '2', title: 'CSS Fundamentals', status: 'done', completedTasks: 4, totalTasks: 4, duration: 180, difficulty: 'beginner', x: 80, y: 180 },
    { id: '3', title: 'JavaScript Basics', status: 'done', completedTasks: 5, totalTasks: 5, duration: 240, difficulty: 'beginner', x: 480, y: 180 },
    { id: '4', title: 'Tailwind CSS', status: 'in_progress', completedTasks: 2, totalTasks: 4, duration: 150, difficulty: 'intermediate', x: 20, y: 360 },
    { id: '5', title: 'React Fundamentals', status: 'in_progress', completedTasks: 3, totalTasks: 5, duration: 300, difficulty: 'intermediate', x: 280, y: 360 },
    { id: '6', title: 'Git & Version Control', status: 'done', completedTasks: 4, totalTasks: 4, duration: 120, difficulty: 'beginner', x: 560, y: 360 },
    { id: '7', title: 'Component Libraries', status: 'not_started', completedTasks: 0, totalTasks: 4, duration: 180, difficulty: 'intermediate', x: 20, y: 540 },
    { id: '8', title: 'TypeScript', status: 'not_started', completedTasks: 0, totalTasks: 5, duration: 240, difficulty: 'intermediate', x: 240, y: 540 },
    { id: '9', title: 'React Hooks Deep', status: 'not_started', completedTasks: 0, totalTasks: 4, duration: 200, difficulty: 'intermediate', x: 460, y: 540 },
    { id: '10', title: 'CI/CD Pipelines', status: 'locked', completedTasks: 0, totalTasks: 3, duration: 150, difficulty: 'advanced', x: 680, y: 540 },
    { id: '11', title: 'Next.js Fundamentals', status: 'locked', completedTasks: 0, totalTasks: 6, duration: 300, difficulty: 'advanced', x: 350, y: 720 },
];

const MOCK_EDGES: RoadmapEdge[] = [
    { from: '1', to: '2' },
    { from: '1', to: '3' },
    { from: '2', to: '4' },
    { from: '3', to: '5' },
    { from: '3', to: '6' },
    { from: '4', to: '7' },
    { from: '5', to: '8' },
    { from: '5', to: '9' },
    { from: '6', to: '10' },
    { from: '8', to: '11' },
    { from: '9', to: '11' },
];

const MOCK_NODE_DETAILS: Record<string, Omit<NodeDetailData, keyof RoadmapNodeData>> = {
    '9': {
        description: 'Master React hooks including useState, useEffect, useContext, useReducer, and custom hooks.',
        prerequisites: ['React Fundamentals'],
        resources: [
            { id: 'r1', title: 'Hooks API Reference', type: 'docs' },
            { id: 'r2', title: 'useEffect Complete Guide', type: 'article' },
            { id: 'r3', title: 'Building Custom Hooks', type: 'video' },
        ],
        tasks: [
            { id: 't1', title: 'Master useState and useReducer', isCompleted: false },
            { id: 't2', title: 'Understand useEffect lifecycle', isCompleted: false },
            { id: 't3', title: 'Use useContext for state sharing', isCompleted: false },
            { id: 't4', title: 'Create custom reusable hooks', isCompleted: false },
        ],
    },
};

export function RoadmapsPage() {
    const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);

    const handleNodeSelect = (node: RoadmapNodeData) => {
        setSelectedNode(node);
    };

    const handleClosePanel = () => {
        setSelectedNode(null);
    };

    const getNodeDetail = (node: RoadmapNodeData | null): NodeDetailData | null => {
        if (!node) return null;
        const details = MOCK_NODE_DETAILS[node.id] || {
            description: `Learn the fundamentals of ${node.title} and build practical skills.`,
            prerequisites: [],
            resources: [],
            tasks: Array.from({ length: node.totalTasks }, (_, i) => ({
                id: `task-${i}`,
                title: `Task ${i + 1}`,
                isCompleted: i < node.completedTasks,
            })),
        };
        return { ...node, ...details };
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-160px)]">
            {/* Left - Graph */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Search & Filter Bar */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search topics..."
                            className="w-full rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
                        />
                    </div>
                    <button className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-xl px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition-all">
                        <Filter className="h-4 w-4" />
                        All Levels
                    </button>
                </div>

                {/* Graph */}
                <RoadmapGraph
                    nodes={MOCK_NODES}
                    edges={MOCK_EDGES}
                    selectedNodeId={selectedNode?.id || null}
                    onNodeSelect={handleNodeSelect}
                    className="flex-1"
                />
            </div>

            {/* Right - Detail Panel */}
            {selectedNode && (
                <NodeDetailPanel
                    node={getNodeDetail(selectedNode)}
                    onClose={handleClosePanel}
                />
            )}
        </div>
    );
}

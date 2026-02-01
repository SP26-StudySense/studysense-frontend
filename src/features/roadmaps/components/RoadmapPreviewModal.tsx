'use client';

import { X, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { RoadmapTemplate } from '../types';
import { RoadmapDetail } from '../RoadmapDetail';
import * as LucideIcons from 'lucide-react';

interface RoadmapPreviewModalProps {
    roadmap: RoadmapTemplate;
    isOpen: boolean;
    onClose: () => void;
}

const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    advanced: 'bg-red-100 text-red-700 border-red-200',
};

type TabType = 'overview' | 'roadmap';

export function RoadmapPreviewModal({ roadmap, isOpen, onClose }: RoadmapPreviewModalProps) {
    const Icon = LucideIcons[roadmap.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }> || LucideIcons.Map;
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    if (!isOpen) return null;

    const handleOpenFullScreen = () => {
        window.open(`/roadmaps/${roadmap.id}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                    <X className="h-5 w-5 text-neutral-700" />
                </button>

                {/* Header with gradient background */}
                <div className="relative bg-gradient-to-br from-[#00bae2]/10 to-[#fec5fb]/10 p-8 border-b border-neutral-200 flex-shrink-0">
                    <div className="flex items-start gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg text-[#00bae2]">
                            <Icon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-neutral-900">
                                    {roadmap.title}
                                </h2>
                                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${difficultyColors[roadmap.difficulty]}`}>
                                    {roadmap.difficulty.charAt(0).toUpperCase() + roadmap.difficulty.slice(1)}
                                </span>
                            </div>
                            <p className="text-neutral-600 mb-4">
                                {roadmap.description}
                            </p>

                            {/* Tabs */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'overview'
                                            ? 'bg-white text-[#00bae2] shadow-md'
                                            : 'bg-transparent text-neutral-600 hover:bg-white/50'
                                        }`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('roadmap')}
                                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'roadmap'
                                            ? 'bg-white text-[#00bae2] shadow-md'
                                            : 'bg-transparent text-neutral-600 hover:bg-white/50'
                                        }`}
                                >
                                    Roadmap Graph
                                </button>
                                <button
                                    onClick={handleOpenFullScreen}
                                    className="ml-auto px-4 py-2 rounded-xl font-medium text-sm bg-white/50 text-neutral-700 hover:bg-white transition-all flex items-center gap-2"
                                    title="Open in full screen"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Full Screen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'overview' ? (
                        <div className="p-8 space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                                    <div className="text-sm text-neutral-600 mb-1">Duration</div>
                                    <div className="text-2xl font-bold text-neutral-900">{roadmap.estimatedHours}h</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                                    <div className="text-sm text-neutral-600 mb-1">Total Nodes</div>
                                    <div className="text-2xl font-bold text-neutral-900">{roadmap.totalNodes}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                                    <div className="text-sm text-neutral-600 mb-1">Category</div>
                                    <div className="text-lg font-semibold text-neutral-900 capitalize">{roadmap.category.replace('-', ' ')}</div>
                                </div>
                            </div>

                            {/* What You'll Learn */}
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-3">What You'll Learn</h3>
                                <div className="space-y-2">
                                    {getWhatYouLearn(roadmap.category).map((item, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00bae2]/10 flex items-center justify-center mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-[#00bae2]" />
                                            </div>
                                            <p className="text-sm text-neutral-700">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Prerequisites */}
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Prerequisites</h3>
                                <div className="flex flex-wrap gap-2">
                                    {getPrerequisites(roadmap.difficulty).map((prereq, index) => (
                                        <span key={index} className="px-3 py-1.5 rounded-full bg-neutral-100 text-sm text-neutral-700 border border-neutral-200">
                                            {prereq}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[600px] bg-neutral-50">
                            <RoadmapDetail roadmapId={roadmap.id} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-neutral-50 border-t border-neutral-200 flex gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-2xl border border-neutral-200 bg-white text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            window.location.href = `/surveys/initial-survey`;
                        }}
                        className="flex-1 px-6 py-3 rounded-2xl bg-[#00bae2] text-white font-semibold hover:bg-[#00a8d0] transition-colors shadow-lg shadow-[#00bae2]/20"
                    >
                        Start Learning
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper functions to generate preview content
function getWhatYouLearn(category: string): string[] {
    const learning: Record<string, string[]> = {
        frontend: [
            'Build responsive and accessible user interfaces',
            'Master modern JavaScript frameworks and libraries',
            'Understand state management and component architecture',
            'Implement best practices for performance optimization',
        ],
        backend: [
            'Design and implement RESTful APIs',
            'Work with databases and data modeling',
            'Implement authentication and authorization',
            'Build scalable server-side applications',
        ],
        devops: [
            'Set up CI/CD pipelines for automated deployments',
            'Containerize applications with Docker',
            'Orchestrate containers with Kubernetes',
            'Monitor and optimize infrastructure',
        ],
        'ai-data': [
            'Understand machine learning fundamentals',
            'Build and train neural network models',
            'Work with data preprocessing and analysis',
            'Deploy AI models in production',
        ],
        mobile: [
            'Build native mobile applications',
            'Implement mobile-specific UI/UX patterns',
            'Work with device features and APIs',
            'Optimize app performance and battery usage',
        ],
        other: [
            'Master advanced programming concepts',
            'Design scalable system architectures',
            'Apply software engineering best practices',
            'Solve complex technical challenges',
        ],
    };

    return learning[category] || learning.other;
}

function getPrerequisites(difficulty: string): string[] {
    const prerequisites: Record<string, string[]> = {
        beginner: ['Basic computer skills', 'Willingness to learn'],
        intermediate: ['Programming fundamentals', 'Basic web/software concepts', '1-2 years experience'],
        advanced: ['Strong programming background', '3+ years experience', 'Computer science fundamentals'],
    };

    return prerequisites[difficulty] || prerequisites.beginner;
}

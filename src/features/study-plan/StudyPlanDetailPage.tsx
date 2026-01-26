'use client';

import { useState } from 'react';
import { Share2, RefreshCw } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { RoadmapTimeline, RoadmapModule } from './components/RoadmapTimeline';
import { ModuleTasksPanel, ModuleData } from './components/ModuleTasksPanel';
import { CalendarView } from './components/CalendarView';

// Mock data matching Roadmap Nodes
const MOCK_MODULES_WITH_TASKS: ModuleData[] = [
    {
        id: '1',
        title: 'HTML Basics',
        status: 'completed',
        tasks: [
            { id: 't1-1', title: 'HTML Document Structure', estimatedMinutes: 30, isCompleted: true },
            { id: 't1-2', title: 'Text Formatting Tags', estimatedMinutes: 30, isCompleted: true },
            { id: 't1-3', title: 'Lists and Links', estimatedMinutes: 30, isCompleted: true },
            { id: 't1-4', title: 'Images and Media', estimatedMinutes: 30, isCompleted: true },
        ]
    },
    {
        id: '2',
        title: 'CSS Fundamentals',
        status: 'completed',
        tasks: [
            { id: 't2-1', title: 'Selectors and Specificity', estimatedMinutes: 45, isCompleted: true },
            { id: 't2-2', title: 'Box Model', estimatedMinutes: 45, isCompleted: true },
            { id: 't2-3', title: 'Flexbox Layout', estimatedMinutes: 45, isCompleted: true },
            { id: 't2-4', title: 'Grid Layout', estimatedMinutes: 45, isCompleted: true },
        ]
    },
    {
        id: '3',
        title: 'JavaScript Basics',
        status: 'completed',
        tasks: [
            { id: 't3-1', title: 'Variables and Data Types', estimatedMinutes: 45, isCompleted: true },
            { id: 't3-2', title: 'Functions and Scope', estimatedMinutes: 45, isCompleted: true },
            { id: 't3-3', title: 'Arrays and Objects', estimatedMinutes: 50, isCompleted: true },
            { id: 't3-4', title: 'DOM Manipulation', estimatedMinutes: 50, isCompleted: true },
            { id: 't3-5', title: 'Events Handling', estimatedMinutes: 50, isCompleted: true },
        ]
    },
    {
        id: '4',
        title: 'Tailwind CSS',
        status: 'in_progress',
        tasks: [
            { id: 't4-1', title: 'Utility First Concept', estimatedMinutes: 30, isCompleted: true },
            { id: 't4-2', title: 'Responsive Design', estimatedMinutes: 40, isCompleted: true },
            { id: 't4-3', title: 'Flexbox & Grid in Tailwind', estimatedMinutes: 40, isCompleted: false },
            { id: 't4-4', title: 'Custom Configuration', estimatedMinutes: 40, isCompleted: false },
        ]
    },
    {
        id: '5',
        title: 'React Fundamentals',
        status: 'in_progress',
        tasks: [
            { id: 't5-1', title: 'JSX and Components', estimatedMinutes: 60, isCompleted: true },
            { id: 't5-2', title: 'Props and State', estimatedMinutes: 60, isCompleted: true },
            { id: 't5-3', title: 'Handling Events', estimatedMinutes: 60, isCompleted: true },
            { id: 't5-4', title: 'Conditional Rendering', estimatedMinutes: 60, isCompleted: false },
            { id: 't5-5', title: 'Lists and Keys', estimatedMinutes: 60, isCompleted: false },
        ]
    },
    {
        id: '6',
        title: 'Git & Version Control',
        status: 'completed',
        tasks: [
            { id: 't6-1', title: 'Basic Commands', estimatedMinutes: 30, isCompleted: true },
            { id: 't6-2', title: 'Branching and Merging', estimatedMinutes: 30, isCompleted: true },
            { id: 't6-3', title: 'Remote Repositories', estimatedMinutes: 30, isCompleted: true },
            { id: 't6-4', title: 'Pull Requests', estimatedMinutes: 30, isCompleted: true },
        ]
    },
    {
        id: '7',
        title: 'Component Libraries',
        status: 'not_started',
        tasks: [
            { id: 't7-1', title: 'Introduction to Shadcn UI', estimatedMinutes: 45, isCompleted: false },
            { id: 't7-2', title: 'Radix UI Primitives', estimatedMinutes: 45, isCompleted: false },
            { id: 't7-3', title: 'Styling and Theming', estimatedMinutes: 45, isCompleted: false },
            { id: 't7-4', title: 'Building Reusable Components', estimatedMinutes: 45, isCompleted: false },
        ]
    },
    {
        id: '8',
        title: 'TypeScript',
        status: 'not_started',
        tasks: [
            { id: 't8-1', title: 'Basic Types', estimatedMinutes: 45, isCompleted: false },
            { id: 't8-2', title: 'Interfaces and Types', estimatedMinutes: 45, isCompleted: false },
            { id: 't8-3', title: 'Generics', estimatedMinutes: 50, isCompleted: false },
            { id: 't8-4', title: 'Utility Types', estimatedMinutes: 50, isCompleted: false },
            { id: 't8-5', title: 'TypeScript with React', estimatedMinutes: 50, isCompleted: false },
        ]
    },
    {
        id: '9',
        title: 'React Hooks Deep',
        status: 'not_started',
        tasks: [
            { id: 't9-1', title: 'Master useState and useReducer', estimatedMinutes: 50, isCompleted: false },
            { id: 't9-2', title: 'Understand useEffect lifecycle', estimatedMinutes: 50, isCompleted: false },
            { id: 't9-3', title: 'Use useContext for state sharing', estimatedMinutes: 50, isCompleted: false },
            { id: 't9-4', title: 'Create custom reusable hooks', estimatedMinutes: 50, isCompleted: false },
        ]
    },
    {
        id: '10',
        title: 'CI/CD Pipelines',
        status: 'locked',
        tasks: [
            { id: 't10-1', title: 'GitHub Actions Basics', estimatedMinutes: 50, isCompleted: false },
            { id: 't10-2', title: 'Building and Testing', estimatedMinutes: 50, isCompleted: false },
            { id: 't10-3', title: 'Deployment Strategies', estimatedMinutes: 50, isCompleted: false },
        ]
    },
    {
        id: '11',
        title: 'Next.js Fundamentals',
        status: 'locked',
        tasks: [
            { id: 't11-1', title: 'App Router Basics', estimatedMinutes: 50, isCompleted: false },
            { id: 't11-2', title: 'Server Components', estimatedMinutes: 50, isCompleted: false },
            { id: 't11-3', title: 'Data Fetching', estimatedMinutes: 50, isCompleted: false },
            { id: 't11-4', title: 'Layouts and Templates', estimatedMinutes: 50, isCompleted: false },
            { id: 't11-5', title: 'API Routes', estimatedMinutes: 50, isCompleted: false },
            { id: 't11-6', title: 'Deployment on Vercel', estimatedMinutes: 50, isCompleted: false },
        ]
    },
];

interface StudyPlanDetailPageProps {
    planId?: string;
}

export function StudyPlanDetailPage({ planId }: StudyPlanDetailPageProps) {
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>('4'); // Default to first in-progress module
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Transform full data to simplified roadmap module format
    const roadmapModules: RoadmapModule[] = MOCK_MODULES_WITH_TASKS.map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        taskCount: m.tasks.length,
        // Mock dates for display
        completedDate: m.status === 'completed' ? 'Oct 15' : undefined,
        dueDate: m.status === 'in_progress' ? 'Oct 30' : undefined,
    }));

    const selectedModule = MOCK_MODULES_WITH_TASKS.find(m => m.id === selectedModuleId) || null;

    // Derived stats
    const totalTasks = MOCK_MODULES_WITH_TASKS.reduce((acc, m) => acc + m.tasks.length, 0);
    const completedTasks = MOCK_MODULES_WITH_TASKS.reduce((acc, m) => acc + m.tasks.filter(t => t.isCompleted).length, 0);
    const progress = Math.round((completedTasks / totalTasks) * 100);

    const planData = {
        trackName: 'Frontend Development',
        title: 'React Professional Path',
        week: 4,
        totalWeeks: 12,
        progress: progress,
        hoursStudied: 18.5,
        totalHours: 60,
        tasksDone: completedTasks,
        totalTasks: totalTasks,
    };

    // Dates with tasks (for calendar indicators)
    const taskDates = [
        new Date(2023, 9, 20),
        new Date(2023, 9, 21),
        new Date(2023, 9, 24),
        new Date(2023, 9, 27),
        new Date(2023, 9, 28),
        selectedDate,
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] pb-10">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#fec5fb]/30 to-[#00bae2]/15 blur-[100px]" />
                <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#00bae2]/20 to-[#fec5fb]/10 blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-[1600px] px-8 py-8 lg:px-16 xl:px-24">
                {/* Header */}
                <div className="mb-8">
                    {/* Track Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 mb-4">
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                        {planData.trackName}
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 mb-1">
                                {planData.title}
                            </h1>
                            <p className="text-neutral-500">
                                Week {planData.week} of {planData.totalWeeks} • {planData.progress}% Completed
                            </p>
                            {/* Progress Bar */}
                            <div className="mt-3 w-64">
                                <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-violet-500 transition-all duration-500"
                                        style={{ width: `${planData.progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 transition-all">
                                <Share2 className="h-4 w-4" />
                                Share Progress
                            </button>
                            <button className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700 transition-all">
                                <RefreshCw className="h-4 w-4" />
                                Sync / Update Plan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatsCard
                                type="hours"
                                value={planData.hoursStudied}
                            />
                            <StatsCard
                                type="tasks"
                                value={planData.tasksDone}
                            />
                        </div>

                        {/* Roadmap Timeline */}
                        <RoadmapTimeline
                            modules={roadmapModules}
                            selectedModuleId={selectedModuleId}
                            onModuleClick={setSelectedModuleId}
                        />
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Calendar */}
                        <CalendarView
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            taskDates={taskDates}
                        />

                        {selectedModule ? (
                            <ModuleTasksPanel
                                module={selectedModule}
                                onClose={() => setSelectedModuleId(null)}
                                className="h-[calc(100vh-450px)] min-h-[400px]"
                            />
                        ) : (
                            <div className="h-[calc(100vh-450px)] min-h-[400px] flex items-center justify-center rounded-3xl bg-white/50 border border-neutral-200/60 p-6 text-neutral-400">
                                <p>Select a module from the timeline to view tasks</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


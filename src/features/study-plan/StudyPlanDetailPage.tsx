'use client';

import { useState } from 'react';
import { Share2, RefreshCw } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { RoadmapTimeline, RoadmapModule } from './components/RoadmapTimeline';
import { CalendarView } from './components/CalendarView';
import { TasksList, Task } from './components/TasksList';

// Mock data for demonstration
const MOCK_MODULES: RoadmapModule[] = [
    {
        id: '1',
        title: 'Module 1: Basics',
        status: 'completed',
        completedDate: 'Oct 12',
    },
    {
        id: '2',
        title: 'Module 2: Pandas',
        status: 'in_progress',
        dueDate: 'Oct 30',
        currentTopic: 'DataFrames Deep Dive',
    },
    {
        id: '3',
        title: 'Module 3: Visualization',
        status: 'locked',
    },
    {
        id: '4',
        title: 'Module 4: Scikit-Learn',
        status: 'locked',
    },
];

const MOCK_TASKS: Task[] = [
    {
        id: '1',
        title: 'Review Week 2 Quiz Corrections',
        duration: 15,
        isCompleted: true,
    },
    {
        id: '2',
        title: 'Read Chapter 4: DataFrames',
        description: 'Focus on indexing and slicing methods',
        duration: 45,
        isCompleted: false,
    },
    {
        id: '3',
        title: 'Practice Coding: Exercise 4.1',
        duration: 30,
        isCompleted: false,
    },
];

interface StudyPlanDetailPageProps {
    planId?: string;
}

export function StudyPlanDetailPage({ planId }: StudyPlanDetailPageProps) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

    // Mock data - replace with actual API data
    const planData = {
        trackName: 'Data Science Track',
        title: 'Python for Data Science',
        week: 3,
        totalWeeks: 12,
        progress: 25,
        hoursStudied: 12.5,
        totalHours: 50,
        tasksDone: 18,
        totalTasks: 72,
    };

    const handleToggleTask = (taskId: string) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
        ));
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
        <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe]">
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
                        <RoadmapTimeline modules={MOCK_MODULES} />
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Calendar */}
                        <CalendarView
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            taskDates={taskDates}
                        />

                        {/* Tasks List */}
                        <TasksList
                            date={selectedDate}
                            tasks={tasks}
                            onToggleTask={handleToggleTask}
                            onAddTask={() => console.log('Add task clicked')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

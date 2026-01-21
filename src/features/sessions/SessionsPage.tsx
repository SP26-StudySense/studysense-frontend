'use client';

import { useState } from 'react';
import { TimerCard } from './components/TimerCard';
import { TaskSelector, SessionTask } from './components/TaskSelector';
import { SessionNotes } from './components/SessionNotes';
import { FocusTips } from './components/FocusTips';

// Mock tasks for demonstration
const MOCK_TASKS: SessionTask[] = [
    {
        id: '1',
        title: 'useEffect for side effects',
        category: 'React Fundamentals',
        subcategory: 'State & Hooks',
        duration: 45,
        isSelected: true,
    },
    {
        id: '2',
        title: 'Custom hooks',
        category: 'React Fundamentals',
        subcategory: 'State & Hooks',
        duration: 60,
        isSelected: false,
    },
    {
        id: '3',
        title: 'Create pages and layouts',
        category: 'Next.js Basics',
        subcategory: 'File-based Routing',
        duration: 45,
        isSelected: false,
    },
    {
        id: '4',
        title: 'Dynamic routes',
        category: 'Next.js Basics',
        subcategory: 'File-based Routing',
        duration: 60,
        isSelected: false,
    },
    {
        id: '5',
        title: 'Server Components',
        category: 'Next.js Basics',
        subcategory: 'Data Fetching',
        duration: 45,
        isSelected: false,
    },
];

export function SessionsPage() {
    const [tasks, setTasks] = useState<SessionTask[]>(MOCK_TASKS);

    const handleToggleTask = (taskId: string) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, isSelected: !task.isSelected } : task
        ));
    };

    return (
        <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Timer & Tasks */}
                <div className="lg:col-span-7 space-y-6">
                    <TimerCard />
                    <TaskSelector
                        tasks={tasks}
                        onToggleTask={handleToggleTask}
                    />
                </div>

                {/* Right Column - Notes & Tips */}
                <div className="lg:col-span-5 space-y-6">
                    <SessionNotes />
                    <FocusTips />
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect } from 'react';
import { TimerCard } from './components/TimerCard';
import { TaskSelector, SessionTask } from './components/TaskSelector';
import { SessionNotes } from './components/SessionNotes';
import { FocusTips } from './components/FocusTips';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { SessionSuccessScreen } from './components/SessionSuccessScreen';
import { useSessionStore, SelectedTask } from '@/store/session.store';
import { useActiveSession } from './hooks';
import { Loader2 } from 'lucide-react';

// Mock tasks for demonstration (used when no tasks selected from roadmap)
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

// Helper to convert SelectedTask to SessionTask format
const convertToSessionTasks = (tasks: SelectedTask[]): SessionTask[] => {
    return tasks.map(task => ({
        id: task.id,
        title: task.title,
        category: 'From Roadmap',
        subcategory: task.description || '',
        duration: task.estimatedMinutes,
        isSelected: !task.isCompleted,
    }));
};

export function SessionsPage() {
    const selectedTasks = useSessionStore((state) => state.selectedTasks);
    const selectedNode = useSessionStore((state) => state.selectedNode);
    const setSelectedTasks = useSessionStore((state) => state.setSelectedTasks);
    const toggleTaskCompletion = useSessionStore((state) => state.toggleTaskCompletion);
    const showSummary = useSessionStore((state) => state.showSummary);
    const setShowSummary = useSessionStore((state) => state.setShowSummary);
    const showSuccess = useSessionStore((state) => state.showSuccess);
    const completeSession = useSessionStore((state) => state.completeSession);
    const setActiveSessionFromApi = useSessionStore((state) => state.setActiveSessionFromApi);
    const hasActiveSession = useSessionStore((state) => state.activeSession !== null);

    const { data: activeSessionData, isLoading } = useActiveSession();

    // Hydrate store from API if active session exists
    useEffect(() => {
        if (activeSessionData && !hasActiveSession) {
            setActiveSessionFromApi(activeSessionData);
        }
    }, [activeSessionData, hasActiveSession, setActiveSessionFromApi]);

    // Initialize with mock tasks if no tasks from roadmap
    useEffect(() => {
        if (selectedTasks.length === 0) {
            const mockSelected: SelectedTask[] = MOCK_TASKS.filter(t => t.isSelected).map(t => ({
                id: t.id,
                title: t.title,
                description: `${t.category} › ${t.subcategory}`,
                estimatedMinutes: t.duration,
                isCompleted: false,
            }));
            setSelectedTasks(mockSelected);
        }
    }, [selectedTasks.length, setSelectedTasks]);

    // Get display tasks - either from store or mock
    const displayTasks: SessionTask[] = selectedTasks.length > 0
        ? convertToSessionTasks(selectedTasks)
        : MOCK_TASKS;

    const handleToggleTask = (taskId: string) => {
        toggleTaskCompletion(taskId);
    };

    const handleSaveAndContinue = () => {
        completeSession();
    };

    const handleSessionEnd = () => {
        // Just show the summary modal, user reviews and then we call API
        setShowSummary(true);
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    // Show success screen (full page)
    if (showSuccess) {
        return <SessionSuccessScreen isOpen={showSuccess} />;
    }

    return (
        <>
            <div className="max-w-[1600px] mx-auto">
                {/* Show selected node title if available */}
                {selectedNode && (
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                        <p className="text-sm text-emerald-600 font-medium">Currently studying:</p>
                        <h2 className="text-lg font-bold text-neutral-900">{selectedNode.title}</h2>
                        {selectedNode.planTitle && (
                            <p className="text-sm text-neutral-500">{selectedNode.planTitle}</p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Timer & Tasks */}
                    <div className="lg:col-span-7 space-y-6">
                        <TimerCard onSessionEnd={handleSessionEnd} />
                        <TaskSelector
                            tasks={displayTasks}
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

            {/* Session Summary Modal */}
            <SessionSummaryModal
                isOpen={showSummary}
                onSaveAndContinue={handleSaveAndContinue}
            />
        </>
    );
}


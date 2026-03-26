'use client';

import { useEffect } from 'react';
import { TimerCard } from './components/TimerCard';
import { TaskSelector, SessionTask } from './components/TaskSelector';
import { SessionContent } from './components/SessionContent';
import { FocusTips } from './components/FocusTips';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { SessionSuccessScreen } from './components/SessionSuccessScreen';
import { useSessionStore, SelectedTask } from '@/store/session.store';
import { useActiveSession } from './api/queries';
import { SessionStatus } from '@/shared/types';
import { useAnalytics } from '@/shared/hooks/use-analytics';

// Helper to convert SelectedTask to SessionTask format
const convertToSessionTasks = (tasks: SelectedTask[]): SessionTask[] => {
    return tasks.map(task => ({
        id: task.id,
        title: task.title,
        category: 'Study Plan',
        subcategory: task.description || '',
        duration: task.estimatedMinutes,
        isActive: Boolean(task.isActive),
        isCompleted: task.isCompleted,
    }));
};

export function SessionsPage() {
    const selectedTasks = useSessionStore((state) => state.selectedTasks);
    const selectedNode = useSessionStore((state) => state.selectedNode);
    const activeStudyPlanId = useSessionStore((state) => state.activeStudyPlanId);
    const setActiveTask = useSessionStore((state) => state.setActiveTask);
    const markTaskCompleted = useSessionStore((state) => state.markTaskCompleted);
    const sessionStatus = useSessionStore((state) => state.sessionStatus);
    const showSummary = useSessionStore((state) => state.showSummary);
    const showSuccess = useSessionStore((state) => state.showSuccess);
    const sessionId = useSessionStore((state) => state.sessionId);
    const resetSessionFlow = useSessionStore((state) => state.resetSessionFlow);
    const setActiveSessionFromApi = useSessionStore((state) => state.setActiveSessionFromApi);
    const { trackInteraction } = useAnalytics();

    const activePlanId = activeStudyPlanId ? Number(activeStudyPlanId) : undefined;
    const resolvedActivePlanId =
        typeof activePlanId === 'number' && Number.isFinite(activePlanId) && activePlanId > 0
            ? activePlanId
            : undefined;

    const hasPlanScopedContext = typeof resolvedActivePlanId === 'number';

    const selectedPlanId = selectedNode?.planId ? Number(selectedNode.planId) : undefined;
    const resolvedSelectedPlanId =
        typeof selectedPlanId === 'number' && Number.isFinite(selectedPlanId) && selectedPlanId > 0
            ? selectedPlanId
            : undefined;

    // Check for active session on mount (restore interrupted sessions)
    const { data: activeSession, isLoading: isCheckingActive } = useActiveSession(resolvedActivePlanId, {
        // In plan-scoped pages, always re-check with planId to avoid stale cross-roadmap session state.
        enabled: hasPlanScopedContext || !sessionId,
    });

    useEffect(() => {
        if (activeSession && activeSession.sessionId !== sessionId) {
            setActiveSessionFromApi(activeSession);
            return;
        }

        // If this page is scoped to a specific plan and backend says no active session for that plan,
        // clear stale local session from another roadmap.
        if (!activeSession && hasPlanScopedContext && sessionId) {
            if (resolvedSelectedPlanId !== resolvedActivePlanId) {
                resetSessionFlow();
            }
        }
    }, [
        activeSession,
        hasPlanScopedContext,
        resolvedActivePlanId,
        resolvedSelectedPlanId,
        resetSessionFlow,
        sessionId,
        setActiveSessionFromApi,
    ]);

    // Get display tasks
    const displayTasks: SessionTask[] = selectedTasks.length > 0
        ? convertToSessionTasks(selectedTasks)
        : [];

    const canInteractTasks = sessionStatus !== SessionStatus.NOT_STARTED;

    const handleSetActiveTask = (taskId: string) => {
        if (!canInteractTasks) return;
        trackInteraction('set_active_task', { taskId, page: 'sessions' });
        setActiveTask(taskId);
    };

    const handleCompleteTask = (taskId: string) => {
        if (!canInteractTasks) return;
        trackInteraction('complete_task', { taskId, page: 'sessions' });
        markTaskCompleted(taskId);
    };

    // Show success screen (full page)
    if (showSuccess) {
        return <SessionSuccessScreen isOpen={showSuccess} />;
    }

    // Loading state while checking for active session
    if (isCheckingActive && (!sessionId || hasPlanScopedContext)) {
        return (
            <div className="max-w-[1600px] mx-auto flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    <p className="text-sm text-neutral-500">Checking for active session...</p>
                </div>
            </div>
        );
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
                        <TimerCard />
                        {displayTasks.length > 0 && (
                            <TaskSelector
                                tasks={displayTasks}
                                canInteract={canInteractTasks}
                                onSetActiveTask={handleSetActiveTask}
                                onCompleteTask={handleCompleteTask}
                            />
                        )}
                    </div>

                    {/* Right Column - Content & Tips */}
                    <div className="lg:col-span-5 space-y-6">
                        <SessionContent />
                        <FocusTips />
                    </div>
                </div>
            </div>

            {/* Session Summary Modal */}
            <SessionSummaryModal isOpen={showSummary} />
        </>
    );
}

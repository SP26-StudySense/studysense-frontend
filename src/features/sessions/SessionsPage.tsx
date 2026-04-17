'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { LearningEventName } from './types';
import { ConfirmationModal } from '@/shared/ui';

const QUICK_DONE_THRESHOLD_MS = 60 * 1000;

// Helper to convert SelectedTask to SessionTask format
const convertToSessionTasks = (tasks: SelectedTask[]): SessionTask[] => {
    return tasks.map(task => ({
        id: task.id,
        title: task.title,
        category: 'Study Plan',
        subcategory: '',
        description: task.description,
        expectedOutput: task.expectedOutput,
        duration: task.estimatedMinutes,
        isActive: Boolean(task.isActive),
        isCompleted: task.isCompleted,
    }));
};

interface SessionsPageProps {
    studyPlanId?: string;
}

export function SessionsPage({ studyPlanId }: SessionsPageProps = {}) {
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
    const setActiveStudyPlanId = useSessionStore((state) => state.setActiveStudyPlanId);
    const { trackEvent } = useAnalytics();
    const [quickDoneConfirmTaskId, setQuickDoneConfirmTaskId] = useState<string | null>(null);
    const [quickDoneElapsedMs, setQuickDoneElapsedMs] = useState(0);
    const quickDoneStartedAtRef = useRef<number | null>(null);
    const previousSessionIdRef = useRef<string | null>(null);

    const completeTask = useCallback((taskId: string) => {
        trackEvent(LearningEventName.TASK_COMPLETED, { taskId, page: 'sessions', sessionId });
        markTaskCompleted(taskId);
        quickDoneStartedAtRef.current = Date.now();
    }, [markTaskCompleted, sessionId, trackEvent]);

    useEffect(() => {
        if (studyPlanId) {
            setActiveStudyPlanId(studyPlanId);
        }
    }, [setActiveStudyPlanId, studyPlanId]);

    const routePlanId = studyPlanId ? Number(studyPlanId) : undefined;
    const resolvedRoutePlanId =
        typeof routePlanId === 'number' && Number.isFinite(routePlanId) && routePlanId > 0
            ? routePlanId
            : undefined;

    const activePlanId = activeStudyPlanId ? Number(activeStudyPlanId) : undefined;
    const resolvedStorePlanId =
        typeof activePlanId === 'number' && Number.isFinite(activePlanId) && activePlanId > 0
            ? activePlanId
            : undefined;

    const resolvedActivePlanId = resolvedRoutePlanId ?? resolvedStorePlanId;

    const hasPlanScopedContext = typeof resolvedActivePlanId === 'number';

    const selectedPlanId = selectedNode?.planId ? Number(selectedNode.planId) : undefined;
    const resolvedSelectedPlanId =
        typeof selectedPlanId === 'number' && Number.isFinite(selectedPlanId) && selectedPlanId > 0
            ? selectedPlanId
            : undefined;

    const hasStalePlanDraft =
        hasPlanScopedContext &&
        typeof resolvedSelectedPlanId === 'number' &&
        resolvedSelectedPlanId !== resolvedActivePlanId;

    // Check for active session on mount (restore interrupted sessions)
    const { data: activeSession, isLoading: isCheckingActive } = useActiveSession(resolvedActivePlanId, {
        // In plan-scoped pages, always re-check with planId to avoid stale cross-roadmap session state.
        enabled: hasPlanScopedContext || !sessionId,
    });

    const isCrossPlanActiveSession =
        hasPlanScopedContext &&
        typeof activeSession?.planId === 'number' &&
        activeSession.planId > 0 &&
        activeSession.planId !== resolvedActivePlanId;

    useEffect(() => {
        if (isCrossPlanActiveSession) {
            resetSessionFlow();
            return;
        }

        // User may open Sessions from Schedule (draft tasks selected) without actually starting a session.
        // If they switch roadmap afterward, clear stale draft context from the previous plan.
        if (!activeSession && hasStalePlanDraft) {
            resetSessionFlow();
            return;
        }

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
        hasStalePlanDraft,
        hasPlanScopedContext,
        isCrossPlanActiveSession,
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
    const activeTask = displayTasks.find((task) => task.isActive);

    const canInteractTasks = sessionStatus !== SessionStatus.NOT_STARTED;

    const handleSetActiveTask = (taskId: string) => {
        if (!canInteractTasks) return;
        trackEvent(LearningEventName.TASK_ACTIVATED, { taskId, page: 'sessions', sessionId });
        setActiveTask(taskId);
    };

    const handleCompleteTask = (taskId: string) => {
        if (!canInteractTasks) return;

        const now = Date.now();
        const startedAt = quickDoneStartedAtRef.current ?? now;
        const elapsedMs = now - startedAt;

        setQuickDoneElapsedMs(elapsedMs);
        setQuickDoneConfirmTaskId(taskId);
    };

    const confirmQuickDone = useCallback(() => {
        if (!quickDoneConfirmTaskId) {
            return;
        }

        completeTask(quickDoneConfirmTaskId);
        setQuickDoneConfirmTaskId(null);
        setQuickDoneElapsedMs(0);
    }, [completeTask, quickDoneConfirmTaskId]);

    const isQuickDoneWarning =
        quickDoneConfirmTaskId !== null && quickDoneElapsedMs < QUICK_DONE_THRESHOLD_MS;

    useEffect(() => {
        const normalizedSessionId = sessionId ?? null;

        if (previousSessionIdRef.current !== normalizedSessionId) {
            previousSessionIdRef.current = normalizedSessionId;
            quickDoneStartedAtRef.current = null;
            setQuickDoneConfirmTaskId(null);
            setQuickDoneElapsedMs(0);
        }

        if (sessionStatus === SessionStatus.IN_PROGRESS && quickDoneStartedAtRef.current == null) {
            quickDoneStartedAtRef.current = Date.now();
            return;
        }

        if (
            sessionStatus === SessionStatus.NOT_STARTED ||
            sessionStatus === SessionStatus.COMPLETED ||
            sessionStatus === SessionStatus.CANCELLED
        ) {
            quickDoneStartedAtRef.current = null;
            setQuickDoneConfirmTaskId(null);
            setQuickDoneElapsedMs(0);
        }
    }, [sessionId, sessionStatus]);

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
            <div className="relative max-w-[1600px] mx-auto">
                <div className="pointer-events-none absolute inset-x-0 -top-8 h-44 rounded-[2rem] bg-gradient-to-r from-emerald-100/70 via-cyan-100/60 to-amber-100/60 blur-2xl" />
                {/* Show selected node title if available */}
                {selectedNode && (
                    <div className="relative mb-4 overflow-hidden rounded-2xl border border-emerald-200/70 bg-white/80 p-4 shadow-md shadow-emerald-900/10 backdrop-blur-xl">
                        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-emerald-400 to-cyan-400" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Current Module</p>
                        <h2 className="mt-1 text-lg font-bold text-neutral-900">{selectedNode.title}</h2>
                        {selectedNode.planTitle && (
                            <p className="text-sm text-neutral-500">{selectedNode.planTitle}</p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {activeTask && (
                                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                                    Active: {activeTask.title}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Timer & Tasks */}
                    <div className="lg:col-span-8 space-y-6">
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
                    <div className="lg:col-span-4 lg:self-start">
                        <div className="space-y-6 lg:sticky lg:top-24">
                            <SessionContent />
                            <FocusTips />
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Summary Modal */}
            <SessionSummaryModal isOpen={showSummary} />

            <ConfirmationModal
                isOpen={quickDoneConfirmTaskId !== null}
                onClose={() => setQuickDoneConfirmTaskId(null)}
                onConfirm={confirmQuickDone}
                title={isQuickDoneWarning ? "Task completed too quickly" : "Confirm task completion"}
                description={isQuickDoneWarning
                    ? "This task was completed in less than 1 minute. Are you sure you want to mark it as done?"
                    : "Are you sure you want to mark this task as done?"}
                confirmText="Yes, mark as done"
                cancelText="Keep studying"
                variant={isQuickDoneWarning ? "warning" : "default"}
            />
        </>
    );
}

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { SessionStatus } from '@/shared/types';
import type { ActiveSessionResponse, EndSessionResponse, SessionTaskItem } from '@/features/sessions/types';

// Task from roadmap selection
export interface SelectedTask {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  isActive?: boolean;
  completedAt?: string | null;
}

// Node info from roadmap
export interface SelectedNodeInfo {
  id: string;
  roadmapNodeId?: number;
  title: string;
  planId?: string;
  planTitle?: string;
}

// Session summary data (populated from API response)
export interface SessionSummaryData {
  timeStudiedSeconds: number;
  tasksCompleted: number;
  totalTasks: number;
  xpEarned: number;
  rating: number;
  notes: string;
}

interface SessionState {
  // Selected node and tasks from roadmap
  selectedNode: SelectedNodeInfo | null;
  selectedTasks: SelectedTask[];
  setSelectedNode: (node: SelectedNodeInfo | null) => void;
  setSelectedTasks: (tasks: SelectedTask[]) => void;
  setActiveTask: (taskId: string) => void;
  markTaskCompleted: (taskId: string) => void;

  // Active Context
  activeStudyPlanId: string | null;
  setActiveStudyPlanId: (id: string | null) => void;

  // Server-assigned session ID
  sessionId: string | null;
  setSessionId: (id: string | null) => void;

  // Session status
  sessionStatus: SessionStatus;
  setSessionStatus: (status: SessionStatus) => void;

  // Session timer (client-side)
  timerRunning: boolean;
  elapsedSeconds: number;
  pauseCount: number;
  pauseSeconds: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  incrementElapsed: () => void;
  setElapsedSeconds: (seconds: number) => void;
  incrementPauseSeconds: () => void;
  setPauseData: (count: number, seconds: number) => void;

  // UI States
  showSummary: boolean;
  showSuccess: boolean;
  setShowSummary: (show: boolean) => void;
  setShowSuccess: (show: boolean) => void;

  // Summary data
  summaryData: SessionSummaryData | null;
  setSummaryData: (data: SessionSummaryData | null) => void;

  // Session actions
  startSession: (sessionId: string, tasks?: SessionTaskItem[]) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  completeSession: (endResponse: EndSessionResponse) => void;
  confirmSuccess: () => void;
  resetSessionFlow: () => void;

  // Restore from API (on app reload)
  setActiveSessionFromApi: (data: ActiveSessionResponse) => void;

  // Task navigation
  nextTask: () => void;
  previousTask: () => void;
  goToTask: (index: number) => void;
  currentTaskIndex: number;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Selected node and tasks from roadmap
      selectedNode: null,
      selectedTasks: [],
      setSelectedNode: (node) => set({ selectedNode: node }),
      setSelectedTasks: (tasks) => {
        set({
          selectedTasks: tasks.map((task) => ({
            ...task,
            isCompleted: Boolean(task.isCompleted),
            isActive: Boolean(task.isActive) && !task.isCompleted,
            completedAt: task.isCompleted ? task.completedAt || new Date().toISOString() : null,
          })),
        });
      },
      setActiveTask: (taskId) => {
        const { sessionStatus, selectedTasks } = get();

        if (sessionStatus === SessionStatus.NOT_STARTED) {
          return;
        }

        set({
          selectedTasks: selectedTasks.map((task) => ({
            ...task,
            isActive: !task.isCompleted && task.id === taskId,
          })),
        });
      },
      markTaskCompleted: (taskId) => {
        const { sessionStatus, selectedTasks } = get();

        if (sessionStatus === SessionStatus.NOT_STARTED) {
          return;
        }

        let nextActiveId: string | null = null;

        const updatedTasks = selectedTasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              isCompleted: true,
              completedAt: task.completedAt || new Date().toISOString(),
              isActive: false,
            };
          }

          return task;
        });

        const firstIncomplete = updatedTasks.find((task) => !task.isCompleted);
        if (firstIncomplete) {
          nextActiveId = firstIncomplete.id;
        }

        set({
          selectedTasks: updatedTasks.map((task) => ({
            ...task,
            isActive: nextActiveId !== null && task.id === nextActiveId,
          })),
        });
      },

      // Active Context
      activeStudyPlanId: null,
      setActiveStudyPlanId: (id) => set({ activeStudyPlanId: id }),

      // Session ID from server
      sessionId: null,
      setSessionId: (id) => set({ sessionId: id }),

      // Session status
      sessionStatus: SessionStatus.NOT_STARTED,
      setSessionStatus: (status) => set({ sessionStatus: status }),

      // Timer
      timerRunning: false,
      elapsedSeconds: 0,
      startTimer: () => set({ timerRunning: true }),
      pauseTimer: () => set({ timerRunning: false }),
      resetTimer: () => {
        set({ elapsedSeconds: 0, timerRunning: false });
      },
      incrementElapsed: () => {
        const { elapsedSeconds } = get();
        set({ elapsedSeconds: elapsedSeconds + 1 });
      },
      setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),
      incrementPauseSeconds: () => {
        const { pauseSeconds } = get();
        set({ pauseSeconds: pauseSeconds + 1 });
      },

      // Pause tracking
      pauseCount: 0,
      pauseSeconds: 0,
      setPauseData: (count, seconds) => set({ pauseCount: count, pauseSeconds: seconds }),

      // UI States
      showSummary: false,
      showSuccess: false,
      setShowSummary: (show) => set({ showSummary: show }),
      setShowSuccess: (show) => set({ showSuccess: show }),

      // Summary data
      summaryData: null,
      setSummaryData: (data) => set({ summaryData: data }),

      // Session lifecycle
      startSession: (sessionId, tasks) => {
        const currentSelected = get().selectedTasks;

        // Keep user's pre-selected tasks if they exist;
        // only fall back to API-returned tasks when nothing was pre-selected.
        const selectedTasks: SelectedTask[] =
          currentSelected.length > 0
            ? currentSelected
            : tasks
              ? tasks.map((t) => ({
                  id: String(t.id),
                  title: t.title,
                  description: t.description ?? undefined,
                  estimatedMinutes: t.estimatedMinutes,
                  isCompleted: t.isCompleted,
                  isActive: false,
                  completedAt: t.isCompleted ? new Date().toISOString() : null,
                }))
              : [];

        const hasActive = selectedTasks.some((task) => task.isActive && !task.isCompleted);
        const firstIncomplete = selectedTasks.find((task) => !task.isCompleted);
        const activeTaskId = hasActive
          ? selectedTasks.find((task) => task.isActive && !task.isCompleted)?.id
          : firstIncomplete?.id;

        set({
          sessionId,
          sessionStatus: SessionStatus.IN_PROGRESS,
          timerRunning: true,
          elapsedSeconds: 0,
          pauseCount: 0,
          pauseSeconds: 0,
          selectedTasks: selectedTasks.map((task) => ({
            ...task,
            isActive: Boolean(activeTaskId) && task.id === activeTaskId,
          })),
        });
      },

      pauseSession: () => {
        set({
          sessionStatus: SessionStatus.PAUSED,
          timerRunning: false,
        });
      },

      resumeSession: () => {
        set({
          sessionStatus: SessionStatus.IN_PROGRESS,
          timerRunning: true,
        });
      },

      endSession: () => {
        // Stop timer and show summary modal.
        // Actual XP/stats come from the API response in completeSession.
        const { elapsedSeconds, selectedTasks } = get();
        const completedTasks = selectedTasks.filter((t) => t.isCompleted).length;

        set({
          timerRunning: false,
          showSummary: true,
          summaryData: {
            timeStudiedSeconds: elapsedSeconds,
            tasksCompleted: completedTasks,
            totalTasks: selectedTasks.length,
            xpEarned: 0, // Will be populated from API
            rating: 0,
            notes: '',
          },
        });
      },

      completeSession: (endResponse) => {
        // Called after API `PATCH /end` succeeds with real data.
        // Clear session state so localStorage doesn't persist stale data.
        const { summaryData } = get();
        set({
          sessionId: null,
          sessionStatus: SessionStatus.NOT_STARTED,
          timerRunning: false,
          elapsedSeconds: 0,
          showSummary: false,
          showSuccess: true,
          summaryData: summaryData
            ? {
                ...summaryData,
                timeStudiedSeconds: endResponse.totalDurationSeconds,
                xpEarned: endResponse.xpEarned,
                tasksCompleted: endResponse.tasksCompleted,
                totalTasks: endResponse.totalTasks,
              }
            : null,
        });
      },

      confirmSuccess: () => {
        // Alias for moving from success screen → reset
        get().resetSessionFlow();
      },

      resetSessionFlow: () => {
        set({
          sessionId: null,
          sessionStatus: SessionStatus.NOT_STARTED,
          timerRunning: false,
          elapsedSeconds: 0,
          pauseCount: 0,
          pauseSeconds: 0,
          showSummary: false,
          showSuccess: false,
          summaryData: null,
          selectedNode: null,
          selectedTasks: [],
          currentTaskIndex: 0,
        });
      },

      // Restore from API on app reload
      setActiveSessionFromApi: (data) => {
        const currentActiveStudyPlanId = get().activeStudyPlanId;
        const mappedTasks: SelectedTask[] = (data.tasks || []).map((task) => ({
          id: String(task.id),
          title: task.title,
          description: task.description ?? undefined,
          estimatedMinutes: task.estimatedMinutes,
          isCompleted: task.isCompleted,
          isActive: false,
          completedAt: task.isCompleted ? new Date().toISOString() : null,
        }));

        const firstIncompleteTask = mappedTasks.find((task) => !task.isCompleted);

        set({
          activeStudyPlanId:
            currentActiveStudyPlanId || (data.planId ? String(data.planId) : null),
          sessionId: data.sessionId,
          sessionStatus: data.status as SessionStatus,
          elapsedSeconds: data.elapsedSeconds,
          timerRunning: data.status === SessionStatus.IN_PROGRESS,
          selectedTasks: mappedTasks.map((task) => ({
            ...task,
            isActive: Boolean(firstIncompleteTask) && firstIncompleteTask?.id === task.id,
          })),
          selectedNode: data.nodeId
            ? {
                id: String(data.nodeId),
                roadmapNodeId: data.nodeId,
                title: data.nodeTitle || '',
                planId: data.planId ? String(data.planId) : undefined,
                planTitle: data.planTitle || undefined,
              }
            : null,
        });
      },

      // Task navigation
      currentTaskIndex: 0,
      nextTask: () => {
        const { currentTaskIndex } = get();
        set({ currentTaskIndex: currentTaskIndex + 1 });
      },

      previousTask: () => {
        const { currentTaskIndex } = get();
        if (currentTaskIndex > 0) {
          set({ currentTaskIndex: currentTaskIndex - 1 });
        }
      },

      goToTask: (index) => {
        set({ currentTaskIndex: index });
      },
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeStudyPlanId: state.activeStudyPlanId,
        sessionId: state.sessionId,
        sessionStatus: state.sessionStatus,
        timerRunning: state.timerRunning,
        elapsedSeconds: state.elapsedSeconds,
        selectedNode: state.selectedNode,
        selectedTasks: state.selectedTasks,
      }),
    }
  )
);

// Selectors
export const useActiveSessionStore = () =>
  useSessionStore((state) => state.sessionId);
export const useTimerRunning = () =>
  useSessionStore((state) => state.timerRunning);
export const useHasActiveSession = () =>
  useSessionStore((state) => state.sessionId !== null);
export const useSelectedTasks = () =>
  useSessionStore((state) => state.selectedTasks);
export const useSelectedNode = () =>
  useSessionStore((state) => state.selectedNode);
export const useSessionSummary = () =>
  useSessionStore((state) => state.summaryData);
export const useActiveStudyPlanId = () =>
  useSessionStore((state) => state.activeStudyPlanId);

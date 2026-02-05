import { create } from 'zustand';

import { SessionStatus } from '@/shared/types';

// Task from roadmap selection
export interface SelectedTask {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  isCompleted: boolean;
}

// Node info from roadmap
export interface SelectedNodeInfo {
  id: string;
  title: string;
  planId?: string;
  planTitle?: string;
}

interface ActiveSession {
  id: string;
  planId: string;
  nodeId: string;
  startedAt: string;
  status: SessionStatus;
  elapsedMinutes: number;
  currentTaskIndex: number;
}

// Session summary data
export interface SessionSummaryData {
  timeStudiedMinutes: number;
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
  toggleTaskCompletion: (taskId: string) => void;

  // Active Context
  activeStudyPlanId: string | null;
  setActiveStudyPlanId: (id: string | null) => void;

  // Active session
  activeSession: ActiveSession | null;
  setActiveSession: (session: ActiveSession | null) => void;

  // Session timer
  timerRunning: boolean;
  elapsedSeconds: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  incrementElapsed: () => void;
  setElapsedSeconds: (seconds: number) => void;

  // UI States
  showSummary: boolean;
  showSuccess: boolean;
  setShowSummary: (show: boolean) => void;
  setShowSuccess: (show: boolean) => void;

  // Summary data
  summaryData: SessionSummaryData | null;
  setSummaryData: (data: SessionSummaryData | null) => void;

  // Session actions
  startSession: (session: Omit<ActiveSession, 'status' | 'elapsedMinutes'>) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  completeSession: () => void;
  resetSessionFlow: () => void;

  // Task navigation
  nextTask: () => void;
  previousTask: () => void;
  goToTask: (index: number) => void;
}

import { persist, createJSONStorage } from 'zustand/middleware';

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Selected node and tasks from roadmap
      selectedNode: null,
      selectedTasks: [],
      setSelectedNode: (node) => set({ selectedNode: node }),
      setSelectedTasks: (tasks) => set({ selectedTasks: tasks }),
      toggleTaskCompletion: (taskId) => {
        const { selectedTasks } = get();
        set({
          selectedTasks: selectedTasks.map((task) =>
            task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
          ),
        });
      },

      // Active Context
      activeStudyPlanId: null,
      setActiveStudyPlanId: (id) => set({ activeStudyPlanId: id }),

      // Active session
      activeSession: null,
      setActiveSession: (session) => set({ activeSession: session }),

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

      // UI States
      showSummary: false,
      showSuccess: false,
      setShowSummary: (show) => set({ showSummary: show }),
      setShowSuccess: (show) => set({ showSuccess: show }),

      // Summary data
      summaryData: null,
      setSummaryData: (data) => set({ summaryData: data }),

      // Session lifecycle
      startSession: (sessionData) => {
        const session: ActiveSession = {
          ...sessionData,
          status: SessionStatus.IN_PROGRESS,
          elapsedMinutes: 0,
        };
        set({ activeSession: session, timerRunning: true, elapsedSeconds: 0 });
      },

      pauseSession: () => {
        const { activeSession } = get();
        if (activeSession) {
          set({
            activeSession: { ...activeSession, status: SessionStatus.PAUSED },
            timerRunning: false,
          });
        }
      },

      resumeSession: () => {
        const { activeSession } = get();
        if (activeSession) {
          set({
            activeSession: { ...activeSession, status: SessionStatus.IN_PROGRESS },
            timerRunning: true,
          });
        }
      },

      endSession: () => {
        const { elapsedSeconds, selectedTasks } = get();
        const completedTasks = selectedTasks.filter((t) => t.isCompleted).length;
        const xpEarned = Math.floor(elapsedSeconds / 60) * 10 + completedTasks * 25;

        set({
          timerRunning: false,
          showSummary: true,
          summaryData: {
            timeStudiedMinutes: Math.floor(elapsedSeconds / 60),
            tasksCompleted: completedTasks,
            totalTasks: selectedTasks.length,
            xpEarned,
            rating: 0,
            notes: '',
          },
        });
      },

      completeSession: () => {
        set({
          showSummary: false,
          showSuccess: true,
        });
      },

      resetSessionFlow: () => {
        set({
          activeSession: null,
          timerRunning: false,
          elapsedSeconds: 0,
          showSummary: false,
          showSuccess: false,
          summaryData: null,
          selectedNode: null,
          selectedTasks: [],
        });
      },

      // Task navigation
      nextTask: () => {
        const { activeSession } = get();
        if (activeSession) {
          set({
            activeSession: {
              ...activeSession,
              currentTaskIndex: activeSession.currentTaskIndex + 1,
            },
          });
        }
      },

      previousTask: () => {
        const { activeSession } = get();
        if (activeSession && activeSession.currentTaskIndex > 0) {
          set({
            activeSession: {
              ...activeSession,
              currentTaskIndex: activeSession.currentTaskIndex - 1,
            },
          });
        }
      },

      goToTask: (index) => {
        const { activeSession } = get();
        if (activeSession) {
          set({
            activeSession: {
              ...activeSession,
              currentTaskIndex: index,
            },
          });
        }
      },
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeStudyPlanId: state.activeStudyPlanId }), // Only persist context
    }
  )
);

// Selectors
export const useActiveSession = () =>
  useSessionStore((state) => state.activeSession);
export const useTimerRunning = () =>
  useSessionStore((state) => state.timerRunning);
export const useHasActiveSession = () =>
  useSessionStore((state) => state.activeSession !== null);
export const useSelectedTasks = () =>
  useSessionStore((state) => state.selectedTasks);
export const useSelectedNode = () =>
  useSessionStore((state) => state.selectedNode);
export const useSessionSummary = () =>
  useSessionStore((state) => state.summaryData);
export const useActiveStudyPlanId = () =>
  useSessionStore((state) => state.activeStudyPlanId);


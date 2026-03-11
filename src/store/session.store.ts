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
  id: string;      // This will map to the backend sessionId
  planId?: string;
  nodeId?: string;
  moduleId?: string;
  taskId?: string; // Optional task specific session
  startedAt: string;
  status: SessionStatus;
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
  pauseCount: number;
  pauseSeconds: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  incrementElapsed: () => void;
  setElapsedSeconds: (seconds: number) => void;
  incrementPauseSeconds: () => void;

  // UI States
  showSummary: boolean;
  showSuccess: boolean;
  setShowSummary: (show: boolean) => void;
  setShowSuccess: (show: boolean) => void;

  // Summary data
  summaryData: SessionSummaryData | null;
  setSummaryData: (data: SessionSummaryData | null) => void;

  // Session actions
  startSession: (session: Omit<ActiveSession, 'status' | 'currentTaskIndex'>) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (summary: SessionSummaryData) => void; // Receive data from backend
  completeSession: () => void;
  resetSessionFlow: () => void;
  setActiveSessionFromApi: (apiSession: any) => void;

  // Task navigation
  nextTask: () => void;
  previousTask: () => void;
  goToTask: (index: number) => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
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

  // Active session
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),

  // Timer
  timerRunning: false,
  elapsedSeconds: 0,
  pauseCount: 0,
  pauseSeconds: 0,
  startTimer: () => set({ timerRunning: true }),
  pauseTimer: () => set({ timerRunning: false }),
  resetTimer: () => {
    set({ elapsedSeconds: 0, pauseCount: 0, pauseSeconds: 0, timerRunning: false });
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
      currentTaskIndex: 0,
    };
    set({
      activeSession: session,
      timerRunning: true,
      elapsedSeconds: 0,
      pauseCount: 0,
      pauseSeconds: 0
    });
  },

  pauseSession: () => {
    const { activeSession, pauseCount } = get();
    if (activeSession) {
      set({
        activeSession: { ...activeSession, status: SessionStatus.PAUSED },
        timerRunning: false,
        pauseCount: pauseCount + 1
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

  endSession: (summaryData) => {
    set({
      timerRunning: false,
      showSummary: true,
      summaryData: summaryData,
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
      pauseCount: 0,
      pauseSeconds: 0,
      showSummary: false,
      showSuccess: false,
      setShowSummary: (show) => set({ showSummary: show }),
      setShowSuccess: (show) => set({ showSuccess: show }),

      // Summary data
      summaryData: null,
      setSummaryData: (data) => set({ summaryData: data }),

  setActiveSessionFromApi: (apiSession) => {
    if (!apiSession) return;
    set({
      activeSession: {
        id: apiSession.sessionId,
        planId: apiSession.planId,
        nodeId: apiSession.nodeId,
        startedAt: apiSession.startAt,
        status: apiSession.status,
        currentTaskIndex: 0
      },
      elapsedSeconds: apiSession.elapsedSeconds,
      timerRunning: apiSession.status === SessionStatus.IN_PROGRESS,
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


import { create } from 'zustand';

import { SessionStatus } from '@/shared/types';

interface ActiveSession {
  id: string;
  planId: string;
  nodeId: string;
  startedAt: string;
  status: SessionStatus;
  elapsedMinutes: number;
  currentTaskIndex: number;
}

interface SessionState {
  // Active session
  activeSession: ActiveSession | null;
  setActiveSession: (session: ActiveSession | null) => void;

  // Session timer
  timerRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  incrementElapsed: () => void;

  // Session actions
  startSession: (session: Omit<ActiveSession, 'status' | 'elapsedMinutes'>) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;

  // Task navigation
  nextTask: () => void;
  previousTask: () => void;
  goToTask: (index: number) => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  // Active session
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),

  // Timer
  timerRunning: false,
  startTimer: () => set({ timerRunning: true }),
  pauseTimer: () => set({ timerRunning: false }),
  resetTimer: () => {
    const { activeSession } = get();
    if (activeSession) {
      set({
        activeSession: { ...activeSession, elapsedMinutes: 0 },
        timerRunning: false,
      });
    }
  },
  incrementElapsed: () => {
    const { activeSession } = get();
    if (activeSession) {
      set({
        activeSession: {
          ...activeSession,
          elapsedMinutes: activeSession.elapsedMinutes + 1,
        },
      });
    }
  },

  // Session lifecycle
  startSession: (sessionData) => {
    const session: ActiveSession = {
      ...sessionData,
      status: SessionStatus.IN_PROGRESS,
      elapsedMinutes: 0,
    };
    set({ activeSession: session, timerRunning: true });
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
    set({
      activeSession: null,
      timerRunning: false,
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
}));

// Selectors
export const useActiveSession = () =>
  useSessionStore((state) => state.activeSession);
export const useTimerRunning = () =>
  useSessionStore((state) => state.timerRunning);
export const useHasActiveSession = () =>
  useSessionStore((state) => state.activeSession !== null);

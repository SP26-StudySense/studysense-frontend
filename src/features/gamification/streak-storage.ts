export interface StoredStreakState {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string;
  updatedAt: string;
}

export interface StreakUpdatedEventDetail {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string;
}

const STREAK_STATE_KEY_PREFIX = 'sss_streak_state';
const STREAK_MISS_NOTICE_KEY_PREFIX = 'sss_streak_miss_notice';

export const STREAK_UPDATED_EVENT = 'studysense:streak-updated';

export function getStreakStateKey(userId: string): string {
  return `${STREAK_STATE_KEY_PREFIX}:${userId}`;
}

export function getStreakMissNoticeKey(userId: string, dateKey: string): string {
  return `${STREAK_MISS_NOTICE_KEY_PREFIX}:${userId}:${dateKey}`;
}

export function readStoredStreakState(userId: string): StoredStreakState | null {
  if (!userId || typeof window === 'undefined') return null;

  try {
    const rawValue = localStorage.getItem(getStreakStateKey(userId));
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<StoredStreakState>;
    if (
      typeof parsed.currentStreak !== 'number' ||
      typeof parsed.longestStreak !== 'number' ||
      typeof parsed.lastCheckInDate !== 'string' ||
      typeof parsed.updatedAt !== 'string'
    ) {
      return null;
    }

    return {
      currentStreak: parsed.currentStreak,
      longestStreak: parsed.longestStreak,
      lastCheckInDate: parsed.lastCheckInDate,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function writeStoredStreakState(
  userId: string,
  payload: {
    currentStreak: number;
    longestStreak: number;
    lastCheckInDate: string;
  }
): StoredStreakState | null {
  if (!userId || typeof window === 'undefined') return null;

  const normalizedState: StoredStreakState = {
    currentStreak: Number.isFinite(payload.currentStreak) ? Math.max(0, Math.floor(payload.currentStreak)) : 0,
    longestStreak: Number.isFinite(payload.longestStreak) ? Math.max(0, Math.floor(payload.longestStreak)) : 0,
    lastCheckInDate: payload.lastCheckInDate,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(getStreakStateKey(userId), JSON.stringify(normalizedState));
    return normalizedState;
  } catch {
    return null;
  }
}

export function publishStreakUpdated(detail: StreakUpdatedEventDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<StreakUpdatedEventDetail>(STREAK_UPDATED_EVENT, { detail }));
}
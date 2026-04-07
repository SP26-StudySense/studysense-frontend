import { post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { toast } from '@/shared/lib';
import {
  getStreakMissNoticeKey,
  publishStreakUpdated,
  readStoredStreakState,
  writeStoredStreakState,
} from './streak-storage';

interface DailyLoginPayload {
  currentStreak: number;
  longestStreak: number;
  totalExp: number;
  streakUpdatedToday: boolean;
}

interface RecordDailyLoginResponse {
  success: boolean;
  message: string;
  data: DailyLoginPayload;
}

const CHECKIN_KEY_PREFIX = 'sss_daily_checkin';
const inFlight = new Set<string>();

function debugStreakLog(message: string, payload?: unknown): void {
  if (process.env.NODE_ENV === 'production') return;
  if (payload !== undefined) {
    console.log(`[streak] ${message}`, payload);
    return;
  }
  console.log(`[streak] ${message}`);
}

function isDailyLoginPayload(value: unknown): value is DailyLoginPayload {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DailyLoginPayload>;
  return (
    typeof candidate.currentStreak === 'number' &&
    typeof candidate.longestStreak === 'number'
  );
}

function normalizeDailyLoginResponse(raw: unknown): {
  success: boolean;
  message: string;
  payload: DailyLoginPayload | null;
} {
  if (!raw || typeof raw !== 'object') {
    return { success: false, message: 'Invalid response shape', payload: null };
  }

  const response = raw as Partial<RecordDailyLoginResponse> & {
    data?: unknown;
    message?: string;
    success?: boolean;
  };

  let payload: DailyLoginPayload | null = null;

  if (isDailyLoginPayload(raw)) {
    payload = raw;
  } else if (isDailyLoginPayload(response.data)) {
    payload = response.data;
  }

  const success =
    typeof response.success === 'boolean'
      ? response.success
      : payload !== null;

  return {
    success,
    message: typeof response.message === 'string' ? response.message : '',
    payload,
  };
}

function toUtcDayNumber(dateKey: string): number | null {
  const parsed = Date.parse(`${dateKey}T00:00:00Z`);
  if (!Number.isFinite(parsed)) return null;
  return Math.floor(parsed / 86_400_000);
}

function getUtcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCheckInKey(userId: string, dateKey: string): string {
  return `${CHECKIN_KEY_PREFIX}:${userId}:${dateKey}`;
}

export async function recordDailyLoginIfNeeded(userId?: string): Promise<void> {
  if (!userId || typeof window === 'undefined') return;

  const dateKey = getUtcDateKey();
  const storageKey = getCheckInKey(userId, dateKey);
  const storedState = readStoredStreakState(userId);

  debugStreakLog('recordDailyLoginIfNeeded:start', {
    userId,
    dateKey,
    storageKey,
    hasCheckInKey: localStorage.getItem(storageKey) === '1',
    storedState,
  });

  if ((localStorage.getItem(storageKey) === '1' && storedState) || inFlight.has(storageKey)) {
    debugStreakLog('skip API call (already checked-in with stored state or in-flight)', {
      inFlight: inFlight.has(storageKey),
    });
    return;
  }

  const previousState = storedState;

  if (previousState) {
    const previousDay = toUtcDayNumber(previousState.lastCheckInDate);
    const currentDay = toUtcDayNumber(dateKey);

    if (
      previousDay !== null &&
      currentDay !== null &&
      currentDay - previousDay > 1 &&
      previousState.currentStreak > 0
    ) {
      const missNoticeKey = getStreakMissNoticeKey(userId, dateKey);
      if (localStorage.getItem(missNoticeKey) !== '1') {
        toast.warning('You missed your streak', {
          description: `Your ${previousState.currentStreak}-day streak was reset. Let's start a new one today.`,
        });
        localStorage.setItem(missNoticeKey, '1');
      }
    }
  }

  inFlight.add(storageKey);

  try {
    const rawResponse = await post<unknown>(
      endpoints.userGamifications.recordDailyLogin,
      {}
    );
    debugStreakLog('raw API response', rawResponse);

    const normalized = normalizeDailyLoginResponse(rawResponse);
    debugStreakLog('normalized API response', normalized);

    if (!normalized.success) {
      debugStreakLog('API reported unsuccessful response');
      return;
    }

    localStorage.setItem(storageKey, '1');

    const nextCurrentStreak = normalized.payload?.currentStreak ?? previousState?.currentStreak;
    const nextLongestStreak = normalized.payload?.longestStreak ?? previousState?.longestStreak;

    const normalizedState =
      typeof nextCurrentStreak === 'number' && typeof nextLongestStreak === 'number'
        ? writeStoredStreakState(userId, {
            currentStreak: nextCurrentStreak,
            longestStreak: nextLongestStreak,
            lastCheckInDate: dateKey,
          })
        : previousState;

    debugStreakLog('computed streak state', {
      nextCurrentStreak,
      nextLongestStreak,
      normalizedState,
    });

    if (normalizedState) {
      publishStreakUpdated({
        currentStreak: normalizedState.currentStreak,
        longestStreak: normalizedState.longestStreak,
        lastCheckInDate: normalizedState.lastCheckInDate,
      });
    }

    if (normalized.payload?.streakUpdatedToday) {
      toast.success('Streak updated', {
        description:
          normalizedState && normalizedState.currentStreak > 0
            ? `Nice! You are on a ${normalizedState.currentStreak}-day streak.`
            : normalized.message,
      });
    }
  } catch (error) {
    debugStreakLog('recordDailyLoginIfNeeded:error', error);
    // Non-blocking feature. Ignore errors to avoid affecting login flow.
  } finally {
    inFlight.delete(storageKey);
  }
}

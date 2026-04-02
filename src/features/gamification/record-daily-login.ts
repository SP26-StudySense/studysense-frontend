import { post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { toast } from '@/shared/lib';

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

  if (localStorage.getItem(storageKey) === '1' || inFlight.has(storageKey)) {
    return;
  }

  inFlight.add(storageKey);

  try {
    const response = await post<RecordDailyLoginResponse>(
      endpoints.userGamifications.recordDailyLogin,
      {}
    );

    if (!response?.success) {
      return;
    }

    localStorage.setItem(storageKey, '1');

    if (response.data?.streakUpdatedToday) {
      toast.success('Daily check-in completed', {
        description: response.message,
      });
    }
  } catch {
    // Non-blocking feature. Ignore errors to avoid affecting login flow.
  } finally {
    inFlight.delete(storageKey);
  }
}

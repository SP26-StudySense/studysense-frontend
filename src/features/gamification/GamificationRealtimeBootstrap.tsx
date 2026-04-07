'use client';

import { useEffect } from 'react';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';

import { useCurrentUser } from '@/features/auth/api/queries';
import { getAccessToken, post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { env } from '@/shared/config';
import {
  publishStreakUpdated,
  readStoredStreakState,
  writeStoredStreakState,
} from './streak-storage';

const GAMIFICATION_UPDATED_EVENT = 'gamification.updated';

interface RealtimeGamificationPayload {
  userId?: string;
  UserId?: string;
  currentStreak?: number;
  CurrentStreak?: number;
  longestStreak?: number;
  LongestStreak?: number;
  lastActiveDate?: string;
  LastActiveDate?: string;
}

function getHubUrl(): string {
  const apiUrl = new URL(env.NEXT_PUBLIC_API_URL_HTTP);
  return `${apiUrl.origin}/hubs/user-gamification`;
}

function isUnauthorizedSignalRError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes('401') || message.includes('unauthorized');
}

function toDateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

async function ensureAccessToken(): Promise<string | null> {
  const existing = getAccessToken();
  if (existing) return existing;

  try {
    await post(endpoints.auth.refresh, {});
  } catch {
    return null;
  }

  return getAccessToken() ?? null;
}

export function GamificationRealtimeBootstrap() {
  const { data: user } = useCurrentUser({ enabled: true });

  useEffect(() => {
    if (!user?.id) return;

    let disposed = false;

    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(getHubUrl(), {
        accessTokenFactory: () => getAccessToken() ?? '',
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    connection.on(GAMIFICATION_UPDATED_EVENT, (payload: RealtimeGamificationPayload) => {
      if (disposed) return;

      const payloadUserId = payload.userId ?? payload.UserId;
      if (!payloadUserId || payloadUserId !== user.id) return;

      const currentStreak = payload.currentStreak ?? payload.CurrentStreak;
      const longestStreak = payload.longestStreak ?? payload.LongestStreak;

      if (!Number.isFinite(currentStreak) || !Number.isFinite(longestStreak)) {
        return;
      }

      const existing = readStoredStreakState(user.id);
      const fallbackDate = existing?.lastCheckInDate ?? new Date().toISOString().slice(0, 10);
      const lastActiveDate = toDateKey(payload.lastActiveDate ?? payload.LastActiveDate) ?? fallbackDate;

      const nextState = writeStoredStreakState(user.id, {
        currentStreak: Number(currentStreak),
        longestStreak: Number(longestStreak),
        lastCheckInDate: lastActiveDate,
      });

      if (!nextState) return;

      publishStreakUpdated({
        currentStreak: nextState.currentStreak,
        longestStreak: nextState.longestStreak,
        lastCheckInDate: nextState.lastCheckInDate,
      });
    });

    const startPromise = (async () => {
      const token = await ensureAccessToken();
      if (!token || disposed) {
        return;
      }

      try {
        await connection.start();
        return;
      } catch (error) {
        if (!isUnauthorizedSignalRError(error)) {
          return;
        }
      }

      try {
        await post(endpoints.auth.refresh, {});
        if (disposed) return;
        await connection.start();
      } catch {
        // Keep silent: realtime is best effort.
      }
    })();

    return () => {
      disposed = true;
      connection.off(GAMIFICATION_UPDATED_EVENT);

      void startPromise.finally(() => {
        if (connection.state === HubConnectionState.Disconnected) return;
        connection.stop().catch(() => {
          // noop
        });
      });
    };
  }, [user?.id]);

  return null;
}
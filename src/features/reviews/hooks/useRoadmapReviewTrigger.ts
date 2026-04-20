'use client';

import { useEffect, useState } from 'react';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { getAccessToken } from '@/shared/api/client';
import { env } from '@/shared/config';
import type { RealtimeNotification } from '@/features/notification/types';

const SIGNALR_EVENT = 'notification.received';

function getHubUrl(): string {
  const apiUrl = new URL(env.NEXT_PUBLIC_API_URL_HTTP);
  return `${apiUrl.origin}/hubs/notifications`;
}

interface RoadmapCompletedPayload {
  roadmapId: number;
}

/**
 * Listens for SignalR notifications and fires onRoadmapCompleted
 * when the backend pushes a roadmap-completion achievement.
 */
export function useRoadmapReviewTrigger(
  onRoadmapCompleted: (payload: RoadmapCompletedPayload) => void,
) {
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    let disposed = false;

    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(getHubUrl(), {
        accessTokenFactory: () => getAccessToken() ?? '',
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    connection.on(SIGNALR_EVENT, (payload: RealtimeNotification) => {
      // Detect roadmap-completion review trigger
      const relatedType =
        typeof payload.relatedType === 'number'
          ? payload.relatedType === 6
            ? 'Roadmap'
            : 'Other'
          : payload.relatedType;

      const isRoadmapReview =
        relatedType === 'Roadmap' &&
        payload.type === 'Achievement' &&
        payload.actionUrl?.includes('/review') &&
        payload.relatedId != null;

      if (!isRoadmapReview) return;

      // dedupeKey prevents popup if already shown in another tab
      if (payload.dedupeKey) {
        const seenKey = `studysense_review_popup_${payload.dedupeKey}`;
        if (localStorage.getItem(seenKey)) return;
        localStorage.setItem(seenKey, '1');
        setTimeout(() => localStorage.removeItem(seenKey), 5 * 60 * 1000);
      }

      onRoadmapCompleted({ roadmapId: payload.relatedId! });
    });

    const startPromise = connection.start().catch(() => {
      // Silent: preview page still works without realtime
    });

    return () => {
      disposed = true;
      connection.off(SIGNALR_EVENT);
      void startPromise.finally(() => {
        if (!disposed) return;
        if (connection.state === HubConnectionState.Disconnected) return;
        connection.stop().catch(() => {});
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';

import { getAccessToken } from '@/shared/api/client';
import { env } from '@/shared/config';
import { queryKeys } from '@/shared/api/query-keys';
import { toast } from '@/shared/lib';
import {
  fetchMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  sendTestNotification,
} from '../api/api';
import type { NotificationItem, RealtimeNotification, NotificationType, NotificationRelatedType } from '../types';
import { toNotificationTimestamp } from '../api/date-utils';

const SIGNALR_EVENT = 'notification.received';

function isExpectedConnectionStop(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes('stopped during negotiation');
}

function getHubUrl(): string {
  const apiUrl = new URL(env.NEXT_PUBLIC_API_URL_HTTP);
  return `${apiUrl.origin}/hubs/notifications`;
}

function upsertNotification(list: NotificationItem[], item: NotificationItem): NotificationItem[] {
  const index = list.findIndex((x) => x.id === item.id);
  if (index >= 0) {
    const cloned = [...list];
    cloned[index] = { ...cloned[index], ...item };
    return cloned;
  }

  return [item, ...list].sort(
    (a, b) => toNotificationTimestamp(b.createdAt) - toNotificationTimestamp(a.createdAt)
  );
}

function toNotificationItem(item: RealtimeNotification): NotificationItem {
  // Map numerical enums to strings if they come as numbers from SignalR
  const typeMap: Record<number, NotificationType> = {
    0: 'System',
    1: 'Reminder',
    2: 'Achievement',
    3: 'Resurvey',
    4: 'AiRecommendation'
  };

  const relatedTypeMap: Record<number, NotificationRelatedType> = {
    0: 'None',
    1: 'Task',
    2: 'Module',
    3: 'Plan',
    4: 'Node',
    5: 'Session',
    6: 'Roadmap'
  };

  return {
    id: item.id,
    title: item.title,
    content: item.content,
    // Use the map if it's a number, otherwise use the value (if already a string)
    type: typeof item.type === 'number' ? typeMap[item.type] || 'System' : item.type,
    relatedType: typeof item.relatedType === 'number' ? relatedTypeMap[item.relatedType] || 'None' : item.relatedType,
    relatedId: item.relatedId,
    relatedSessionId: item.relatedSessionId,
    isRead: item.isRead,
    readAt: null,
    createdAt: item.createdAt,
    status: item.status,
    actionUrl: item.actionUrl,
    dedupeKey: item.dedupeKey,
  };
}

export function useNotifications(page = 1, pageSize = 20) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.list(page, pageSize),
    queryFn: () => fetchMyNotifications(page, pageSize),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!notificationsQuery.data) return;
    setItems(notificationsQuery.data.items);
    setUnreadCount(notificationsQuery.data.unreadCount);
  }, [notificationsQuery.data]);

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
      // 1. Cross-tab deduplication for toasts
      if (payload.dedupeKey) {
        const storageKey = `studysense_toast_${payload.dedupeKey}`;
        if (localStorage.getItem(storageKey)) return;
        localStorage.setItem(storageKey, '1');
        // Clean up after 1 minute
        setTimeout(() => localStorage.removeItem(storageKey), 60000);
      }

      const normalized = toNotificationItem(payload);
      setItems((prev) => upsertNotification(prev, normalized));
      setUnreadCount((prev) => prev + 1);

      // 2. Interactive toast
      toast.info(payload.title, {
        description: payload.content,
        action: payload.actionUrl ? {
          label: 'View',
          onClick: () => {
            if (payload.actionUrl) {
              window.location.href = payload.actionUrl;
            }
          }
        } : undefined,
      });
    });

    const startPromise = connection
      .start()
      .catch((error) => {
        if (disposed) return;
        if (isExpectedConnectionStop(error)) return;
        // Silent fallback: polling/query still works even when realtime fails.
      });

    return () => {
      disposed = true;
      connection.off(SIGNALR_EVENT);

      void startPromise.finally(() => {
        if (connection.state === HubConnectionState.Disconnected) return;
        connection.stop().catch(() => {
          // noop
        });
      });
    };
  }, []);

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: (updated) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? { ...item, isRead: updated.isRead, readAt: updated.readAt ?? null }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      const nowIso = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) =>
          item.isRead
            ? item
            : { ...item, isRead: true, readAt: item.readAt ?? nowIso }
        )
      );
      setUnreadCount(0);

      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  const sendTestMutation = useMutation({
    mutationFn: () => sendTestNotification(),
    onSuccess: () => {
      toast.success('Test notification sent');
    },
    onError: (error) => {
      toast.apiError(error, 'Failed to send test notification');
    },
  });

  const unreadItems = useMemo(() => items.filter((x) => !x.isRead), [items]);
  const total = notificationsQuery.data?.total ?? 0;

  const markAsRead = useCallback(
    async (id: number) => {
      const target = items.find((x) => x.id === id);
      if (!target || target.isRead) return;
      await markAsReadMutation.mutateAsync(id);
    },
    [items, markAsReadMutation]
  );

  const markAllAsRead = useCallback(async () => {
    if (unreadCount <= 0) return;
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation, unreadCount]);

  return {
    items,
    total,
    page,
    pageSize,
    unreadItems,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    isRefreshing: notificationsQuery.isFetching,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    sendTest: () => sendTestMutation.mutateAsync(),
    isSendingTest: sendTestMutation.isPending,
    refresh: notificationsQuery.refetch,
  };
}

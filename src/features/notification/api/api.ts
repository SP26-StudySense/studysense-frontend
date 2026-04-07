import { get, post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type {
  GetMyNotificationsResponse,
  MarkAllNotificationsAsReadResponse,
  MarkNotificationAsReadResponse,
  RegisterPushTokenRequest,
} from '../types';

export async function fetchMyNotifications(page = 1, pageSize = 20) {
  const query = `?page=${page}&pageSize=${pageSize}`;
  return get<GetMyNotificationsResponse>(`${endpoints.notifications.my}${query}`);
}

export async function markNotificationAsRead(id: number) {
  return post<MarkNotificationAsReadResponse>(endpoints.notifications.markAsRead(id), { id });
}

export async function markAllNotificationsAsRead() {
  return post<MarkAllNotificationsAsReadResponse>(endpoints.notifications.markAllAsRead, {});
}

export async function sendTestNotification(title?: string, content?: string) {
  return post<{ notificationId: number; message: string }>(endpoints.notifications.sendTest, {
    title: title ?? 'Frontend test notification',
    content: content ?? 'Triggered from the frontend notification panel.',
    type: 'System',
  });
}

export async function registerPushToken(payload: RegisterPushTokenRequest) {
  return post<{ id: number }>(endpoints.notifications.registerPushToken, payload);
}

export async function deactivatePushToken(deviceToken: string) {
  return post<{ deactivated: boolean }>(endpoints.notifications.deactivatePushToken, { deviceToken });
}

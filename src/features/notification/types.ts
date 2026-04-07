export type NotificationType =
  | 'System'
  | 'Reminder'
  | 'Achievement'
  | 'Resurvey'
  | 'AiRecommendation';

export type NotificationRelatedType =
  | 'None'
  | 'Task'
  | 'Module'
  | 'Plan'
  | 'Node'
  | 'Session'
  | 'Roadmap';

export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  relatedType?: NotificationRelatedType | null;
  relatedId?: number | null;
  relatedSessionId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  status?: string | null;
  actionUrl?: string | null;
  dedupeKey?: string | null;
}

export interface GetMyNotificationsResponse {
  page: number;
  pageSize: number;
  total: number;
  unreadCount: number;
  items: NotificationItem[];
}

export interface MarkNotificationAsReadResponse {
  id: number;
  isRead: boolean;
  readAt?: string | null;
}

export interface MarkAllNotificationsAsReadResponse {
  updatedCount: number;
}

export interface RealtimeNotification {
  id: number;
  userId: string;
  title: string;
  content: string;
  type: NotificationType;
  relatedType?: NotificationRelatedType | null;
  relatedId?: number | null;
  relatedSessionId?: string | null;
  isRead: boolean;
  createdAt: string;
  status?: string | null;
  actionUrl?: string | null;
  dedupeKey?: string | null;
}

export interface RegisterPushTokenRequest {
  deviceToken: string;
  deviceType: string;
}

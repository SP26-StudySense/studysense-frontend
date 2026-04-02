import { deactivatePushToken, registerPushToken } from './api';

const ONESIGNAL_SUBSCRIPTION_KEY = 'onesignal_subscription_id';

export function getStoredPushSubscriptionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ONESIGNAL_SUBSCRIPTION_KEY);
}

export async function registerStoredPushToken(deviceType = 'web'): Promise<void> {
  const token = getStoredPushSubscriptionId();
  if (!token) return;

  await registerPushToken({
    deviceToken: token,
    deviceType,
  });
}

export async function deactivateStoredPushToken(): Promise<void> {
  const token = getStoredPushSubscriptionId();
  if (!token) return;

  await deactivatePushToken(token);
}

export function setStoredPushSubscriptionId(subscriptionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONESIGNAL_SUBSCRIPTION_KEY, subscriptionId);
}

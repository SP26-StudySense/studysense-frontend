'use client';

import { env } from '@/shared/config';
import { getAccessToken } from '@/shared/api/client';
import {
  registerStoredPushToken,
  setStoredPushSubscriptionId,
  getStoredPushSubscriptionId,
} from './push-token';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void | Promise<void>>;
  }
}

let oneSignalScriptPromise: Promise<void> | null = null;

export type PushStatus = 'enabled' | 'not-enabled' | 'blocked' | 'unsupported' | 'unavailable';

function loadOneSignalScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (oneSignalScriptPromise) return oneSignalScriptPromise;

  oneSignalScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-onesignal-sdk="true"]');
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    script.dataset.onesignalSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load OneSignal SDK'));
    document.head.appendChild(script);
  });

  return oneSignalScriptPromise;
}

async function withOneSignal<T>(
  callback: (oneSignal: any) => Promise<T> | T
): Promise<T | null> {
  if (typeof window === 'undefined') return null;

  await loadOneSignalScript();

  return new Promise<T | null>((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      const result = await callback(OneSignal);
      resolve(result);
    });
  });
}

async function readCurrentSubscriptionId(oneSignal: any): Promise<string | null> {
  const directId = oneSignal?.User?.PushSubscription?.id;
  if (directId) return String(directId);

  const method = oneSignal?.User?.PushSubscription?.getId;
  if (typeof method === 'function') {
    const id = await method.call(oneSignal.User.PushSubscription);
    return id ? String(id) : null;
  }

  return null;
}

export async function initOneSignalSdk(): Promise<void> {
  if (!env.NEXT_PUBLIC_ONESIGNAL_APP_ID) return;

  await withOneSignal(async (OneSignal) => {
    await OneSignal.init({
      appId: env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
    });
  });
}

export async function syncOneSignalSubscriptionToBackend(): Promise<void> {
  if (!env.NEXT_PUBLIC_ONESIGNAL_APP_ID) return;
  if (!getAccessToken()) return;

  await withOneSignal(async (OneSignal) => {
    const subscriptionId = await readCurrentSubscriptionId(OneSignal);
    if (!subscriptionId) return;

    if (subscriptionId !== getStoredPushSubscriptionId()) {
      setStoredPushSubscriptionId(subscriptionId);
    }

    await registerStoredPushToken('web');
  });
}

export async function requestPushPermissionAndSync(): Promise<boolean> {
  if (!env.NEXT_PUBLIC_ONESIGNAL_APP_ID) return false;

  const granted = await withOneSignal(async (OneSignal) => {
    const permission = await OneSignal.Notifications.requestPermission();
    if (!permission) return false;

    const subscriptionId = await readCurrentSubscriptionId(OneSignal);
    if (!subscriptionId) return false;

    setStoredPushSubscriptionId(subscriptionId);
    await registerStoredPushToken('web');
    return true;
  });

  return Boolean(granted);
}

export async function getPushStatus(): Promise<PushStatus> {
  if (!env.NEXT_PUBLIC_ONESIGNAL_APP_ID) return 'unavailable';
  if (typeof window === 'undefined') return 'unavailable';
  if (!('Notification' in window)) return 'unsupported';

  const permission = window.Notification.permission;
  if (permission === 'denied') return 'blocked';

  // If not granted yet, user still needs to click enable.
  if (permission !== 'granted') return 'not-enabled';

  const status = await withOneSignal(async (OneSignal) => {
    const subscriptionId = await readCurrentSubscriptionId(OneSignal);
    return subscriptionId ? 'enabled' : 'not-enabled';
  });

  return (status ?? 'not-enabled') as PushStatus;
}

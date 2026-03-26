'use client';

import { useEffect } from 'react';
import { initOneSignalSdk, syncOneSignalSubscriptionToBackend } from './onesignal-client';

export function OneSignalBootstrap() {
  useEffect(() => {
    initOneSignalSdk()
      .then(() => syncOneSignalSubscriptionToBackend())
      .catch(() => {
        // Do not block app startup if OneSignal init fails.
      });
  }, []);

  return null;
}

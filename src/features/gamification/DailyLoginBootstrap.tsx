'use client';

import { useEffect, useRef } from 'react';

import { useCurrentUser } from '@/features/auth/api/queries';
import { recordDailyLoginIfNeeded } from './record-daily-login';

export function DailyLoginBootstrap() {
  const { data: user } = useCurrentUser({ enabled: true });
  const lastRecordedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    if (lastRecordedUserIdRef.current === user.id) return;

    lastRecordedUserIdRef.current = user.id;
    void recordDailyLoginIfNeeded(user.id);
  }, [user?.id]);

  return null;
}

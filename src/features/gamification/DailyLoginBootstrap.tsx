'use client';

import { useEffect } from 'react';

import { useCurrentUser } from '@/features/auth/api/queries';
import { recordDailyLoginIfNeeded } from './record-daily-login';

export function DailyLoginBootstrap() {
  const { data: user } = useCurrentUser({ enabled: true });

  useEffect(() => {
    if (!user?.id) return;
    void recordDailyLoginIfNeeded(user.id);
  }, [user?.id]);

  return null;
}

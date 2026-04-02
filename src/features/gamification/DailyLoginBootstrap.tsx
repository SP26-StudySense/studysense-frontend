'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useCurrentUser } from '@/features/auth/api/queries';
import { recordDailyLoginIfNeeded } from './record-daily-login';

export function DailyLoginBootstrap() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser({ enabled: true });
  const isDashboardPage = pathname.startsWith('/dashboard');

  useEffect(() => {
    if (!user?.id || !isDashboardPage) return;
    void recordDailyLoginIfNeeded(user.id);
  }, [isDashboardPage, user?.id]);

  return null;
}

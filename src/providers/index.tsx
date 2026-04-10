'use client';

import { usePathname } from 'next/navigation';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './toast-provider';
import { CSPostHogProvider } from './posthog-provider';
import { PostHogPageView } from './PostHogPageView';
import { OneSignalBootstrap } from '@/features/notification';
import { DailyLoginBootstrap } from '@/features/gamification/DailyLoginBootstrap';
import { GamificationRealtimeBootstrap } from '@/features/gamification/GamificationRealtimeBootstrap';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/confirm-email';

  return (
    <CSPostHogProvider>
      <PostHogPageView />
      {!isAuthPage && <OneSignalBootstrap />}
      <QueryProvider>
        {!isAuthPage && <DailyLoginBootstrap />}
        {!isAuthPage && <GamificationRealtimeBootstrap />}
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </QueryProvider>
    </CSPostHogProvider>
  );
}

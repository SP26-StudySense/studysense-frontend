'use client';

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
  return (
    <CSPostHogProvider>
      <PostHogPageView />
      <OneSignalBootstrap />
      <QueryProvider>
        <DailyLoginBootstrap />
        <GamificationRealtimeBootstrap />
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </QueryProvider>
    </CSPostHogProvider>
  );
}

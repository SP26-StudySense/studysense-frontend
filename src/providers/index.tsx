'use client';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './toast-provider';
import { CSPostHogProvider } from './posthog-provider';
import { PostHogPageView } from './PostHogPageView';
import { OneSignalBootstrap } from '@/features/notification/OneSignalBootstrap';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <CSPostHogProvider>
      <PostHogPageView />
      <OneSignalBootstrap />
      <QueryProvider>
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </QueryProvider>
    </CSPostHogProvider>
  );
}

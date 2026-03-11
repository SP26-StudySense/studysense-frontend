'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { env } from '@/shared/config';

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (env.NEXT_PUBLIC_ENABLE_ANALYTICS && env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // We handle manually for SPA route changes
        capture_pageleave: true,
      });

      if (process.env.NODE_ENV === 'development') {
        (window as any).posthog = posthog;
      }
    }
  }, []);

  if (!env.NEXT_PUBLIC_ENABLE_ANALYTICS || !env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

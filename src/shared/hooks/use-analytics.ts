'use client';

import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';
import { env } from '@/shared/config';

export function useAnalytics() {
  const posthog = usePostHog();
  const enabled = env.NEXT_PUBLIC_ENABLE_ANALYTICS && !!env.NEXT_PUBLIC_POSTHOG_KEY;

  const trackClick = useCallback(
    (elementName: string, properties?: Record<string, unknown>) => {
      if (!enabled || !posthog) return;
      posthog.capture('click', { element: elementName, ...properties });
    },
    [posthog, enabled]
  );

  const trackInteraction = useCallback(
    (action: string, properties?: Record<string, unknown>) => {
      if (!enabled || !posthog) return;
      posthog.capture('ui_interaction', { action, ...properties });
    },
    [posthog, enabled]
  );

  const identify = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      if (!enabled || !posthog) return;
      posthog.identify(userId, traits);
    },
    [posthog, enabled]
  );

  const reset = useCallback(() => {
    if (!enabled || !posthog) return;
    posthog.reset();
  }, [posthog, enabled]);

  return { trackClick, trackInteraction, identify, reset };
}

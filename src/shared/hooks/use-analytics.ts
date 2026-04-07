'use client';

import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';
import { env } from '@/shared/config';

export function useAnalytics() {
  const posthog = usePostHog();
  const enabled = env.NEXT_PUBLIC_ENABLE_ANALYTICS && !!env.NEXT_PUBLIC_POSTHOG_KEY;

  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      if (!enabled || !posthog) return;
      const payload: Record<string, unknown> = {
        ...(properties ?? {}),
        taskId: properties?.taskId ?? null,
        contentId: properties?.contentId ?? null,
      };

      posthog.capture(eventName, payload);
    },
    [posthog, enabled]
  );

  const trackClick = useCallback(
    (elementName: string, properties?: Record<string, unknown>) => {
      trackEvent('click', { element: elementName, ...properties });
    },
    [trackEvent]
  );

  const trackInteraction = useCallback(
    (action: string, properties?: Record<string, unknown>) => {
      trackEvent('ui_interaction', { action, ...properties });
    },
    [trackEvent]
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

  return { trackEvent, trackClick, trackInteraction, identify, reset };
}

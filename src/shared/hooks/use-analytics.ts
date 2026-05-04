'use client';

import { useCallback } from 'react';

export function useAnalytics() {
  const trackEvent = useCallback(
    (_eventName: string, _properties?: Record<string, unknown>) => {
      // Analytics disabled intentionally.
    },
    []
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
    (_userId: string, _traits?: Record<string, unknown>) => {
      // Analytics disabled intentionally.
    },
    []
  );

  const reset = useCallback(() => {
    // Analytics disabled intentionally.
  }, []);

  return { trackEvent, trackClick, trackInteraction, identify, reset };
}

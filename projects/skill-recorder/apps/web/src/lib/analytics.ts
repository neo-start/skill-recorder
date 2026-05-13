'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';

let initialized = false;

function initIfNeeded() {
  if (initialized || typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false,
    persistence: 'localStorage+cookie',
    autocapture: false,
  });
  initialized = true;
}

export function AnalyticsPageView() {
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    initIfNeeded();
    if (!initialized) return;
    const url = pathname + (params?.toString() ? `?${params.toString()}` : '');
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, params]);

  return null;
}

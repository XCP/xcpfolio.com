'use client';

import { load, trackPageview } from 'fathom-client';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const siteId = process.env.NEXT_PUBLIC_FATHOM_SITE_ID;
    if (siteId) {
      load(siteId, {
        auto: false,
        spa: 'auto'
      });
    }
  }, []);

  useEffect(() => {
    if (!pathname) return;

    trackPageview({
      url: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
      referrer: document.referrer
    });
  }, [pathname, searchParams]);

  return null;
}

export function FathomAnalytics() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  );
}
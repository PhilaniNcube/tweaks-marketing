'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      sendGTMEvent({ 
        event: 'page_view', 
        page: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      });
    }
  }, [pathname, searchParams]);

  return null;
}

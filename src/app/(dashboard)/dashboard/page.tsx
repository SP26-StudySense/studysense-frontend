'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check for active study plan in session storage
    if (typeof window !== 'undefined') {
      const activeStudyPlanId = sessionStorage.getItem('activeStudyPlanId');
      
      if (activeStudyPlanId) {
        // Redirect to specific study plan dashboard
        router.replace(`/dashboard/${activeStudyPlanId}`);
      } else {
        // No active study plan, redirect to roadmaps to choose one
        router.replace('/roadmaps');
      }
    }
  }, [router]);

  return null;
}

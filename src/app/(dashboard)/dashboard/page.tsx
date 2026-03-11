'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

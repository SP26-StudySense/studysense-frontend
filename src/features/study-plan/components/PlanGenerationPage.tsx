'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useStudyPlanByRoadmap } from '../api/queries';
import { StudyPlanStatus } from '../api/types';
import { useNotifications } from '@/features/notification/hooks/use-notifications';

interface PlanGenerationPageProps {
  roadmapId: number;
}

const TIMEOUT_DURATION = 180000; // 3 minutes

export function PlanGenerationPage({ roadmapId }: PlanGenerationPageProps) {
  const router = useRouter();
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [startTime] = useState(() => Date.now());
  const { items: notifications } = useNotifications();

  // 1. Initial check on mount, then disable polling
  const { data: studyPlan, error, isError } = useStudyPlanByRoadmap(roadmapId, {
    enabled: !hasTimedOut,
    refetchInterval: 5000, // Fallback polling every 5s
  });

  useEffect(() => {
    // Check for timeout
    const timeoutId = setTimeout(() => {
      if (!studyPlan) {
        setHasTimedOut(true);
      }
    }, TIMEOUT_DURATION);

    return () => clearTimeout(timeoutId);
  }, [studyPlan]);

  // 2. Redirect proactively if already ready on mount
  useEffect(() => {
    if (studyPlan && studyPlan.modules && studyPlan.modules.length > 0 && studyPlan.status === 'Ready') {
      handleRedirect(studyPlan.id, studyPlan.roadmapId, studyPlan.status);
    }
  }, [studyPlan?.status, studyPlan?.modules?.length]);

  // 3. Listen for SignalR notifications for redirection
  useEffect(() => {
    if (!notifications?.length) return;

    // Look for the most RECENT notification related to a Plan
    // Since notifications are sorted by date descending, the first one is the newest
    const latestNotif = notifications[0];

    const isMatch = 
      latestNotif.relatedType === 'Plan' && 
      latestNotif.status === 'Ready' &&
      (latestNotif.relatedId === studyPlan?.id || 
       latestNotif.actionUrl?.includes(`/dashboard/`) ||
       latestNotif.content.toLowerCase().includes('ready'));

    if (isMatch && latestNotif.actionUrl) {
      const idFromUrl = latestNotif.actionUrl.split('/').pop();
      if (idFromUrl) {
        console.log('[PlanGeneration] New notification detected, redirecting...');
        handleRedirect(Number(idFromUrl), roadmapId, 'Ready');
      }
    }
  }, [notifications, studyPlan?.id, roadmapId]);

  const handleRedirect = (id: number, rId: number, status: string) => {
    console.log('[PlanGeneration] Redirecting to dashboard:', id);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeStudyPlanId', String(id));
      sessionStorage.setItem('activeRoadmapId', String(rId));
      sessionStorage.setItem('studyPlanStatus', status);
    }
    router.push(`/dashboard/${id}`);
  };

  // Calculate elapsed time for display
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (hasTimedOut) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-3xl border border-red-200 p-8 shadow-xl text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">
              Request timed out
            </h2>
            <p className="text-neutral-600 mb-6">
              This is taking longer than expected. Please try again or contact support if the issue continues.
            </p>
            <button
              onClick={() => router.push('/roadmaps')}
              className="w-full px-6 py-3 rounded-2xl bg-[#00bae2] text-white font-medium hover:bg-[#00a8d0] transition-colors"
            >
              Back to Roadmaps
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isError && error) {
    // Only show error if it's not a 404 (404 is expected while plan is being created)
    const is404 = error.message?.includes('404') || error.message?.toLowerCase().includes('not found');
    
    if (!is404) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-3xl border border-red-200 p-8 shadow-xl text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                Something went wrong
              </h2>
              <p className="text-neutral-600 mb-6">
                {error.message || 'Unable to load data. Please try again.'}
              </p>
              <button
                onClick={() => router.push('/roadmaps')}
                className="w-full px-6 py-3 rounded-2xl bg-[#00bae2] text-white font-medium hover:bg-[#00a8d0] transition-colors"
              >
                Back to Roadmaps
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-8 shadow-2xl shadow-indigo-100/50 text-center">
          {/* Compact Icon */}
          <div className="relative mx-auto w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full bg-[#00bae2] animate-ping opacity-10" />
            <div className="absolute inset-0 rounded-full bg-[#00bae2]/5 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-[#00bae2]" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-2xl font-bold text-neutral-900 mb-6">
            Đang khởi tạo lộ trình
          </h1>

          {/* Status List */}
          <div className="space-y-4 mb-8">
            <div className="space-y-3 bg-neutral-50/80 rounded-2xl p-5 border border-neutral-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Phân tích mục tiêu</span>
                <span className="text-green-600 font-bold flex items-center gap-1">
                  ✓ Xong
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 font-medium">Thiết kế lộ trình AI</span>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-[#00bae2] animate-spin" />
                  <span className="text-[#00bae2] font-bold">({elapsedSeconds}s)</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-neutral-400">
                <span>Tạo bài học chi tiết</span>
                <span>Chờ xử lý</span>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => router.push('/roadmaps')}
                className="w-full px-6 py-3.5 rounded-2xl bg-[#00bae2] text-white font-semibold hover:bg-[#00a8d0] shadow-lg shadow-cyan-100 transition-all active:scale-95 text-sm"
              >
                Quay lại Roadmaps
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 rounded-2xl bg-transparent text-neutral-400 font-medium hover:text-neutral-600 transition-all text-xs"
              >
                Về trang chủ
              </button>
            </div>
          </div>

          {/* Minimal Note */}
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
            Hệ thống sẽ thông báo ngay khi hoàn tất
          </p>
        </div>
      </div>
    </div>
  );
}

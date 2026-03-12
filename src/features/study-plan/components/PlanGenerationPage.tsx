'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useStudyPlanByRoadmap } from '../api/queries';
import { StudyPlanStatus } from '../api/types';

interface PlanGenerationPageProps {
  roadmapId: number;
}

const POLLING_INTERVAL = 4000; // 4 seconds
const TIMEOUT_DURATION = 180000; // 3 minutes

export function PlanGenerationPage({ roadmapId }: PlanGenerationPageProps) {
  const router = useRouter();
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [startTime] = useState(() => Date.now());

  // Poll for study plan creation
  const { data: studyPlan, error, isError } = useStudyPlanByRoadmap(roadmapId, {
    enabled: !hasTimedOut,
    refetchInterval: POLLING_INTERVAL,
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

  useEffect(() => {
    // Only redirect when study plan AND modules are created
    // Check that we have a valid study plan with at least one module
    if (studyPlan && studyPlan.modules && studyPlan.modules.length > 0) {
      console.log('[PlanGeneration] Study plan and modules created:', studyPlan);
      
      // Store the study plan ID and roadmap ID in session storage for dashboard to pick up
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('activeStudyPlanId', String(studyPlan.id));
        sessionStorage.setItem('activeRoadmapId', String(studyPlan.roadmapId));
        sessionStorage.setItem('studyPlanStatus', studyPlan.status || '');
      }

      // Small delay to ensure state is saved, then redirect to specific dashboard
      setTimeout(() => {
        router.push(`/dashboard/${studyPlan.id}`);
      }, 500);
    }
  }, [studyPlan, router]);

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
              Hết thời gian chờ
            </h2>
            <p className="text-neutral-600 mb-6">
              Hệ thống xử lý quá lâu. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
            </p>
            <button
              onClick={() => router.push('/roadmaps')}
              className="w-full px-6 py-3 rounded-2xl bg-[#00bae2] text-white font-medium hover:bg-[#00a8d0] transition-colors"
            >
              Quay lại danh sách Roadmap
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
                Đã xảy ra lỗi
              </h2>
              <p className="text-neutral-600 mb-6">
                {error.message || 'Không thể tải dữ liệu. Vui lòng thử lại.'}
              </p>
              <button
                onClick={() => router.push('/roadmaps')}
                className="w-full px-6 py-3 rounded-2xl bg-[#00bae2] text-white font-medium hover:bg-[#00a8d0] transition-colors"
              >
                Quay lại danh sách Roadmap
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 p-12 shadow-2xl text-center">
          {/* Animated Icon */}
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#fec5fb] to-[#00bae2] animate-pulse opacity-20" />
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-[#00bae2] animate-pulse" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Đang tạo lộ trình học tập
          </h1>
          
          <p className="text-lg text-neutral-600 mb-2">
            AI đang phân tích kết quả khảo sát của bạn...
          </p>
          
          <p className="text-sm text-neutral-500 mb-8">
            Quá trình này có thể mất 30-120 giây
          </p>

          {/* Progress Indicator */}
          <div className="space-y-4">
            {/* Spinner */}
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 text-[#00bae2] animate-spin" />
              <span className="text-sm font-medium text-neutral-700">
                Đang xử lý... ({elapsedSeconds}s)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#fec5fb] to-[#00bae2] transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min((elapsedSeconds / 120) * 100, 95)}%`,
                }}
              />
            </div>

            {/* Status Messages */}
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">✓ Phân tích mục tiêu học tập</span>
                <span className="text-green-600 font-medium">Hoàn thành</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">⟳ Tạo lộ trình chi tiết</span>
                <span className="text-[#00bae2] font-medium animate-pulse">Đang xử lý...</span>
              </div>
              <div className="flex items-center justify-between text-sm text-neutral-400">
                <span>◦ Sinh danh sách công việc học tập</span>
                <span>Chờ xử lý</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-10 pt-8 border-t border-neutral-200">
            <p className="text-xs text-neutral-500">
              💡 <strong>Mẹo:</strong> Bạn có thể rời khỏi trang này. Chúng tôi sẽ gửi thông báo khi hoàn tất.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

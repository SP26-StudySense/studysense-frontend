'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useStudyPlan, useTasksByPlan } from '@/features/study-plan/api/queries';
import { StudyPlanStatus } from '@/features/study-plan/api/types';

interface StudyPlanStatusHandlerProps {
  studyPlanId: string;
  children: React.ReactNode;
}

const POLL_INTERVAL = 5000; // 5 seconds

/**
 * Component that checks study plan status and handles UI accordingly
 * - GeneratingTasks: Shows banner and polls for completion
 * - Ready: No banner, normal display
 * - Failed: Shows error message 
 */
export function StudyPlanStatusHandler({ studyPlanId, children }: StudyPlanStatusHandlerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [shouldPoll, setShouldPoll] = useState(false);

  // Fetch study plan with conditional polling
  const { data: studyPlan } = useStudyPlan(studyPlanId, {
    enabled: !!studyPlanId,
    refetchInterval: shouldPoll ? POLL_INTERVAL : false,
  });

  // Also fetch tasks to trigger loading when ready
  const { data: tasks } = useTasksByPlan(studyPlanId);

  const status = studyPlan?.status;

  // Enable polling if status is GeneratingTasks
  useEffect(() => {
    if (status === StudyPlanStatus.GeneratingTasks) {
      setShouldPoll(true);
    } else if (status === StudyPlanStatus.Ready || status === StudyPlanStatus.Failed) {
      setShouldPoll(false);
      // Force refresh tasks when status becomes Ready
      if (status === StudyPlanStatus.Ready) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'byPlan', studyPlanId] });
      }
    }
  }, [status, studyPlanId, queryClient]);

  // Debug log
  useEffect(() => {
    console.log('🎯 [StudyPlanStatusHandler] Status:', {
      studyPlanId,
      status,
      shouldPoll,
      tasksCount: tasks?.length || 0,
    });
  }, [studyPlanId, status, shouldPoll, tasks?.length]);

  // Render banner only for GeneratingTasks status
  if (status === StudyPlanStatus.GeneratingTasks) {
    return (
      <div className="space-y-6">
        {/* Banner showing generation in progress */}
        <div className="glass-panel rounded-3xl border border-blue-200/60 bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Sparkles className="h-8 w-8 text-[#00bae2] animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-neutral-900 mb-1">
                AI đang tạo danh sách công việc học tập
              </h3>
              <p className="text-sm text-neutral-600 mb-3">
                Các module đã được tạo. Chúng tôi đang sinh danh sách task học tập chi tiết cho bạn...
              </p>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-[#00bae2] animate-spin" />
                <span className="text-xs font-medium text-neutral-600">
                  Quá trình này có thể mất 30-90 giây
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Show children with indication that tasks are loading */}
        {children}
      </div>
    );
  }

  if (status === StudyPlanStatus.Failed) {
    return (
      <div className="space-y-6">
        {/* Error Banner */}
        <div className="glass-panel rounded-3xl border border-red-200/60 bg-gradient-to-r from-red-50/80 to-orange-50/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-neutral-900 mb-1">
                Không thể tạo lộ trình học tập
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Đã xảy ra lỗi trong quá trình AI tạo danh sách công việc học tập. Vui lòng thử lại.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/roadmaps')}
                  className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Quay lại danh sách Roadmap
                </button>
                <button
                  onClick={() => {
                    router.refresh();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#00bae2] text-white text-sm font-medium hover:bg-[#00a8d0] transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    );
  }

  // Normal rendering for Ready or other statuses (no banner)
  return <>{children}</>;
}

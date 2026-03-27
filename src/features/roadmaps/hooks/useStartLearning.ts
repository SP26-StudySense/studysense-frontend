'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/session.store';
import { useCreateStudyPlan, useDeleteStudyPlan } from '@/features/study-plan/api';
import { TaskStatus, StudyPlanDto } from '@/features/study-plan/api/types';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

interface UseStartLearningOptions {
  onSuccess?: (studyPlanId: number) => void;
  onError?: (error: Error) => void;
}

interface UseStartLearningReturn {
  startLearning: (roadmapId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook to handle the "Start Learning" flow
 * 1. Creates a study plan for the roadmap
 * 2. Redirects to study plan page
 * 3. Rollback if any step fails
 */
export function useStartLearning(options: UseStartLearningOptions = {}): UseStartLearningReturn {
  const router = useRouter();
  const setActiveStudyPlanId = useSessionStore((state) => state.setActiveStudyPlanId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStudyPlan = useCreateStudyPlan();
  const deleteStudyPlan = useDeleteStudyPlan();

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const startLearning = useCallback(async (roadmapId: number) => {
    let createdPlanId: number | null = null;

    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Create study plan
      console.log('📝 [Step 1] Creating Study Plan...');
      console.log('Request:', { roadmapId });

      const studyPlan = await createStudyPlan.mutateAsync({ roadmapId });
      createdPlanId = studyPlan.id;

      console.log('✅ [Step 1] Study Plan Created Successfully!');
      console.log('Response:', JSON.stringify(studyPlan, null, 2));

      if (!studyPlan.modules || studyPlan.modules.length === 0) {
        console.log('⚠️ No modules found, redirecting to plan page...');
      }

      // Step 4: Finalize and redirect
      console.log('✨ All Steps Completed Successfully!');
      console.log(`Redirecting to: /dashboard/${studyPlan.id}`);

      setActiveStudyPlanId(String(studyPlan.id));
      router.push(`/dashboard/${studyPlan.id}`);
      options.onSuccess?.(studyPlan.id);

    } catch (err) {
      console.error('❌ [ERROR] Start Learning Failed:', err);
      console.error('Error details:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);

      // Rollback: Delete the created study plan if it exists
      if (createdPlanId) {
        console.log('🔄 [ROLLBACK] Attempting to delete study plan:', createdPlanId);
        try {
          await deleteStudyPlan.mutateAsync(createdPlanId);
          console.log('✅ [ROLLBACK] Successfully deleted study plan:', createdPlanId);
        } catch (rollbackErr) {
          console.error('❌ [ROLLBACK] Failed to delete study plan:', rollbackErr);
        }
      }

      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
      console.log('🏁 Start Learning Flow Ended');
    }
  }, [createStudyPlan, deleteStudyPlan, router, options]);

  return {
    startLearning,
    isLoading,
    error,
    reset,
  };
}

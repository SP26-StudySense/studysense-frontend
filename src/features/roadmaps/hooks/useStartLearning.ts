'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/session.store';
import { useCreateStudyPlan, useCreateTasksBatch, useDeleteStudyPlan } from '@/features/study-plan/api';
import { TaskItemInput, TaskStatus, StudyPlanDto } from '@/features/study-plan/api/types';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { NodeContentItemDTO } from '@/features/roadmaps/api/types';
import type { StartLearningStep } from '../components/StartLearningOverlay';

interface UseStartLearningOptions {
  onSuccess?: (studyPlanId: number) => void;
  onError?: (error: Error) => void;
}

interface UseStartLearningReturn {
  startLearning: (roadmapId: number) => Promise<void>;
  isLoading: boolean;
  currentStep: StartLearningStep;
  error: string | null;
  reset: () => void;
}

/**
 * Hook to handle the "Start Learning" flow
 * 1. Creates a study plan for the roadmap
 * 2. Fetches node contents for each module
 * 3. Creates tasks from node contents
 * 4. Redirects to study plan page
 * 5. Rollback if any step fails
 */
export function useStartLearning(options: UseStartLearningOptions = {}): UseStartLearningReturn {
  const router = useRouter();
  const setActiveStudyPlanId = useSessionStore((state) => state.setActiveStudyPlanId);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<StartLearningStep>('creating-plan');
  const [error, setError] = useState<string | null>(null);

  const createStudyPlan = useCreateStudyPlan();
  const createTasksBatch = useCreateTasksBatch();
  const deleteStudyPlan = useDeleteStudyPlan();

  const reset = useCallback(() => {
    setIsLoading(false);
    setCurrentStep('creating-plan');
    setError(null);
  }, []);

  const startLearning = useCallback(async (roadmapId: number) => {
    let createdPlanId: number | null = null;

    try {
      setIsLoading(true);
      setError(null);
      setCurrentStep('creating-plan');

      // Step 1: Create study plan
      console.log('📝 [Step 1] Creating Study Plan...');
      console.log('Request:', { roadmapId });

      const studyPlan = await createStudyPlan.mutateAsync({ roadmapId });
      createdPlanId = studyPlan.id;

      console.log('✅ [Step 1] Study Plan Created Successfully!');
      console.log('Response:', JSON.stringify(studyPlan, null, 2));
      console.log('Modules count:', studyPlan.modules?.length || 0);

      if (!studyPlan.modules || studyPlan.modules.length === 0) {
        console.log('⚠️ No modules found, redirecting to plan page...');
        // No modules, just redirect to the plan
        setCurrentStep('success');
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push(`/study-plans/${studyPlan.id}`);
        options.onSuccess?.(studyPlan.id);
        return;
      }

      // Step 2: Load node contents for each module
      setCurrentStep('loading-modules');
      console.log('📚 [Step 2] Loading Node Contents...');
      console.log('Total modules to process:', studyPlan.modules.length);

      const tasksToCreate: TaskItemInput[] = [];
      const scheduledDate = new Date().toISOString();

      // Fetch content for each module's node
      for (const module of studyPlan.modules) {
        console.log(`\n🔍 Fetching contents for module #${module.id}: "${module.roadmapNodeName}"`);
        console.log('Request URL:', endpoints.roadmaps.nodeContents(String(roadmapId), String(module.roadmapNodeId)));

        try {
          const contents = await get<NodeContentItemDTO[]>(
            endpoints.roadmaps.nodeContents(String(roadmapId), String(module.roadmapNodeId))
          );

          console.log(`✅ Module #${module.id} - Fetched ${contents?.length || 0} content items`);
          console.log('Contents:', JSON.stringify(contents, null, 2));

          // Map contents to tasks
          if (contents && contents.length > 0) {
            for (const content of contents) {
              const task: TaskItemInput = {
                studyPlanModuleId: module.id,
                title: content.title,
                description: content.description || undefined,
                status: TaskStatus.Pending,
                estimatedDurationSeconds: (content.estimatedMinutes || 30) * 60,
                scheduledDate: scheduledDate,
              };
              tasksToCreate.push(task);
              console.log(`  ➕ Added task: "${content.title}" (${content.estimatedMinutes || 30} min)`);
            }
          } else {
            console.log(`  ⚠️ No content items, creating default task`);
            // If no content items, create a default task for the module
            const defaultTask: TaskItemInput = {
              studyPlanModuleId: module.id,
              title: `Complete: ${module.roadmapNodeName}`,
              description: `Study and complete the ${module.roadmapNodeName} module`,
              status: TaskStatus.Pending,
              estimatedDurationSeconds: 30 * 60, // Default 30 minutes
              scheduledDate: scheduledDate,
            };
            tasksToCreate.push(defaultTask);
            console.log(`  ➕ Added default task: "${defaultTask.title}"`);
          }
        } catch (nodeError) {
          // If fetching node contents fails, create default task
          console.error(`❌ Failed to fetch contents for node ${module.roadmapNodeId}:`, nodeError);
          const fallbackTask: TaskItemInput = {
            studyPlanModuleId: module.id,
            title: `Complete: ${module.roadmapNodeName}`,
            description: `Study and complete the ${module.roadmapNodeName} module`,
            status: TaskStatus.Pending,
            estimatedDurationSeconds: 30 * 60,
            scheduledDate: scheduledDate,
          };
          tasksToCreate.push(fallbackTask);
          console.log(`  ➕ Added fallback task: "${fallbackTask.title}"`);
        }
      }

      console.log('\n✅ [Step 2] All Modules Processed!');
      console.log('Total tasks to create:', tasksToCreate.length);

      // Step 3: Create tasks
      setCurrentStep('creating-tasks');
      console.log('\n📋 [Step 3] Creating Tasks Batch...');

      if (tasksToCreate.length > 0) {
        console.log('Request:', JSON.stringify({ tasks: tasksToCreate }, null, 2));

        const createdTasks = await createTasksBatch.mutateAsync({ tasks: tasksToCreate });

        console.log('✅ [Step 3] Tasks Created Successfully!');
        console.log('Response:', JSON.stringify(createdTasks, null, 2));
        console.log('Created tasks count:', Array.isArray(createdTasks) ? createdTasks.length : 'N/A');
      } else {
        console.log('⚠️ No tasks to create, skipping batch creation');
      }

      // Step 4: Finalize and redirect
      setCurrentStep('finalizing');
      console.log('\n🎉 [Step 4] Finalizing...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep('success');
      console.log('✨ All Steps Completed Successfully!');
      console.log('Redirecting to: /dashboard');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setActiveStudyPlanId(String(studyPlan.id));
      router.push('/dashboard');
      options.onSuccess?.(studyPlan.id);

    } catch (err) {
      console.error('❌ [ERROR] Start Learning Failed:', err);
      console.error('Error details:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setCurrentStep('error');

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
      // Don't set isLoading to false here - let the overlay handle the transition
      console.log('🏁 Start Learning Flow Ended');
    }
  }, [createStudyPlan, createTasksBatch, deleteStudyPlan, router, options]);

  return {
    startLearning,
    isLoading,
    currentStep,
    error,
    reset,
  };
}

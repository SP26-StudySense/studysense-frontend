'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { RoadmapTimeline, RoadmapModule } from './components/RoadmapTimeline';
import { ModuleTasksPanel, ModuleData, ModuleTask } from './components/ModuleTasksPanel';
import { CalendarView } from './components/CalendarView';
import { useStudyPlan, useTasksByPlan } from './api/queries';
import { ModuleStatus, TaskStatus, StudyModuleDto, TaskItemDto, StudyPlanStatus } from './api/types';

interface StudyPlanDetailPageProps {
    planId?: string;
}

// Map API module status to UI status
function mapModuleStatus(status?: ModuleStatus, isFirstModule: boolean = false): 'completed' | 'in_progress' | 'not_started' | 'locked' {
    // Special case: First module should never be locked on initial creation
    if (isFirstModule && status === ModuleStatus.Locked) {
        return 'not_started';
    }

    switch (status) {
        case ModuleStatus.Completed:
            return 'completed';
        case ModuleStatus.Active:
            return 'in_progress';
        case ModuleStatus.Locked:
            return 'locked';
        case ModuleStatus.Skipped:
            return 'completed';
        default:
            return 'not_started';
    }
}

// Check if task is completed
function isTaskCompleted(status?: TaskStatus): boolean {
    return status === TaskStatus.Completed;
}

export function StudyPlanDetailPage({ planId }: StudyPlanDetailPageProps) {
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [shouldPoll, setShouldPoll] = useState(false);
    const queryClient = useQueryClient();
    const prevStatusRef = useRef<StudyPlanStatus | undefined>(undefined);

    // Fetch study plan with conditional polling
    const { data: studyPlan, isLoading: isLoadingPlan, error: planError } = useStudyPlan(planId, {
        refetchInterval: shouldPoll ? 5000 : false, // Poll every 5 seconds if generating
    });
    const { data: tasks = [], isLoading: isLoadingTasks } = useTasksByPlan(planId);

    // Debug logging
    useEffect(() => {
        console.log('📊 [StudyPlanDetailPage] Data:', {
            planId,
            studyPlanStatus: studyPlan?.status,
            modulesCount: studyPlan?.modules?.length || 0,
            tasksCount: tasks.length,
            isLoadingTasks,
        });
    }, [planId, studyPlan?.status, studyPlan?.modules?.length, tasks.length, isLoadingTasks]);

    // Update document title with roadmap name
    useEffect(() => {
        if (studyPlan?.roadmapName) {
            document.title = `${studyPlan.roadmapName} - Schedule | StudySense`;
        }
        return () => {
            document.title = 'Schedule | StudySense';
        };
    }, [studyPlan?.roadmapName]);

    // Enable polling if status is GeneratingTasks
    useEffect(() => {
        if (studyPlan?.status === StudyPlanStatus.GeneratingTasks) {
            setShouldPoll(true);
        } else if (studyPlan?.status === StudyPlanStatus.Ready || studyPlan?.status === StudyPlanStatus.Failed) {
            setShouldPoll(false);
        }
    }, [studyPlan?.status]);

    // Refetch tasks when study plan transitions to Ready status
    useEffect(() => {
        const currentStatus = studyPlan?.status;
        const prevStatus = prevStatusRef.current;
        
        if (
            prevStatus === StudyPlanStatus.GeneratingTasks &&
            currentStatus === StudyPlanStatus.Ready &&
            planId
        ) {
            console.log('🔄 Study plan became Ready, refetching tasks...');
            queryClient.invalidateQueries({ queryKey: ['tasks', 'byPlan', planId] });
        }
        
        prevStatusRef.current = currentStatus;
    }, [studyPlan?.status, planId, queryClient]);

    // Transform API data to UI format
    const modulesWithTasks: ModuleData[] = useMemo(() => {
        if (!studyPlan?.modules) return [];

        console.log('🔄 [StudyPlanDetailPage] Transforming modules and tasks...');
        console.log('Study Plan:', studyPlan);
        console.log('Raw Tasks:', tasks);

        return studyPlan.modules.map((module: StudyModuleDto, index: number) => {
            const isFirstModule = index === 0;
            const moduleTasks = tasks
                .filter((task: TaskItemDto) => task.studyPlanModuleId === module.id)
                .map((task: TaskItemDto): ModuleTask => ({
                    id: String(task.id),
                    title: task.title,
                    description: task.description,
                    estimatedMinutes: Math.round(task.estimatedDurationSeconds / 60),
                    isCompleted: isTaskCompleted(task.status),
                    scheduledDate: task.scheduledDate,
                }));

            const mappedStatus = mapModuleStatus(module.status, isFirstModule);

            console.log(`Module #${module.id} "${module.roadmapNodeName}":`, {
                status: module.status,
                mappedStatus: mappedStatus,
                isFirstModule,
                tasksCount: moduleTasks.length,
                tasks: moduleTasks
            });

            return {
                id: String(module.id),
                roadmapNodeId: module.roadmapNodeId,
                title: module.roadmapNodeName,
                status: mappedStatus,
                tasks: moduleTasks,
            };
        });
    }, [studyPlan, tasks]);

    // Set first in-progress module as default selected
    useEffect(() => {
        if (modulesWithTasks.length > 0 && selectedModuleId === null) {
            const firstInProgress = modulesWithTasks.find(m => m.status === 'in_progress');
            const firstNotStarted = modulesWithTasks.find(m => m.status === 'not_started');
            const defaultModule = firstInProgress || firstNotStarted || modulesWithTasks[0];
            if (defaultModule) {
                setSelectedModuleId(defaultModule.id);
            }
        }
    }, [modulesWithTasks, selectedModuleId]);

    // Transform to roadmap timeline format
    const roadmapModules: RoadmapModule[] = modulesWithTasks.map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        taskCount: m.tasks.length,
        completedDate: m.status === 'completed' ? 'Completed' : undefined,
        dueDate: m.status === 'in_progress' ? 'In Progress' : undefined,
    }));

    const selectedModule = modulesWithTasks.find(m => m.id === selectedModuleId) || null;

    // Derived stats
    const totalTasks = modulesWithTasks.reduce((acc, m) => acc + m.tasks.length, 0);
    const completedTasks = modulesWithTasks.reduce((acc, m) => acc + m.tasks.filter(t => t.isCompleted).length, 0);
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate hours from tasks
    const totalMinutes = modulesWithTasks.reduce((acc, m) =>
        acc + m.tasks.reduce((taskAcc, t) => taskAcc + t.estimatedMinutes, 0), 0);
    const completedMinutes = modulesWithTasks.reduce((acc, m) =>
        acc + m.tasks.filter(t => t.isCompleted).reduce((taskAcc, t) => taskAcc + t.estimatedMinutes, 0), 0);

    const planData = {
        trackName: studyPlan?.roadmapName || 'Learning Path',
        title: studyPlan?.roadmapName || 'Study Plan',
        progress: progress,
        hoursStudied: Math.round(completedMinutes / 60 * 10) / 10,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        tasksDone: completedTasks,
        totalTasks: totalTasks,
        totalModules: modulesWithTasks.length,
        completedModules: modulesWithTasks.filter(m => m.status === 'completed').length,
    };

    // Dates with tasks (for calendar indicators) - from actual task dates
    const taskDates = useMemo(() => {
        const dates: Date[] = [];
        tasks.forEach((task: TaskItemDto) => {
            if (task.scheduledDate) {
                dates.push(new Date(task.scheduledDate));
            }
        });
        return dates;
    }, [tasks]);

    // Loading state - only block on plan loading, not tasks
    if (isLoadingPlan) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[#00bae2] mx-auto mb-4" />
                    <p className="text-neutral-600">Loading your study plan...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (planError || !studyPlan) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">😔</span>
                    </div>
                    <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                        Study Plan Not Found
                    </h2>
                    <p className="text-neutral-600 mb-4">
                        {planError?.message || 'The study plan you\'re looking for doesn\'t exist.'}
                    </p>
                    <a
                        href="/roadmaps"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#00bae2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#00a5c9] transition-all"
                    >
                        Browse Roadmaps
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] pb-10">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#fec5fb]/30 to-[#00bae2]/15 blur-[100px]" />
                <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#00bae2]/20 to-[#fec5fb]/10 blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-[1600px] px-8 py-8 lg:px-16 xl:px-24">
                {/* Header */}
                <div className="mb-8">
                    {/* Track Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 mb-4">
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                        {planData.trackName}
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 mb-1">
                                {planData.title}
                            </h1>
                            <p className="text-neutral-500">
                                {planData.completedModules} of {planData.totalModules} modules • {planData.progress}% Completed
                            </p>
                            {/* Progress Bar */}
                            <div className="mt-3 w-64">
                                <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-violet-500 transition-all duration-500"
                                        style={{ width: `${planData.progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatsCard
                                type="hours"
                                value={planData.hoursStudied}
                            />
                            <StatsCard
                                type="tasks"
                                value={planData.tasksDone}
                            />
                        </div>

                        {/* Roadmap Timeline */}
                        <RoadmapTimeline
                            modules={roadmapModules}
                            selectedModuleId={selectedModuleId}
                            onModuleClick={setSelectedModuleId}
                        />
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Calendar */}
                        <CalendarView
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            taskDates={taskDates}
                        />

                        {/* Tasks Panel */}
                        {selectedModule ? (
                            <ModuleTasksPanel
                                module={selectedModule}
                                onClose={() => setSelectedModuleId(null)}
                                className="h-[calc(100vh-450px)] min-h-[400px]"
                                studyPlanId={planId}
                                filterDate={selectedDate}
                                allTasks={tasks}
                                allModules={studyPlan?.modules}
                                onClearDateFilter={() => setSelectedDate(null)}
                                isLoadingTasks={isLoadingTasks}
                            />
                        ) : (
                            <div className="h-[calc(100vh-450px)] min-h-[400px] flex items-center justify-center rounded-3xl bg-white/50 border border-neutral-200/60 p-6 text-neutral-400">
                                <p>Select a module from the timeline to view tasks</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Clock, Check, Plus, Pencil, Trash2, MoreVertical, Filter, ChevronDown, Sparkles, FastForward } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSessionStore, SelectedTask, SelectedNodeInfo } from '@/store/session.store';
import { useCreateTask, useUpdateTask, useDeleteTask } from '../api/mutations';
import { TaskItemInput, TaskStatus, TaskItemDto } from '../api/types';
import { TaskFormModal } from './TaskFormModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

export interface ModuleTask {
    id: string;
    title: string;
    description?: string;
    estimatedMinutes: number;
    isCompleted: boolean;
    scheduledDate?: string;
    moduleName?: string; // Added for cross-module date filtering
    isFromLockedModule?: boolean; // Added to track locked module tasks
}

export interface ModuleData {
    id: string;
    roadmapNodeId?: number;
    title: string;
    status: 'completed' | 'in_progress' | 'not_started' | 'locked';
    tasks: ModuleTask[];
}

interface ModuleTasksPanelProps {
    module: ModuleData | null;
    onClose: () => void;
    className?: string;
    studyPlanId?: string;
    filterDate?: Date | null;
    allTasks?: any[];
    allModules?: any[];
    onClearDateFilter?: () => void;
    isLoadingTasks?: boolean;
}

export function ModuleTasksPanel({ 
    module, 
    onClose, 
    className, 
    studyPlanId, 
    filterDate, 
    allTasks = [], 
    allModules = [], 
    onClearDateFilter,
    isLoadingTasks = false
}: ModuleTasksPanelProps) {
    const router = useRouter();
    const setSelectedNode = useSessionStore((state) => state.setSelectedNode);
    const setSelectedTasks = useSessionStore((state) => state.setSelectedTasks);
    const resetSessionFlow = useSessionStore((state) => state.resetSessionFlow);

    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
    const [viewFilter, setViewFilter] = useState<'module' | 'all-tasks' | 'date'>('module');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<ModuleTask | null>(null);
    const [deletingTask, setDeletingTask] = useState<ModuleTask | null>(null);
    const [activeTaskMenu, setActiveTaskMenu] = useState<string | null>(null);

    // Mutations
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();

    // Helper function to get module name by task's studyPlanModuleId
    const getModuleName = (studyPlanModuleId: number): string => {
        const foundModule = allModules.find((m: any) => m.id === studyPlanModuleId);
        return foundModule?.roadmapNodeName || 'Unknown Module';
    };

    // Helper function to check if a task belongs to a locked module
    const isTaskFromLockedModule = (studyPlanModuleId: number): boolean => {
        const foundModule = allModules.find((m: any) => m.id === studyPlanModuleId);
        return foundModule?.status === 'Locked';
    };

    // Filter tasks by date if a date is selected
    const filteredTasks = useMemo(() => {
        if (!module) return [];
        
        // Mode 1: All tasks across all modules
        if (viewFilter === 'all-tasks') {
            return allTasks.map((task: TaskItemDto): ModuleTask => ({
                id: String(task.id),
                title: task.title,
                description: task.description,
                estimatedMinutes: Math.round(task.estimatedDurationSeconds / 60),
                isCompleted: task.status === TaskStatus.Completed,
                scheduledDate: task.scheduledDate,
                moduleName: getModuleName(task.studyPlanModuleId),
                isFromLockedModule: isTaskFromLockedModule(task.studyPlanModuleId),
            }));
        }
        
        // Mode 2: Tasks filtered by selected date (cross-module)
        if (filterDate && viewFilter === 'date') {
            return allTasks
                .filter((task: TaskItemDto) => {
                    if (!task.scheduledDate) return false;
                    const taskDate = new Date(task.scheduledDate);
                    return taskDate.getDate() === filterDate.getDate() &&
                           taskDate.getMonth() === filterDate.getMonth() &&
                           taskDate.getFullYear() === filterDate.getFullYear();
                })
                .map((task: TaskItemDto): ModuleTask => ({
                    id: String(task.id),
                    title: task.title,
                    description: task.description,
                    estimatedMinutes: Math.round(task.estimatedDurationSeconds / 60),
                    isCompleted: task.status === TaskStatus.Completed,
                    scheduledDate: task.scheduledDate,
                    moduleName: getModuleName(task.studyPlanModuleId),
                    isFromLockedModule: isTaskFromLockedModule(task.studyPlanModuleId),
                }));
        }

        // Mode 3: Tasks from current module only (default)
        // Add isFromLockedModule flag for consistency
        return module.tasks.map(task => ({
            ...task,
            isFromLockedModule: module.status === 'locked',
        }));
    }, [module, filterDate, viewFilter, allTasks, allModules]);

    // Total tasks count (all tasks in study plan)
    const totalTasksCount = allTasks.length;

    // Pre-calculate tasks count for selected date (for dropdown display)
    const dateTasksCount = useMemo(() => {
        if (!filterDate) return 0;
        return allTasks.filter((task: TaskItemDto) => {
            if (!task.scheduledDate) return false;
            const taskDate = new Date(task.scheduledDate);
            return taskDate.getDate() === filterDate.getDate() &&
                   taskDate.getMonth() === filterDate.getMonth() &&
                   taskDate.getFullYear() === filterDate.getFullYear();
        }).length;
    }, [allTasks, filterDate]);

    // Auto-switch filter when date changes
    useEffect(() => {
        if (filterDate && viewFilter === 'module') {
            setViewFilter('date');
        } else if (!filterDate && viewFilter === 'date') {
            setViewFilter('module');
        }
    }, [filterDate, viewFilter]);

    const prevModuleIdRef = useRef(module?.id);

    // Force switch to 'module' filter only when a new module is selected
    useEffect(() => {
        if (module?.id && module.id !== prevModuleIdRef.current) {
            setViewFilter('module');
            prevModuleIdRef.current = module.id;
        }
    }, [module?.id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowFilterDropdown(false);
        if (showFilterDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showFilterDropdown]);

    if (!module) return null;

    const handleTaskToggle = (taskId: string) => {
        setSelectedTaskIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        // Filter out completed tasks and locked module tasks
        const selectableTasks = filteredTasks.filter(t => !t.isCompleted && !t.isFromLockedModule);
        if (selectedTaskIds.size === selectableTasks.length) {
            setSelectedTaskIds(new Set());
        } else {
            setSelectedTaskIds(new Set(selectableTasks.map(t => t.id)));
        }
    };

    const handleStartLearning = () => {
        // Reset any previous session state
        resetSessionFlow();

        // Set selected node info
        const nodeInfo: SelectedNodeInfo = {
            id: module.id,
            roadmapNodeId: module.roadmapNodeId,
            title: module.title,
            planId: studyPlanId || '1',
            planTitle: 'Learning Path',
        };
        setSelectedNode(nodeInfo);

        // Get tasks to study - either selected or all incomplete
        // Filter out locked module tasks when in date filter mode
        const tasksToStudy: SelectedTask[] = filteredTasks
            .filter(task => {
                // Exclude tasks from locked modules
                if (task.isFromLockedModule) return false;
                
                // If tasks are selected, only include selected ones
                if (selectedTaskIds.size > 0) {
                    return selectedTaskIds.has(task.id);
                }
                
                // Otherwise, include all incomplete tasks
                return !task.isCompleted;
            })
            .map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                estimatedMinutes: task.estimatedMinutes,
                isCompleted: task.isCompleted,
            }));

        setSelectedTasks(tasksToStudy);

        // Navigate to sessions page
        router.push('/sessions');
    };

    // Add Task
    const handleAddTask = () => {
        setEditingTask(null);
        setIsFormModalOpen(true);
    };

    // Edit Task
    const handleEditTask = (task: ModuleTask, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTask(task);
        setIsFormModalOpen(true);
    };

    // Delete Task
    const handleDeleteClick = (task: ModuleTask, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingTask(task);
        setIsDeleteDialogOpen(true);
    };

    // Submit Create/Update
    const handleFormSubmit = async (data: TaskItemInput) => {
        try {
            if (editingTask) {
                // Extract numeric task ID
                const taskIdStr = editingTask.id.split(':')[0];
                const taskId = parseInt(taskIdStr, 10);

                if (isNaN(taskId)) {
                    console.error('Invalid task ID for update:', editingTask.id);
                    return;
                }

                await updateTaskMutation.mutateAsync({
                    taskId: taskId,
                    task: data,
                });
            } else {
                await createTaskMutation.mutateAsync(data);
            }
            setIsFormModalOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    };

    // Confirm Delete
    const handleConfirmDelete = async () => {
        if (!deletingTask) return;

        // Extract numeric task ID - handle both string "51" and potential "51:1" formats
        const taskIdStr = deletingTask.id.split(':')[0];
        const taskId = parseInt(taskIdStr, 10);

        console.log('Deleting task:', { originalId: deletingTask.id, parsedId: taskId });

        if (isNaN(taskId)) {
            console.error('Invalid task ID:', deletingTask.id);
            return;
        }

        try {
            await deleteTaskMutation.mutateAsync(taskId);
            setIsDeleteDialogOpen(false);
            setDeletingTask(null);
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const selectedCount = selectedTaskIds.size;
    const incompleteTasks = filteredTasks.filter(t => !t.isCompleted && !t.isFromLockedModule);
    const totalEstimatedTime = filteredTasks
        .filter(t => {
            if (t.isFromLockedModule) return false;
            return selectedTaskIds.size === 0 ? !t.isCompleted : selectedTaskIds.has(t.id);
        })
        .reduce((sum, t) => sum + t.estimatedMinutes, 0);

    // Module is locked only when viewing current module tasks AND module status is locked
    const isLocked = module.status === 'locked' && viewFilter === 'module';
    const isFormLoading = createTaskMutation.isPending || updateTaskMutation.isPending;
    const isDeleteLoading = deleteTaskMutation.isPending;

    return (
        <>
            <div className={cn(
                "bg-white flex flex-col",
                className
            )}>
                {/* Header */}
                <div className="p-6 border-b border-neutral-100 flex flex-col gap-4">
                    {/* Top Row: Title + Filter Dropdown */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-semibold text-neutral-900 mb-1 break-words">
                                {viewFilter === 'date' && filterDate ? (
                                    <>Tasks for {filterDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                                ) : viewFilter === 'all-tasks' ? (
                                    <>All Tasks</>
                                ) : (
                                    <>{module.title}</>
                                )}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                {viewFilter === 'module' && (
                                    <span className={cn(
                                        "inline-flex items-center rounded text-[11px] font-semibold tracking-wide uppercase px-1.5 py-0.5",
                                        module.status === 'completed' && "bg-emerald-50 text-emerald-600",
                                        module.status === 'in_progress' && "bg-violet-50 text-violet-600",
                                        module.status === 'not_started' && "bg-neutral-100 text-neutral-500",
                                        module.status === 'locked' && "bg-neutral-100 text-neutral-400"
                                    )}>
                                        {module.status === 'completed' && 'Completed'}
                                        {module.status === 'in_progress' && 'In Progress'}
                                        {module.status === 'not_started' && 'Not Started'}
                                        {module.status === 'locked' && 'Locked'}
                                    </span>
                                )}
                                <span className="text-xs text-neutral-400 whitespace-nowrap">
                                    {filteredTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)} min total
                                </span>
                            </div>
                        </div>

                        {/* Filter Dropdown Only */}
                        <div className="flex-shrink-0 mt-2 md:mt-0">
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowFilterDropdown(!showFilterDropdown);
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors w-full md:w-auto md:max-w-xs justify-between md:justify-start"
                                    title={
                                        viewFilter === 'module' 
                                            ? `${module.title} (${module.tasks.length})` 
                                            : viewFilter === 'all-tasks'
                                                ? `All Tasks (${totalTasksCount})`
                                                : `Selected Date (${dateTasksCount})`
                                    }
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Filter className="h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {viewFilter === 'module' 
                                                ? module.title
                                                : viewFilter === 'all-tasks'
                                                    ? 'All Tasks'
                                                    : `Selected Date`
                                            }
                                        </span>
                                        <span className="shrink-0">
                                            ({viewFilter === 'module' 
                                                ? module.tasks.length
                                                : viewFilter === 'all-tasks'
                                                    ? totalTasksCount
                                                    : dateTasksCount
                                            })
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3 w-3 shrink-0 ml-2" />
                                </button>
                                {showFilterDropdown && (
                                    <div 
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-0 top-full mt-2 w-full md:w-56 min-w-[200px] rounded-xl bg-white border border-neutral-200 shadow-xl z-20"
                                    >
                                        {/* Module Tasks */}
                                        <button
                                            onClick={() => {
                                                setViewFilter('module');
                                                setShowFilterDropdown(false);
                                                if (onClearDateFilter) onClearDateFilter();
                                            }}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 first:rounded-t-xl transition-colors truncate",
                                                viewFilter === 'module' && "bg-violet-50 text-violet-700 font-semibold"
                                            )}
                                            title={`${module.title} (${module.tasks.length})`}
                                        >
                                            <span className="truncate">{module.title}</span> ({module.tasks.length})
                                        </button>
                                        
                                        {/* All Tasks */}
                                        <button
                                            onClick={() => {
                                                setViewFilter('all-tasks');
                                                setShowFilterDropdown(false);
                                                if (onClearDateFilter) onClearDateFilter();
                                            }}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 border-t border-neutral-100 transition-colors",
                                                viewFilter === 'all-tasks' && "bg-violet-50 text-violet-700 font-semibold"
                                            )}
                                        >
                                            All Tasks ({totalTasksCount})
                                        </button>
                                        
                                        {/* Selected Date */}
                                        {filterDate && (
                                            <button
                                                onClick={() => {
                                                    setViewFilter('date');
                                                    setShowFilterDropdown(false);
                                                }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 last:rounded-b-xl border-t border-neutral-100 transition-colors",
                                                    viewFilter === 'date' && "bg-violet-50 text-violet-700 font-semibold"
                                                )}
                                            >
                                                {filterDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({dateTasksCount})
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    {viewFilter === 'module' && !isLocked && (
                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-50">
                            <button
                                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium hover:from-violet-600 hover:to-purple-700 shadow-sm transition-all"
                                title="Generate tasks with AI"
                            >
                                <Sparkles className="h-4 w-4 text-yellow-300" />
                                <span>Generate task AI</span>
                            </button>
                            <button
                                onClick={handleAddTask}
                                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f0fffe] text-[#00bae2] border border-[#baf0fa] text-sm font-medium hover:bg-[#d8f9ff] transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create task</span>
                            </button>
                            <button
                                onClick={() => {}}
                                className="w-full sm:w-auto sm:ml-auto inline-flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-50 text-neutral-600 border border-neutral-200 text-sm font-medium hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                            >
                                <FastForward className="h-4 w-4" />
                                <span>Skip module</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {isLocked ? (
                        <div className="text-center py-12 text-neutral-400">
                            <span className="text-3xl mb-3 block">🔒</span>
                            <p className="text-sm font-medium">Complete previous modules to unlock this one</p>
                        </div>
                    ) : (
                        <>
                            {/* Select All */}
                            {incompleteTasks.length > 0 && (
                                <div className="flex items-center justify-end mb-2">
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                                    >
                                        {selectedTaskIds.size === incompleteTasks.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            )}

                            {/* Loading State */}
                            {isLoadingTasks && filteredTasks.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="inline-flex flex-col items-center gap-3 text-neutral-400">
                                        <svg className="animate-spin h-6 w-6 text-[#00bae2]" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="text-sm font-medium">Loading tasks...</span>
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoadingTasks && filteredTasks.length === 0 && (
                                <div className="text-center py-16 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#e6f9fd] to-[#baf0fa] rounded-full flex items-center justify-center mb-4">
                                        <Sparkles className="h-8 w-8 text-[#00bae2]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 mb-2">No tasks yet for this module</h3>
                                    <p className="text-sm text-neutral-500 mb-8 max-w-[260px] mx-auto leading-relaxed">
                                        {viewFilter === 'date'
                                            ? 'No tasks scheduled for this date.'
                                            : viewFilter === 'all-tasks'
                                                ? 'No tasks in this study plan yet.'
                                                : 'Start by generating an AI-curated list of tasks based on your learning goals.'
                                        }
                                    </p>

                                        {viewFilter === 'module' && !isLocked && (
                                            <button
                                                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 hover:from-violet-600 to-purple-600 hover:to-purple-700 text-white font-semibold shadow-xl shadow-violet-500/30 transition-all hover:-translate-y-0.5"
                                            >
                                                <Sparkles className="h-5 w-5 text-yellow-300" />
                                                Generate Tasks for {viewFilter === 'module' ? module.title : 'this module'}
                                            </button>
                                        )}
                                </div>
                            )}

                            {/* Tasks */}
                            <div className="space-y-0 relative">
                                {filteredTasks.map((task, index) => {
                                    const isSelected = selectedTaskIds.has(task.id);
                                    const isDisabled = task.isCompleted || (task.isFromLockedModule && viewFilter === 'date');
                                    return (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "group w-full flex items-start gap-4 text-sm py-4 px-2 border-b border-neutral-100 last:border-0 transition-colors relative",
                                                task.isCompleted
                                                    ? "opacity-50"
                                                    : isDisabled
                                                        ? "opacity-60"
                                                        : isSelected
                                                            ? "bg-violet-50/50"
                                                            : "hover:bg-neutral-50/50"
                                            )}
                                        >
                                            {/* Checkbox Button */}
                                            <button
                                                onClick={() => !isDisabled && handleTaskToggle(task.id)}
                                                disabled={isDisabled}
                                                className="mt-0.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
                                                title={task.isFromLockedModule ? "Task from locked module" : undefined}
                                            >
                                                <div className={cn(
                                                    "flex h-4 w-4 items-center justify-center rounded-sm border transition-all",
                                                    isDisabled
                                                        ? "bg-neutral-100 border-neutral-300 text-neutral-400"
                                                        : task.isCompleted
                                                            ? "bg-violet-500 border-violet-500 text-white"
                                                            : isSelected
                                                                ? "bg-violet-500 border-violet-500 text-white"
                                                                : "border-neutral-300 group-hover:border-violet-400"
                                                )}>
                                                    {(task.isCompleted || isSelected) && !task.isFromLockedModule && (
                                                        <Check className="h-3 w-3" strokeWidth={3} />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <p className={cn(
                                                        "text-sm font-medium",
                                                        task.isCompleted ? "text-neutral-500 line-through" : "text-neutral-800"
                                                    )}>
                                                        {task.title}
                                                    </p>
                                                    {task.moduleName && (viewFilter === 'date' || viewFilter === 'all-tasks') && (
                                                        <span className="inline-flex items-center text-xs text-neutral-400 font-medium">
                                                            • {task.moduleName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Duration and Action Menu */}
                                            <div className="shrink-0 flex items-center gap-3">
                                                <span className="text-xs font-medium text-neutral-400">
                                                    {task.estimatedMinutes}m
                                                </span>

                                                {/* Action Menu (3-dot dropdown) */}
                                                {!task.isCompleted && !task.isFromLockedModule && viewFilter === 'module' && (
                                                    <div className="relative opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id);
                                                            }}
                                                            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                                                            title="More options"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>

                                                        {/* Dropdown Menu */}
                                                        {activeTaskMenu === task.id && (
                                                            <div
                                                                className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-neutral-100 py-1 z-10"
                                                                onMouseLeave={() => setActiveTaskMenu(null)}
                                                            >
                                                                <button
                                                                    onClick={(e) => {
                                                                        handleEditTask(task, e);
                                                                        setActiveTaskMenu(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        handleDeleteClick(task, e);
                                                                        setActiveTaskMenu(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!isLocked && incompleteTasks.length > 0 && (
                    <div className="p-6 border-t border-neutral-100/50 bg-white shadow-[0_-4px_24px_-10px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 text-sm">
                                <p className="font-semibold text-neutral-800">
                                    {selectedCount > 0 ? `${selectedCount} tasks selected` : `${incompleteTasks.length} tasks ready`}
                                </p>
                                <p className="text-neutral-500 text-xs mt-0.5">
                                    ~{totalEstimatedTime} minutes total
                                </p>
                            </div>
                            <button
                                onClick={handleStartLearning}
                                className="flex-shrink-0 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-neutral-900 shadow-lg transition-all duration-300 bg-gradient-to-r from-[#fec5fb] to-[#00bae2] shadow-[#00bae2]/20 hover:shadow-xl hover:shadow-[#00bae2]/30 hover:-translate-y-0.5"
                            >
                                Start Learning
                                <Play className="h-4 w-4" fill="currentColor" strokeWidth={1} />
                            </button>
                        </div>
                    </div>
                )}

                {/* All Completed or All Locked Message */}
                {!isLocked && incompleteTasks.length === 0 && filteredTasks.length > 0 && (
                    <div className="p-6 border-t border-neutral-100">
                        <div className="text-center py-4">
                            {filteredTasks.every(t => t.isCompleted) ? (
                                <>
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3">
                                        <Check className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <p className="text-sm font-medium text-neutral-700">All tasks completed!</p>
                                    <p className="text-xs text-neutral-500 mt-1">Great job on finishing this module</p>
                                </>
                            ) : (
                                <>
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 mb-3">
                                        <span className="text-2xl">🔒</span>
                                    </div>
                                    <p className="text-sm font-medium text-neutral-700">All tasks are from locked modules</p>
                                    <p className="text-xs text-neutral-500 mt-1">Complete previous modules to unlock these tasks</p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Task Form Modal */}
            <TaskFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingTask(null);
                }}
                onSubmit={handleFormSubmit}
                moduleId={parseInt(module.id)}
                mode={editingTask ? 'edit' : 'create'}
                initialData={editingTask ? {
                    id: parseInt(editingTask.id),
                    title: editingTask.title,
                    description: editingTask.description,
                    estimatedMinutes: editingTask.estimatedMinutes,
                    scheduledDate: editingTask.scheduledDate || new Date().toISOString(),
                } : undefined}
                isLoading={isFormLoading}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setDeletingTask(null);
                }}
                onConfirm={handleConfirmDelete}
                taskTitle={deletingTask?.title || ''}
                isLoading={isDeleteLoading}
            />
        </>
    );
}

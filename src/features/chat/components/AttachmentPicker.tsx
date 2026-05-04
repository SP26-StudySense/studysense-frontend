'use client';

import { useState } from 'react';
import { X, Search, Check, BookOpen, ListTodo } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { AvailableModule, AvailableTask, ChatAttachment } from '../types';

type TabType = 'modules' | 'tasks';

interface AttachmentPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (attachment: ChatAttachment) => void;
    selectedIds: string[];
    modules: AvailableModule[];
    tasks: AvailableTask[];
}

export function AttachmentPicker({
    isOpen,
    onClose,
    onSelect,
    selectedIds,
    modules,
    tasks,
}: AttachmentPickerProps) {
    const [activeTab, setActiveTab] = useState<TabType>('modules');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    // Filter items based on search
    const filteredModules = modules.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedCount = selectedIds.length;

    const handleSelectModule = (module: AvailableModule) => {
        const normalizedStatus = (module.status ?? 'not_started').toString().toLowerCase();
        if (normalizedStatus === 'locked') {
            return;
        }

        const attachment: ChatAttachment = {
            id: `module_${module.id}`,
            type: 'module',
            title: module.title,
            moduleId: module.id,
        };
        onSelect(attachment);
    };

    const handleSelectTask = (task: AvailableTask) => {
        const attachment: ChatAttachment = {
            id: `task_${task.id}`,
            type: 'task',
            title: task.title,
            taskId: task.id,
            moduleId: task.moduleId,
        };
        onSelect(attachment);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed bottom-24 right-6 z-[70] w-[400px] max-h-[560px] rounded-2xl bg-white shadow-2xl shadow-neutral-900/20 border border-neutral-200/60 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="p-4 border-b border-neutral-100 bg-gradient-to-b from-violet-50/60 to-white">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-base font-semibold text-neutral-900">Attach to message</h3>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                {selectedCount > 0 ? `${selectedCount} item${selectedCount > 1 ? 's' : ''} selected` : 'Select modules or tasks'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                            <X className="h-4 w-4 text-neutral-500" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search modules or tasks..."
                            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 border-b border-neutral-100 bg-neutral-50/60">
                    <button
                        onClick={() => setActiveTab('modules')}
                        className={cn(
                            "flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                            activeTab === 'modules'
                                ? "text-violet-600 border-b-2 border-violet-600"
                                : "text-neutral-500 hover:text-neutral-700"
                        )}
                    >
                        <BookOpen className="h-4 w-4" />
                        Modules ({filteredModules.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={cn(
                            "flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                            activeTab === 'tasks'
                                ? "text-violet-600 border-b-2 border-violet-600"
                                : "text-neutral-500 hover:text-neutral-700"
                        )}
                    >
                        <ListTodo className="h-4 w-4" />
                        Tasks ({filteredTasks.length})
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[330px] overflow-y-auto p-2">
                    {activeTab === 'modules' ? (
                        <div className="space-y-1.5">
                            {filteredModules.length === 0 && (
                                <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
                                    No modules found.
                                </div>
                            )}
                            {filteredModules.map((module) => {
                                const isSelected = selectedIds.includes(`module_${module.id}`);
                                const normalizedStatus = (module.status ?? 'not_started').toString().toLowerCase();
                                const displayStatus = normalizedStatus.replace('_', ' ');
                                const isLocked = normalizedStatus === 'locked';
                                return (
                                    <button
                                        key={module.id}
                                        onClick={() => handleSelectModule(module)}
                                        disabled={isLocked}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all shadow-sm",
                                            isSelected
                                                ? "bg-violet-50 border border-violet-300"
                                                : "bg-white border border-neutral-100",
                                            isLocked
                                                ? "cursor-not-allowed opacity-60"
                                                : "hover:border-neutral-200 hover:bg-neutral-50"
                                        )}
                                    >
                                        <div className="h-8 w-8 shrink-0 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                                            <BookOpen className="h-4 w-4" />
                                        </div>

                                        {/* Status indicator */}
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full",
                                            normalizedStatus === 'active' && "bg-violet-500",
                                            normalizedStatus === 'completed' && "bg-emerald-500",
                                            normalizedStatus === 'locked' && "bg-neutral-300",
                                            !['active', 'completed', 'locked'].includes(normalizedStatus) && "bg-neutral-200"
                                        )} />

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 truncate">
                                                {module.title}
                                            </p>
                                            <p className="text-xs text-neutral-500 capitalize">{displayStatus}</p>
                                        </div>

                                        <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-600">
                                            {module.taskCount ?? 0} tasks
                                        </span>

                                        {/* Checkbox */}
                                        <div className={cn(
                                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0",
                                            isSelected
                                                ? "bg-violet-500 border-violet-500"
                                                : "border-neutral-300"
                                        )}>
                                            {isSelected && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {filteredTasks.length === 0 && (
                                <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
                                    No tasks found.
                                </div>
                            )}
                            {filteredTasks.map((task) => {
                                const isSelected = selectedIds.includes(`task_${task.id}`);
                                return (
                                    <button
                                        key={task.id}
                                        onClick={() => handleSelectTask(task)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all shadow-sm",
                                            isSelected
                                                ? "bg-amber-50 border border-amber-300"
                                                : "bg-white border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"
                                        )}
                                    >
                                        <div className="h-8 w-8 shrink-0 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                            <ListTodo className="h-4 w-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 truncate">
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {task.moduleTitle ?? 'No module'}
                                            </p>
                                        </div>

                                        {/* Checkbox */}
                                        <div className={cn(
                                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0",
                                            isSelected
                                                ? "bg-amber-500 border-amber-500"
                                                : "border-neutral-300"
                                        )}>
                                            {isSelected && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </>
    );
}

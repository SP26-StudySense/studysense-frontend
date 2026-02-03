'use client';

import { useState } from 'react';
import { X, Search, Check, BookOpen, ListTodo } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ChatAttachment, MockModule, MockTask } from '../types';

// Mock data for demo
const MOCK_MODULES: MockModule[] = [
    { id: 'm1', title: 'HTML Basics', status: 'completed', taskCount: 4 },
    { id: 'm2', title: 'CSS Fundamentals', status: 'completed', taskCount: 4 },
    { id: 'm3', title: 'JavaScript Basics', status: 'completed', taskCount: 5 },
    { id: 'm4', title: 'Tailwind CSS', status: 'in_progress', taskCount: 4 },
    { id: 'm5', title: 'React Fundamentals', status: 'in_progress', taskCount: 5 },
    { id: 'm6', title: 'Git & Version Control', status: 'completed', taskCount: 4 },
    { id: 'm7', title: 'Component Libraries', status: 'not_started', taskCount: 4 },
    { id: 'm8', title: 'TypeScript', status: 'not_started', taskCount: 5 },
];

const MOCK_TASKS: MockTask[] = [
    { id: 't1-1', moduleId: 'm1', title: 'HTML Document Structure', isCompleted: true },
    { id: 't1-2', moduleId: 'm1', title: 'Text Formatting Tags', isCompleted: true },
    { id: 't4-1', moduleId: 'm4', title: 'Utility First Concept', isCompleted: true },
    { id: 't4-2', moduleId: 'm4', title: 'Responsive Design', isCompleted: true },
    { id: 't4-3', moduleId: 'm4', title: 'Flexbox & Grid in Tailwind', isCompleted: false },
    { id: 't4-4', moduleId: 'm4', title: 'Custom Configuration', isCompleted: false },
    { id: 't5-1', moduleId: 'm5', title: 'JSX and Components', isCompleted: true },
    { id: 't5-2', moduleId: 'm5', title: 'Props and State', isCompleted: true },
    { id: 't5-3', moduleId: 'm5', title: 'Handling Events', isCompleted: true },
    { id: 't5-4', moduleId: 'm5', title: 'Conditional Rendering', isCompleted: false },
    { id: 't5-5', moduleId: 'm5', title: 'Lists and Keys', isCompleted: false },
    { id: 't7-1', moduleId: 'm7', title: 'Introduction to Shadcn UI', isCompleted: false },
    { id: 't7-2', moduleId: 'm7', title: 'Radix UI Primitives', isCompleted: false },
    { id: 't8-1', moduleId: 'm8', title: 'Basic Types', isCompleted: false },
    { id: 't8-2', moduleId: 'm8', title: 'Interfaces and Types', isCompleted: false },
];

type TabType = 'modules' | 'tasks';

interface AttachmentPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (attachment: ChatAttachment) => void;
    selectedIds: string[];
}

export function AttachmentPicker({
    isOpen,
    onClose,
    onSelect,
    selectedIds
}: AttachmentPickerProps) {
    const [activeTab, setActiveTab] = useState<TabType>('modules');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    // Filter items based on search
    const filteredModules = MOCK_MODULES.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTasks = MOCK_TASKS.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectModule = (module: MockModule) => {
        const attachment: ChatAttachment = {
            id: `module_${module.id}`,
            type: 'module',
            title: module.title,
            moduleId: module.id,
        };
        onSelect(attachment);
    };

    const handleSelectTask = (task: MockTask) => {
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
            <div className="fixed bottom-24 right-6 z-[70] w-[380px] max-h-[500px] rounded-2xl bg-white shadow-2xl shadow-neutral-900/20 border border-neutral-200/60 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="p-4 border-b border-neutral-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-neutral-900">
                            Đính kèm vào tin nhắn
                        </h3>
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
                            placeholder="Tìm kiếm..."
                            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-100">
                    <button
                        onClick={() => setActiveTab('modules')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                            activeTab === 'modules'
                                ? "text-violet-600 border-b-2 border-violet-600"
                                : "text-neutral-500 hover:text-neutral-700"
                        )}
                    >
                        <BookOpen className="h-4 w-4" />
                        Modules
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                            activeTab === 'tasks'
                                ? "text-violet-600 border-b-2 border-violet-600"
                                : "text-neutral-500 hover:text-neutral-700"
                        )}
                    >
                        <ListTodo className="h-4 w-4" />
                        Tasks
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {activeTab === 'modules' ? (
                        <div className="space-y-1">
                            {filteredModules.map((module) => {
                                const isSelected = selectedIds.includes(`module_${module.id}`);
                                return (
                                    <button
                                        key={module.id}
                                        onClick={() => handleSelectModule(module)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                                            isSelected
                                                ? "bg-violet-50 border-2 border-violet-300"
                                                : "hover:bg-neutral-50 border-2 border-transparent"
                                        )}
                                    >
                                        {/* Status indicator */}
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full",
                                            module.status === 'completed' && "bg-emerald-500",
                                            module.status === 'in_progress' && "bg-violet-500",
                                            module.status === 'not_started' && "bg-neutral-300",
                                            module.status === 'locked' && "bg-neutral-200"
                                        )} />

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 truncate">
                                                {module.title}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {module.taskCount} tasks • {module.status.replace('_', ' ')}
                                            </p>
                                        </div>

                                        {/* Checkbox */}
                                        <div className={cn(
                                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
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
                        <div className="space-y-1">
                            {filteredTasks.map((task) => {
                                const isSelected = selectedIds.includes(`task_${task.id}`);
                                const module = MOCK_MODULES.find(m => m.id === task.moduleId);
                                return (
                                    <button
                                        key={task.id}
                                        onClick={() => handleSelectTask(task)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                                            isSelected
                                                ? "bg-amber-50 border-2 border-amber-300"
                                                : "hover:bg-neutral-50 border-2 border-transparent"
                                        )}
                                    >
                                        {/* Status indicator */}
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full",
                                            task.isCompleted ? "bg-emerald-500" : "bg-amber-500"
                                        )} />

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 truncate">
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {module?.title} • {task.isCompleted ? 'Completed' : 'In progress'}
                                            </p>
                                        </div>

                                        {/* Checkbox */}
                                        <div className={cn(
                                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
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
                        Xong
                    </button>
                </div>
            </div>
        </>
    );
}

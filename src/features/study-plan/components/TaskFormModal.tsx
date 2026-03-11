'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Clock, Calendar } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { TaskItemInput, TaskStatus } from '../api/types';

export interface TaskFormData {
    title: string;
    description: string;
    estimatedMinutes: number;
    scheduledDate: string;
}

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TaskItemInput) => Promise<void>;
    moduleId: number;
    initialData?: {
        id: number;
        title: string;
        description?: string;
        estimatedMinutes: number;
        scheduledDate: string;
    };
    mode: 'create' | 'edit';
    isLoading?: boolean;
}

export function TaskFormModal({
    isOpen,
    onClose,
    onSubmit,
    moduleId,
    initialData,
    mode,
    isLoading = false,
}: TaskFormModalProps) {
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        estimatedMinutes: 30,
        scheduledDate: new Date().toISOString().split('T')[0],
    });
    const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

    // Reset form when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    title: initialData.title,
                    description: initialData.description || '',
                    estimatedMinutes: initialData.estimatedMinutes,
                    scheduledDate: initialData.scheduledDate.split('T')[0],
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    estimatedMinutes: 30,
                    scheduledDate: new Date().toISOString().split('T')[0],
                });
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof TaskFormData, string>> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (formData.estimatedMinutes <= 0) {
            newErrors.estimatedMinutes = 'Duration must be greater than 0';
        }

        if (!formData.scheduledDate) {
            newErrors.scheduledDate = 'Scheduled date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const taskInput: TaskItemInput = {
            studyPlanModuleId: moduleId,
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            status: TaskStatus.Pending,
            estimatedDurationSeconds: formData.estimatedMinutes * 60,
            scheduledDate: new Date(formData.scheduledDate).toISOString(),
        };

        await onSubmit(taskInput);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 rounded-3xl bg-white shadow-2xl shadow-neutral-900/20 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <h2 className="text-lg font-bold text-neutral-900">
                        {mode === 'create' ? 'Add New Task' : 'Edit Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
                        disabled={isLoading}
                    >
                        <X className="h-5 w-5 text-neutral-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl border bg-white/80 text-neutral-900 placeholder:text-neutral-400 transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
                                errors.title ? "border-red-300" : "border-neutral-200"
                            )}
                            placeholder="Enter task title..."
                            disabled={isLoading}
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white/80 text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                            placeholder="Add a description (optional)..."
                            disabled={isLoading}
                        />
                    </div>

                    {/* Duration and Date Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                <Clock className="inline h-4 w-4 mr-1" />
                                Duration (min) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.estimatedMinutes}
                                onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl border bg-white/80 text-neutral-900 transition-all",
                                    "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
                                    errors.estimatedMinutes ? "border-red-300" : "border-neutral-200"
                                )}
                                disabled={isLoading}
                            />
                            {errors.estimatedMinutes && (
                                <p className="mt-1 text-xs text-red-500">{errors.estimatedMinutes}</p>
                            )}
                        </div>

                        {/* Scheduled Date */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.scheduledDate}
                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl border bg-white/80 text-neutral-900 transition-all",
                                    "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
                                    errors.scheduledDate ? "border-red-300" : "border-neutral-200"
                                )}
                                disabled={isLoading}
                            />
                            {errors.scheduledDate && (
                                <p className="mt-1 text-xs text-red-500">{errors.scheduledDate}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-all"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                mode === 'create' ? 'Add Task' : 'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

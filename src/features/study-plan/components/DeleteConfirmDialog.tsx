'use client';

import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    taskTitle: string;
    isLoading?: boolean;
}

export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    taskTitle,
    isLoading = false,
}: DeleteConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white shadow-2xl shadow-neutral-900/20 overflow-hidden">
                <div className="p-6 text-center">
                    {/* Warning Icon */}
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-7 w-7 text-red-600" />
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 mb-2">
                        Delete Task?
                    </h3>
                    <p className="text-sm text-neutral-500 mb-6">
                        Are you sure you want to delete <span className="font-medium text-neutral-700">"{taskTitle}"</span>? This action cannot be undone.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-all"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

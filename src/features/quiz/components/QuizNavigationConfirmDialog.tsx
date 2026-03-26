'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';

export type QuizConfirmDialogType = 'simple' | 'save' | 'save-error';

interface QuizNavigationConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    type?: QuizConfirmDialogType;
    isLoading?: boolean;
}

export function QuizNavigationConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    type = 'simple',
    isLoading = false,
}: QuizNavigationConfirmDialogProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const getContent = () => {
        switch (type) {
            case 'save':
                return {
                    title: 'Unsaved Answers',
                    description: 'You have unsaved answers. Do you want to save before leaving?',
                    cancelLabel: 'Leave Without Saving',
                    confirmLabel: 'Save & Leave',
                    confirmColor: 'bg-[#00bae2] hover:bg-[#00a8cc]',
                    cancelColor: 'bg-red-500 hover:bg-red-600',
                };
            case 'save-error':
                return {
                    title: 'Save Failed',
                    description: 'Failed to save your answers. Do you want to leave anyway?',
                    cancelLabel: 'Stay on Page',
                    confirmLabel: 'Leave Anyway',
                    confirmColor: 'bg-red-500 hover:bg-red-600',
                    cancelColor: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700',
                };
            case 'simple':
            default:
                return {
                    title: 'Leave Quiz?',
                    description: 'You are currently taking a quiz. Do you really want to leave this page?',
                    cancelLabel: 'Stay on Page',
                    confirmLabel: 'Leave Quiz',
                    confirmColor: 'bg-amber-500 hover:bg-amber-600',
                    cancelColor: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700',
                };
        }
    };

    const content = getContent();

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white shadow-2xl shadow-neutral-900/20 overflow-hidden">
                <div className="p-6 text-center">
                    {/* Warning Icon */}
                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-7 w-7 text-amber-700" />
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 mb-2">
                        {content.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                        {content.description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${content.cancelColor}`}
                        >
                            {content.cancelLabel}
                        </button>
                        <button
                            onClick={() => onConfirm()}
                            disabled={isLoading}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${content.confirmColor} text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                content.confirmLabel
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

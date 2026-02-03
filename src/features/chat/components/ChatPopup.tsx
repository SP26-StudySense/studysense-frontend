'use client';

import { useEffect, useCallback } from 'react';
import { X, Bot, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useChat } from '../context/ChatContext';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { AttachmentPicker } from './AttachmentPicker';

export function ChatPopup() {
    const {
        isOpen,
        closeChat,
        messages,
        isLoading,
        sendMessage,
        pendingAttachments,
        addAttachment,
        removeAttachment,
        isAttachmentPickerOpen,
        openAttachmentPicker,
        closeAttachmentPicker,
        clearHistory,
    } = useChat();

    // Close on escape key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            if (isAttachmentPickerOpen) {
                closeAttachmentPicker();
            } else {
                closeChat();
            }
        }
    }, [isAttachmentPickerOpen, closeAttachmentPicker, closeChat]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <>
            {/* Popup container */}
            <div className={cn(
                "fixed bottom-24 right-6 z-50 w-[400px] h-[600px] max-h-[calc(100vh-150px)]",
                "rounded-2xl bg-gradient-to-b from-white to-neutral-50/90 backdrop-blur-xl",
                "border border-neutral-200/60 shadow-2xl shadow-neutral-900/20",
                "flex flex-col overflow-hidden",
                "animate-in slide-in-from-bottom-4 duration-300"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900">
                                Study Assistant
                            </h3>
                            <p className="text-xs text-neutral-500">
                                Luôn sẵn sàng hỗ trợ bạn
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Menu button */}
                        <div className="relative group">
                            <button
                                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                                aria-label="Menu"
                            >
                                <MoreVertical className="h-4 w-4 text-neutral-500" />
                            </button>

                            {/* Dropdown menu */}
                            <div className="absolute right-0 top-full mt-1 py-1 w-40 rounded-xl bg-white shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <button
                                    onClick={clearHistory}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Xóa lịch sử chat
                                </button>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={closeChat}
                            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                            aria-label="Close chat"
                        >
                            <X className="h-4 w-4 text-neutral-500" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <ChatMessageList messages={messages} isLoading={isLoading} />

                {/* Input */}
                <ChatInput
                    onSend={sendMessage}
                    onOpenAttachmentPicker={openAttachmentPicker}
                    pendingAttachments={pendingAttachments}
                    onRemoveAttachment={removeAttachment}
                    disabled={isLoading}
                />
            </div>

            {/* Attachment Picker Modal */}
            <AttachmentPicker
                isOpen={isAttachmentPickerOpen}
                onClose={closeAttachmentPicker}
                onSelect={addAttachment}
                selectedIds={pendingAttachments.map(a => a.id)}
            />
        </>
    );
}

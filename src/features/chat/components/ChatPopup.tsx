'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Bot, Trash2, MoreVertical, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { routes } from '@/shared/config/routes';
import { useChat } from '@/features/chat/context/ChatContext';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { AttachmentPicker } from './AttachmentPicker';

export function ChatPopup() {
    const router = useRouter();
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
        conversations,
        selectedConversationId,
        selectConversation,
        availableModules,
        availableTasks,
        isConversationLoading,
        isCreatingConversation,
        createConversation,
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
                                Always here to help
                            </p>
                            <button
                                onClick={() => {
                                    closeChat();
                                    router.push(routes.dashboard.chat.list);
                                }}
                                className="text-[11px] font-medium text-violet-600 hover:text-violet-700"
                            >
                                Open full chat page
                            </button>
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
                                    Clear conversation
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

                <div className="px-4 py-2 border-b border-neutral-100 bg-neutral-50/60">
                    <div className="mb-1 flex items-center justify-between gap-2">
                        <label className="text-[11px] font-medium text-neutral-500">Conversation</label>
                        <button
                            onClick={createConversation}
                            disabled={isCreatingConversation || isConversationLoading}
                            className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-white px-2 py-1 text-[11px] font-medium text-violet-600 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus className="h-3 w-3" />
                            {isCreatingConversation ? 'Creating...' : 'New'}
                        </button>
                    </div>

                    <select
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/10"
                        disabled={isConversationLoading || isCreatingConversation || conversations.length === 0}
                        value={selectedConversationId ?? ''}
                        onChange={(event) => selectConversation(event.target.value)}
                    >
                        {conversations.length === 0 && (
                            <option value="">No conversations yet</option>
                        )}
                        {conversations.map((conversation) => (
                            <option key={conversation.id} value={conversation.id}>
                                {conversation.title}
                            </option>
                        ))}
                    </select>
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
                modules={availableModules}
                tasks={availableTasks}
            />
        </>
    );
}

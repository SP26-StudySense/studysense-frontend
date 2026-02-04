'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Plus, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ChatAttachment } from '../types';

interface ChatInputProps {
    onSend: (content: string) => void;
    onOpenAttachmentPicker: () => void;
    pendingAttachments: ChatAttachment[];
    onRemoveAttachment: (id: string) => void;
    disabled?: boolean;
}

export function ChatInput({
    onSend,
    onOpenAttachmentPicker,
    pendingAttachments,
    onRemoveAttachment,
    disabled = false,
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message);
            setMessage('');
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    const handleInput = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    return (
        <div className="border-t border-neutral-100 bg-white/50 backdrop-blur-sm">
            {/* Pending attachments */}
            {pendingAttachments.length > 0 && (
                <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2">
                    {pendingAttachments.map((attachment) => (
                        <span
                            key={attachment.id}
                            className={cn(
                                "inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium rounded-full",
                                attachment.type === 'task'
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-blue-100 text-blue-700 border border-blue-200"
                            )}
                        >
                            {attachment.type === 'task' ? '📋' : '📚'}
                            {attachment.title}
                            <button
                                onClick={() => onRemoveAttachment(attachment.id)}
                                className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input area */}
            <div className="p-3 flex items-end gap-2">
                {/* Attachment button */}
                <button
                    onClick={onOpenAttachmentPicker}
                    disabled={disabled}
                    className={cn(
                        "flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl transition-all",
                        "bg-neutral-100 text-neutral-500 hover:bg-violet-100 hover:text-violet-600",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    aria-label="Attach task or module"
                >
                    <Plus className="h-5 w-5" />
                </button>

                {/* Text input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onInput={handleInput}
                        placeholder="Nhập tin nhắn..."
                        disabled={disabled}
                        rows={1}
                        className={cn(
                            "w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-12",
                            "text-sm text-neutral-800 placeholder:text-neutral-400",
                            "focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "max-h-[120px]"
                        )}
                    />
                </div>

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className={cn(
                        "flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl transition-all",
                        message.trim() && !disabled
                            ? "bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
                            : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                    )}
                    aria-label="Send message"
                >
                    <Send className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ChatMessage } from '../types';

interface ChatMessageListProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    if (messages.length === 0 && !isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center mb-4">
                    <Bot className="h-8 w-8 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                    Xin chào! 👋
                </h3>
                <p className="text-sm text-neutral-500 max-w-[280px]">
                    Tôi là AI assistant của bạn. Hãy hỏi tôi bất cứ điều gì về lộ trình học tập!
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {['Làm sao để học hiệu quả?', 'Tiến độ của tôi', 'Gợi ý task tiếp theo'].map((suggestion) => (
                        <span
                            key={suggestion}
                            className="px-3 py-1.5 text-xs font-medium bg-violet-50 text-violet-600 rounded-full border border-violet-100"
                        >
                            {suggestion}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}

            {/* Loading indicator */}
            {isLoading && (
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-tl-md px-4 py-3 border border-neutral-100 shadow-sm">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}

// Single message bubble component
function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <div className={cn(
            "flex items-start gap-3",
            isUser && "flex-row-reverse"
        )}>
            {/* Avatar */}
            <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                isUser
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                    : "bg-gradient-to-br from-violet-500 to-violet-600"
            )}>
                {isUser ? (
                    <User className="h-4 w-4 text-white" />
                ) : (
                    <Bot className="h-4 w-4 text-white" />
                )}
            </div>

            {/* Message content */}
            <div className={cn(
                "max-w-[80%] space-y-2",
                isUser && "items-end"
            )}>
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className={cn(
                        "flex flex-wrap gap-1.5",
                        isUser && "justify-end"
                    )}>
                        {message.attachments.map((attachment) => (
                            <span
                                key={attachment.id}
                                className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full",
                                    attachment.type === 'task'
                                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                                        : "bg-blue-100 text-blue-700 border border-blue-200"
                                )}
                            >
                                {attachment.type === 'task' ? '📋' : '📚'}
                                {attachment.title}
                            </span>
                        ))}
                    </div>
                )}

                {/* Text bubble */}
                <div className={cn(
                    "rounded-2xl px-4 py-3 shadow-sm",
                    isUser
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-md"
                        : "bg-white/80 backdrop-blur-sm border border-neutral-100 text-neutral-800 rounded-tl-md"
                )}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                    </p>
                </div>

                {/* Timestamp */}
                <span className={cn(
                    "text-[10px] text-neutral-400 px-1",
                    isUser && "text-right block"
                )}>
                    {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
            </div>
        </div>
    );
}

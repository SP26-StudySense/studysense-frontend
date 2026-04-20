'use client';

import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/shared/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/features/auth/api/queries';
import { ChatMessage } from '../types';

interface ChatMessageListProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data: currentUser } = useCurrentUser({ enabled: true });

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
                    Hello! 👋
                </h3>
                <p className="text-sm text-neutral-500 max-w-[280px]">
                    I am your AI assistant. Ask me anything about your learning roadmap!
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {['How can I study effectively?', 'My progress', 'Suggest the next task'].map((suggestion) => (
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
                <MessageBubble
                    key={message.id}
                    message={message}
                    userAvatarUrl={currentUser?.avatarUrl ?? null}
                />
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
function MessageBubble({
    message,
    userAvatarUrl,
}: {
    message: ChatMessage;
    userAvatarUrl: string | null;
}) {
    const isUser = message.role === 'user';

    return (
        <div className={cn(
            "flex items-start gap-3",
            isUser && "flex-row-reverse"
        )}>
            {/* Avatar */}
            {isUser ? (
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={userAvatarUrl ?? undefined} alt="User avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600">
                        <User className="h-4 w-4 text-white" />
                    </AvatarFallback>
                </Avatar>
            ) : (
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-600">
                    <Bot className="h-4 w-4 text-white" />
                </div>
            )}

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
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-sm">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-sm">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            code: ({ children }) => (
                                <code className={cn(
                                    "rounded px-1 py-0.5 text-[12px]",
                                    isUser ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-800'
                                )}>
                                    {children}
                                </code>
                            ),
                            a: ({ href, children }) => (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                        "underline underline-offset-2",
                                        isUser ? 'text-white' : 'text-violet-700'
                                    )}
                                >
                                    {children}
                                </a>
                            ),
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
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

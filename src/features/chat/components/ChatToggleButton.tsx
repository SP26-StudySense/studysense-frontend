'use client';

import { Bot, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useChat } from '../context/ChatContext';

export function ChatToggleButton() {
    const { isOpen, toggleChat, messages } = useChat();

    // Count unread messages (for demo, we'll just show a dot if there are messages)
    const hasMessages = messages.length > 0;

    return (
        <button
            onClick={toggleChat}
            className={cn(
                "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300",
                "bg-gradient-to-br from-violet-500 to-violet-600 text-white",
                "hover:scale-110 hover:shadow-violet-500/40",
                "focus:outline-none focus:ring-4 focus:ring-violet-500/30",
                "active:scale-95"
            )}
            aria-label={isOpen ? "Close chat" : "Open chat"}
        >
            {/* Icon with transition */}
            <div className={cn(
                "transition-transform duration-300",
                isOpen && "rotate-90"
            )}>
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <Bot className="h-6 w-6" />
                )}
            </div>

            {/* Notification dot - only when chat is closed and has messages */}
            {!isOpen && hasMessages && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
                </span>
            )}

            {/* Subtle glow effect */}
            <span className="absolute inset-0 -z-10 rounded-full bg-violet-500/20 blur-xl" />
        </button>
    );
}


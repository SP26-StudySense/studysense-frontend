'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
    ChatState,
    ChatActions,
    ChatContextType,
    ChatMessage,
    ChatAttachment,
    ChatSession
} from '../types';
import { generateMockAIResponse } from '../utils/mock-responses';

// Local storage key prefix
const CHAT_HISTORY_KEY_PREFIX = 'studysense_chat_history_';

// Default plan ID for demo
const DEFAULT_PLAN_ID = 'plan-1';

// Initial state
const initialState: ChatState = {
    isOpen: false,
    currentPlanId: DEFAULT_PLAN_ID,
    messages: [],
    pendingAttachments: [],
    isLoading: false,
    isAttachmentPickerOpen: false,
};

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Generate unique ID
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Provider component
export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ChatState>(initialState);

    // Load chat history from localStorage
    const loadHistory = useCallback((planId: string) => {
        try {
            const key = `${CHAT_HISTORY_KEY_PREFIX}${planId}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                const session: ChatSession = JSON.parse(stored);
                setState(prev => ({
                    ...prev,
                    currentPlanId: planId,
                    messages: session.messages,
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    currentPlanId: planId,
                    messages: [],
                }));
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }, []);

    // Save chat history to localStorage
    const saveHistory = useCallback((planId: string, messages: ChatMessage[]) => {
        try {
            const key = `${CHAT_HISTORY_KEY_PREFIX}${planId}`;
            const session: ChatSession = {
                planId,
                messages,
                lastUpdated: new Date().toISOString(),
            };
            localStorage.setItem(key, JSON.stringify(session));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }, []);

    // Load history on mount
    useEffect(() => {
        loadHistory(DEFAULT_PLAN_ID);
    }, [loadHistory]);

    // Actions
    const openChat = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: true }));
    }, []);

    const closeChat = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false, isAttachmentPickerOpen: false }));
    }, []);

    const toggleChat = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        const userMessage: ChatMessage = {
            id: generateId(),
            planId: state.currentPlanId,
            role: 'user',
            content: content.trim(),
            attachments: state.pendingAttachments.length > 0 ? [...state.pendingAttachments] : undefined,
            createdAt: new Date().toISOString(),
        };

        // Add user message and set loading
        setState(prev => ({
            ...prev,
            messages: [...prev.messages, userMessage],
            pendingAttachments: [],
            isLoading: true,
        }));

        // Save after adding user message
        saveHistory(state.currentPlanId, [...state.messages, userMessage]);

        // Simulate AI response delay
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: generateId(),
                planId: state.currentPlanId,
                role: 'assistant',
                content: generateMockAIResponse(content, userMessage.attachments),
                createdAt: new Date().toISOString(),
            };

            setState(prev => {
                const newMessages = [...prev.messages, aiResponse];
                saveHistory(prev.currentPlanId, newMessages);
                return {
                    ...prev,
                    messages: newMessages,
                    isLoading: false,
                };
            });
        }, 1000 + Math.random() * 1000);
    }, [state.currentPlanId, state.pendingAttachments, state.messages, saveHistory]);

    const addAttachment = useCallback((attachment: ChatAttachment) => {
        setState(prev => {
            // Check if already attached
            if (prev.pendingAttachments.some(a => a.id === attachment.id)) {
                return prev;
            }
            return {
                ...prev,
                pendingAttachments: [...prev.pendingAttachments, attachment],
            };
        });
    }, []);

    const removeAttachment = useCallback((attachmentId: string) => {
        setState(prev => ({
            ...prev,
            pendingAttachments: prev.pendingAttachments.filter(a => a.id !== attachmentId),
        }));
    }, []);

    const clearAttachments = useCallback(() => {
        setState(prev => ({ ...prev, pendingAttachments: [] }));
    }, []);

    const openAttachmentPicker = useCallback(() => {
        setState(prev => ({ ...prev, isAttachmentPickerOpen: true }));
    }, []);

    const closeAttachmentPicker = useCallback(() => {
        setState(prev => ({ ...prev, isAttachmentPickerOpen: false }));
    }, []);

    const clearHistory = useCallback(() => {
        setState(prev => ({ ...prev, messages: [] }));
        const key = `${CHAT_HISTORY_KEY_PREFIX}${state.currentPlanId}`;
        localStorage.removeItem(key);
    }, [state.currentPlanId]);

    const contextValue: ChatContextType = {
        ...state,
        openChat,
        closeChat,
        toggleChat,
        sendMessage,
        addAttachment,
        removeAttachment,
        clearAttachments,
        openAttachmentPicker,
        closeAttachmentPicker,
        loadHistory,
        clearHistory,
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
}

// Custom hook to use chat context
export function useChat(): ChatContextType {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}

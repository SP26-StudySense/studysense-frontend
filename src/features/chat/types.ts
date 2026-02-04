/**
 * Chat AI Types
 * Types for the Chat AI popup feature
 */

// Chat message role
export type MessageRole = 'user' | 'assistant';

// Attachment types for tasks and modules
export type AttachmentType = 'task' | 'module';

// Chat attachment - can be a task or module
export interface ChatAttachment {
    id: string;
    type: AttachmentType;
    title: string;
    moduleId?: string;
    taskId?: string;
}

// Single chat message
export interface ChatMessage {
    id: string;
    planId: string;
    role: MessageRole;
    content: string;
    attachments?: ChatAttachment[];
    createdAt: string;
}

// Chat session for a plan
export interface ChatSession {
    planId: string;
    messages: ChatMessage[];
    lastUpdated: string;
}

// Chat context state
export interface ChatState {
    isOpen: boolean;
    currentPlanId: string;
    messages: ChatMessage[];
    pendingAttachments: ChatAttachment[];
    isLoading: boolean;
    isAttachmentPickerOpen: boolean;
}

// Chat context actions
export interface ChatActions {
    openChat: () => void;
    closeChat: () => void;
    toggleChat: () => void;
    sendMessage: (content: string) => void;
    addAttachment: (attachment: ChatAttachment) => void;
    removeAttachment: (attachmentId: string) => void;
    clearAttachments: () => void;
    openAttachmentPicker: () => void;
    closeAttachmentPicker: () => void;
    loadHistory: (planId: string) => void;
    clearHistory: () => void;
}

// Combined context type
export interface ChatContextType extends ChatState, ChatActions { }

// Mock module data for attachment picker
export interface MockModule {
    id: string;
    title: string;
    status: 'completed' | 'in_progress' | 'not_started' | 'locked';
    taskCount: number;
}

// Mock task data for attachment picker
export interface MockTask {
    id: string;
    moduleId: string;
    title: string;
    isCompleted: boolean;
}

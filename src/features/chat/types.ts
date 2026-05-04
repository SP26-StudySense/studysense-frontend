export type MessageRole = 'user' | 'assistant';

export type AttachmentType = 'task' | 'module';

export interface ChatAttachment {
    id: string;
    type: AttachmentType;
    title: string;
    moduleId?: number;
    taskId?: number;
}

export interface ChatContextPayload {
    moduleIds: number[];
    taskIds: number[];
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    createdAt: string;
    context?: ChatContextPayload | null;
    attachments?: ChatAttachment[];
}

export interface ChatConversation {
    id: string;
    userId: string;
    roadmapId: number;
    title: string;
    createdAt: string;
    lastMessageAt: string;
    isActive: boolean;
}

export interface AvailableModule {
    id: number;
    title: string;
    taskCount?: number;
    status?: string;
}

export interface AvailableTask {
    id: number;
    title: string;
    moduleId?: number;
    moduleTitle?: string;
    isCompleted?: boolean;
}

export interface ChatState {
    isOpen: boolean;
    roadmapId: number | null;
    messages: ChatMessage[];
    conversations: ChatConversation[];
    selectedConversationId: string | null;
    pendingAttachments: ChatAttachment[];
    availableModules: AvailableModule[];
    availableTasks: AvailableTask[];
    isLoading: boolean;
    isAttachmentPickerOpen: boolean;
    isConversationLoading: boolean;
    isHistoryLoading: boolean;
    isCreatingConversation: boolean;
    isDeletingConversation: boolean;
}

export interface ChatActions {
    openChat: () => void;
    closeChat: () => void;
    toggleChat: () => void;
    sendMessage: (content: string) => Promise<void>;
    addAttachment: (attachment: ChatAttachment) => void;
    removeAttachment: (attachmentId: string) => void;
    clearAttachments: () => void;
    openAttachmentPicker: () => void;
    closeAttachmentPicker: () => void;
    selectConversation: (conversationId: string) => void;
    createConversation: () => Promise<void>;
    deleteConversation: (conversationId: string) => Promise<void>;
    clearHistory: () => Promise<void>;
}

export interface ChatContextType extends ChatState, ChatActions {}

export interface SendChatMessageRequest {
  userId?: string;
  conversationId: string | null;
  roadmapId: number;
  messageContent: string;
  moduleIds?: number[];
  taskIds?: number[];
}

export interface SendChatMessageResponse {
  conversationId: string;
  messageId: string;
  aiResponse: string;
  timestamp: string;
}

export interface CreateConversationRequest {
  roadmapId: number;
  title?: string;
}

export interface CreateConversationResponse {
  success: boolean;
  message: string;
  conversationId: string;
  title: string;
}

export interface ChatConversationDto {
  id: string;
  userId: string;
  roadmapId: number;
  title: string;
  createdAt: string;
  lastMessageAt: string;
  isActive: boolean;
}

export interface MessageContextDto {
  moduleIds: number[];
  taskIds: number[];
}

export type ChatMessageRoleDto = 'User' | 'System';

export interface ChatHistoryMessageDto {
  id: string;
  conversationId: string;
  userId: string;
  role: ChatMessageRoleDto;
  messageContent: string;
  context: MessageContextDto | null;
  timestamp: string;
}

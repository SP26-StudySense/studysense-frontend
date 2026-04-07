import { useMutation } from '@tanstack/react-query';

import { post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

import type {
  CreateConversationRequest,
  CreateConversationResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from './types';

export function useSendChatMessage() {
  return useMutation({
    mutationFn: (payload: SendChatMessageRequest) =>
      post<SendChatMessageResponse, SendChatMessageRequest>(
        endpoints.chat.send,
        payload
      ),
  });
}

export function useCreateChatConversation() {
  return useMutation({
    mutationFn: (payload: CreateConversationRequest) =>
      post<CreateConversationResponse, CreateConversationRequest>(
        endpoints.chat.createConversation,
        payload
      ),
  });
}

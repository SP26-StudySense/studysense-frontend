import { useQuery } from '@tanstack/react-query';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';

import type { ChatConversationDto, ChatHistoryMessageDto } from './types';

export function useChatConversations(roadmapId?: number | null, userId?: string) {
  const resolvedRoadmapId = roadmapId ?? undefined;

  return useQuery({
    queryKey:
      roadmapId != null
        ? queryKeys.chat.conversationsByRoadmap(String(roadmapId))
        : queryKeys.chat.conversations(),
    queryFn: () =>
      get<ChatConversationDto[]>(endpoints.chat.conversations(resolvedRoadmapId), {
        params: userId ? { userId } : undefined,
      }),
    staleTime: 30 * 1000,
  });
}

export function useChatHistory(conversationId?: string | null) {
  return useQuery({
    queryKey: queryKeys.chat.history(conversationId ?? ''),
    queryFn: () => get<ChatHistoryMessageDto[]>(endpoints.chat.history(conversationId ?? '')),
    enabled: Boolean(conversationId),
    staleTime: 15 * 1000,
  });
}

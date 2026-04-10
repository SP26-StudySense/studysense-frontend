import { useQuery } from '@tanstack/react-query';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';

import type { ChatConversationDto, ChatHistoryMessageDto } from './types';

export function useChatConversations(roadmapId?: number | null, userId?: string) {
  const resolvedRoadmapId = roadmapId ?? undefined;
  const hasRoadmapScope =
    typeof resolvedRoadmapId === 'number' &&
    Number.isFinite(resolvedRoadmapId) &&
    resolvedRoadmapId > 0;

  return useQuery({
    queryKey:
      hasRoadmapScope
        ? queryKeys.chat.conversationsByRoadmap(String(resolvedRoadmapId))
        : ['chat', 'conversations', 'unresolved'],
    queryFn: () => {
      const params: { userId?: string; roadmapId?: number } = {};

      if (userId) {
        params.userId = userId;
      }

      if (hasRoadmapScope) {
        params.roadmapId = resolvedRoadmapId;
      }

      return get<ChatConversationDto[]>(endpoints.chat.conversations, {
        params,
      });
    },
    enabled: hasRoadmapScope,
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

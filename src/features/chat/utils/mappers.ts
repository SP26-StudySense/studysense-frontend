import type {
  ChatConversationDto,
  ChatHistoryMessageDto,
  MessageContextDto,
} from '../api';
import type {
  AvailableModule,
  AvailableTask,
  ChatAttachment,
  ChatConversation,
  ChatMessage,
  MessageRole,
} from '../types';

function toRole(role: ChatHistoryMessageDto['role']): MessageRole {
  return role === 'User' ? 'user' : 'assistant';
}

function toAttachmentTitle(
  kind: 'module' | 'task',
  id: number,
  modulesMap: Map<number, AvailableModule>,
  tasksMap: Map<number, AvailableTask>
): string {
  if (kind === 'module') {
    return modulesMap.get(id)?.title ?? `Module #${id}`;
  }

  return tasksMap.get(id)?.title ?? `Task #${id}`;
}

function mapContextToAttachments(
  context: MessageContextDto | null,
  modulesMap: Map<number, AvailableModule>,
  tasksMap: Map<number, AvailableTask>
): ChatAttachment[] {
  if (!context) {
    return [];
  }

  const moduleAttachments: ChatAttachment[] = (context.moduleIds ?? []).map((moduleId) => ({
    id: `module_${moduleId}`,
    type: 'module',
    moduleId,
    title: toAttachmentTitle('module', moduleId, modulesMap, tasksMap),
  }));

  const taskAttachments: ChatAttachment[] = (context.taskIds ?? []).map((taskId) => {
    const task = tasksMap.get(taskId);
    return {
      id: `task_${taskId}`,
      type: 'task',
      taskId,
      moduleId: task?.moduleId,
      title: toAttachmentTitle('task', taskId, modulesMap, tasksMap),
    };
  });

  return [...moduleAttachments, ...taskAttachments];
}

export function mapConversationDto(item: ChatConversationDto): ChatConversation {
  return {
    id: item.id,
    userId: item.userId,
    roadmapId: item.roadmapId,
    title: item.title,
    createdAt: item.createdAt,
    lastMessageAt: item.lastMessageAt,
    isActive: item.isActive,
  };
}

export function mapHistoryMessageDto(
  item: ChatHistoryMessageDto,
  modulesMap: Map<number, AvailableModule>,
  tasksMap: Map<number, AvailableTask>
): ChatMessage {
  return {
    id: item.id,
    conversationId: item.conversationId,
    role: toRole(item.role),
    content: item.messageContent,
    createdAt: item.timestamp,
    context: item.context,
    attachments: mapContextToAttachments(item.context, modulesMap, tasksMap),
  };
}

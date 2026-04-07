'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { toast } from '@/shared/lib/toast';
import { queryKeys } from '@/shared/api/query-keys';
import { useStudyPlan, useStudyPlans, useTasksByPlan } from '@/features/study-plan/api/queries';
import { useRoadmapGraph } from '@/features/roadmaps/api/queries';
import { useCurrentUser } from '@/features/auth/api/queries';
import { useSessionStore } from '@/store/session.store';

import {
    useChatConversations,
    useChatHistory,
    useCreateChatConversation,
    useSendChatMessage,
} from '../api';
import { mapConversationDto, mapHistoryMessageDto } from '../utils/mappers';
import { resolveChatRouteContext } from '../utils/route-context';
import {
    AvailableModule,
    AvailableTask,
    ChatAttachment,
    ChatContextType,
    ChatMessage,
    ChatState,
} from '../types';

const initialState: ChatState = {
    isOpen: false,
    roadmapId: null,
    messages: [],
    conversations: [],
    selectedConversationId: null,
    pendingAttachments: [],
    availableModules: [],
    availableTasks: [],
    isLoading: false,
    isAttachmentPickerOpen: false,
    isConversationLoading: false,
    isHistoryLoading: false,
    isCreatingConversation: false,
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const generateId = () => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

function areModulesEqual(prev: AvailableModule[], next: AvailableModule[]): boolean {
    if (prev === next) return true;
    if (prev.length !== next.length) return false;

    for (let i = 0; i < prev.length; i += 1) {
        const a = prev[i];
        const b = next[i];
        if (
            a.id !== b.id ||
            a.title !== b.title ||
            a.taskCount !== b.taskCount ||
            a.status !== b.status
        ) {
            return false;
        }
    }

    return true;
}

function areTasksEqual(prev: AvailableTask[], next: AvailableTask[]): boolean {
    if (prev === next) return true;
    if (prev.length !== next.length) return false;

    for (let i = 0; i < prev.length; i += 1) {
        const a = prev[i];
        const b = next[i];
        if (
            a.id !== b.id ||
            a.title !== b.title ||
            a.moduleId !== b.moduleId ||
            a.moduleTitle !== b.moduleTitle ||
            a.isCompleted !== b.isCompleted
        ) {
            return false;
        }
    }

    return true;
}

function areConversationItemsEqual(
    prev: ChatState['conversations'],
    next: ChatState['conversations']
): boolean {
    if (prev === next) return true;
    if (prev.length !== next.length) return false;

    for (let i = 0; i < prev.length; i += 1) {
        const a = prev[i];
        const b = next[i];
        if (
            a.id !== b.id ||
            a.title !== b.title ||
            a.roadmapId !== b.roadmapId ||
            a.lastMessageAt !== b.lastMessageAt
        ) {
            return false;
        }
    }

    return true;
}

function areMessagesEqual(prev: ChatMessage[], next: ChatMessage[]): boolean {
    if (prev === next) return true;
    if (prev.length !== next.length) return false;

    for (let i = 0; i < prev.length; i += 1) {
        const a = prev[i];
        const b = next[i];
        if (
            a.id !== b.id ||
            a.conversationId !== b.conversationId ||
            a.role !== b.role ||
            a.content !== b.content ||
            a.createdAt !== b.createdAt
        ) {
            return false;
        }
    }

    return true;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const [state, setState] = useState<ChatState>(initialState);
    const { data: currentUser } = useCurrentUser({ enabled: true });
    const activeStudyPlanId = useSessionStore((store) => store.activeStudyPlanId);
    const selectedSessionTasks = useSessionStore((store) => store.selectedTasks);

    const routeContext = useMemo(() => resolveChatRouteContext(pathname), [pathname]);
    const studyPlanId = routeContext.studyPlanId ?? activeStudyPlanId;

    const { data: studyPlans = [] } = useStudyPlans();
    const { data: studyPlan } = useStudyPlan(studyPlanId ?? undefined);

    const fallbackRoadmapId = studyPlans[0]?.roadmapId ?? null;
    const fallbackRoadmapTitle = studyPlans[0]?.roadmapTitle;

    const resolvedRoadmapId = routeContext.directRoadmapId ?? studyPlan?.roadmapId ?? null;

    const { data: roadmapGraph } = useRoadmapGraph(resolvedRoadmapId);
    const { data: tasksByPlan = [] } = useTasksByPlan(studyPlanId ?? undefined);

    const availableModules = useMemo<AvailableModule[]>(() => {
        if (!roadmapGraph?.nodes) {
            return [];
        }

        const taskCountMap = new Map<number, number>();
        if (studyPlan?.modules && tasksByPlan.length > 0) {
            const studyPlanModuleMap = new Map(
                studyPlan.modules.map((module) => [module.id, module.roadmapNodeId])
            );

            tasksByPlan.forEach((task) => {
                const moduleId = studyPlanModuleMap.get(task.studyPlanModuleId);
                if (moduleId == null) {
                    return;
                }
                taskCountMap.set(moduleId, (taskCountMap.get(moduleId) ?? 0) + 1);
            });
        }

        const statusByNode = new Map(
            (studyPlan?.modules ?? []).map((module) => [module.roadmapNodeId, module.status])
        );

        return roadmapGraph.nodes.map((node) => ({
            id: node.id,
            title: node.title,
            taskCount: taskCountMap.get(node.id) ?? 0,
            status: statusByNode.get(node.id) ?? undefined,
        }));
    }, [roadmapGraph?.nodes, studyPlan?.modules, tasksByPlan]);

    const availableTasks = useMemo<AvailableTask[]>(() => {
        if (tasksByPlan.length > 0 && studyPlan?.modules) {
            const moduleIdByStudyPlanModuleId = new Map(
                studyPlan.modules.map((module) => [module.id, module.roadmapNodeId])
            );
            const moduleTitleById = new Map(availableModules.map((module) => [module.id, module.title]));

            return tasksByPlan.map((task) => {
                const moduleId = moduleIdByStudyPlanModuleId.get(task.studyPlanModuleId);
                return {
                    id: task.id,
                    title: task.title,
                    moduleId,
                    moduleTitle: moduleId ? moduleTitleById.get(moduleId) : undefined,
                    isCompleted: task.status === 'Completed',
                };
            });
        }

        return selectedSessionTasks.map((task) => ({
            id: Number(task.id),
            title: task.title,
            isCompleted: task.isCompleted,
        }));
    }, [availableModules, selectedSessionTasks, studyPlan?.modules, tasksByPlan]);

    const modulesMap = useMemo(
        () => new Map(availableModules.map((module) => [module.id, module])),
        [availableModules]
    );
    const tasksMap = useMemo(
        () => new Map(availableTasks.map((task) => [task.id, task])),
        [availableTasks]
    );

    const conversationsQuery = useChatConversations(resolvedRoadmapId, currentUser?.id);
    const historyQuery = useChatHistory(state.selectedConversationId);
    const sendMessageMutation = useSendChatMessage();
    const createConversationMutation = useCreateChatConversation();

    const selectedConversation = useMemo(
        () => state.conversations.find((item) => item.id === state.selectedConversationId) ?? null,
        [state.conversations, state.selectedConversationId]
    );

    useEffect(() => {
        setState((prev) => {
            const sameRoadmapId = prev.roadmapId === resolvedRoadmapId;
            const sameModules = areModulesEqual(prev.availableModules, availableModules);
            const sameTasks = areTasksEqual(prev.availableTasks, availableTasks);
            const sameConversationLoading = prev.isConversationLoading === conversationsQuery.isLoading;
            const sameHistoryLoading = prev.isHistoryLoading === historyQuery.isLoading;
            const sameCreatingConversation =
                prev.isCreatingConversation === createConversationMutation.isPending;

            if (
                sameRoadmapId &&
                sameModules &&
                sameTasks &&
                sameConversationLoading &&
                sameHistoryLoading &&
                sameCreatingConversation
            ) {
                return prev;
            }

            return {
                ...prev,
                roadmapId: resolvedRoadmapId,
                availableModules,
                availableTasks,
                isConversationLoading: conversationsQuery.isLoading,
                isHistoryLoading: historyQuery.isLoading,
                isCreatingConversation: createConversationMutation.isPending,
            };
        });
    }, [
        availableModules,
        availableTasks,
        conversationsQuery.isLoading,
        createConversationMutation.isPending,
        historyQuery.isLoading,
        resolvedRoadmapId,
    ]);

    useEffect(() => {
        if (!conversationsQuery.data) {
            return;
        }

        const conversations = conversationsQuery.data.map(mapConversationDto);
        setState((prev) => {
            const selectedExists = conversations.some((item) => item.id === prev.selectedConversationId);
            const nextSelectedId = selectedExists ? prev.selectedConversationId : conversations[0]?.id ?? null;

            if (
                areConversationItemsEqual(prev.conversations, conversations) &&
                prev.selectedConversationId === nextSelectedId
            ) {
                return prev;
            }

            return {
                ...prev,
                conversations,
                selectedConversationId: nextSelectedId,
            };
        });
    }, [conversationsQuery.data]);

    useEffect(() => {
        if (!historyQuery.data) {
            return;
        }

        const mappedMessages = historyQuery.data.map((item) =>
            mapHistoryMessageDto(item, modulesMap, tasksMap)
        );

        setState((prev) => {
            if (areMessagesEqual(prev.messages, mappedMessages)) {
                return prev;
            }

            return {
                ...prev,
                messages: mappedMessages,
            };
        });
    }, [historyQuery.data, modulesMap, tasksMap]);

    const openChat = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: true }));
    }, []);

    const closeChat = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false, isAttachmentPickerOpen: false }));
    }, []);

    const toggleChat = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
    }, []);

    const createConversation = useCallback(async () => {
        const activeRoadmapId =
            state.roadmapId ?? selectedConversation?.roadmapId ?? fallbackRoadmapId ?? null;
        if (!activeRoadmapId) {
            toast.error('Không xác định được roadmap để tạo conversation.');
            return;
        }

        try {
            const response = await createConversationMutation.mutateAsync({
                roadmapId: activeRoadmapId,
                title: studyPlan?.roadmapName ?? fallbackRoadmapTitle,
            });

            setState((prev) => ({
                ...prev,
                selectedConversationId: response.conversationId,
                messages: [],
            }));

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.chat.all }),
                queryClient.invalidateQueries({
                    queryKey: queryKeys.chat.history(response.conversationId),
                }),
            ]);
        } catch (error) {
            toast.apiError(error, 'Tạo conversation thất bại');
        }
    }, [
        createConversationMutation,
        queryClient,
        fallbackRoadmapId,
        fallbackRoadmapTitle,
        selectedConversation?.roadmapId,
        state.roadmapId,
        studyPlan?.roadmapName,
    ]);

    const sendMessage = useCallback(
        async (content: string) => {
            const messageContent = content.trim();
            if (!messageContent || state.isLoading) {
                return;
            }

            const activeRoadmapId =
                state.roadmapId ?? selectedConversation?.roadmapId ?? fallbackRoadmapId ?? null;
            if (!activeRoadmapId) {
                toast.error('Không xác định được roadmap từ URL hiện tại.');
                return;
            }

            let activeConversationId = state.selectedConversationId;
            if (!activeConversationId) {
                try {
                    const createdConversation = await createConversationMutation.mutateAsync({
                        roadmapId: activeRoadmapId,
                        title: studyPlan?.roadmapName ?? fallbackRoadmapTitle,
                    });
                    activeConversationId = createdConversation.conversationId;
                    setState((prev) => ({
                        ...prev,
                        selectedConversationId: createdConversation.conversationId,
                    }));
                } catch (error) {
                    toast.apiError(error, 'Không thể tạo conversation mới');
                    return;
                }
            }

            const moduleIds = state.pendingAttachments
                .filter((item) => item.type === 'module' && item.moduleId != null)
                .map((item) => item.moduleId as number);
            const taskIds = state.pendingAttachments
                .filter((item) => item.type === 'task' && item.taskId != null)
                .map((item) => item.taskId as number);

            const userMessage: ChatMessage = {
                id: generateId(),
                conversationId: activeConversationId,
                role: 'user',
                content: messageContent,
                createdAt: new Date().toISOString(),
                attachments: state.pendingAttachments.length > 0 ? [...state.pendingAttachments] : undefined,
                context: {
                    moduleIds,
                    taskIds,
                },
            };

            setState((prev) => ({
                ...prev,
                messages: [...prev.messages, userMessage],
                pendingAttachments: [],
                isLoading: true,
            }));

            try {
                const response = await sendMessageMutation.mutateAsync({
                    userId: currentUser?.id,
                    conversationId: activeConversationId,
                    roadmapId: activeRoadmapId,
                    messageContent,
                    moduleIds,
                    taskIds,
                });

                const aiMessage: ChatMessage = {
                    id: response.messageId,
                    conversationId: response.conversationId,
                    role: 'assistant',
                    content: response.aiResponse,
                    createdAt: response.timestamp,
                    context: null,
                };

                setState((prev) => ({
                    ...prev,
                    selectedConversationId: response.conversationId,
                    messages: [...prev.messages, aiMessage],
                    isLoading: false,
                }));

                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: queryKeys.chat.all }),
                    queryClient.invalidateQueries({
                        queryKey: queryKeys.chat.history(response.conversationId),
                    }),
                ]);
            } catch (error) {
                setState((prev) => ({ ...prev, isLoading: false }));
                toast.apiError(error, 'Gửi tin nhắn thất bại');
            }
        },
        [
            createConversationMutation,
            currentUser?.id,
            fallbackRoadmapId,
            fallbackRoadmapTitle,
            queryClient,
            selectedConversation?.roadmapId,
            sendMessageMutation,
            state.isLoading,
            state.pendingAttachments,
            state.roadmapId,
            state.selectedConversationId,
            studyPlan?.roadmapName,
        ]
    );

    const addAttachment = useCallback((attachment: ChatAttachment) => {
        setState((prev) => {
            if (prev.pendingAttachments.some((item) => item.id === attachment.id)) {
                return prev;
            }

            return {
                ...prev,
                pendingAttachments: [...prev.pendingAttachments, attachment],
            };
        });
    }, []);

    const removeAttachment = useCallback((attachmentId: string) => {
        setState((prev) => ({
            ...prev,
            pendingAttachments: prev.pendingAttachments.filter((item) => item.id !== attachmentId),
        }));
    }, []);

    const clearAttachments = useCallback(() => {
        setState((prev) => ({ ...prev, pendingAttachments: [] }));
    }, []);

    const openAttachmentPicker = useCallback(() => {
        setState((prev) => ({ ...prev, isAttachmentPickerOpen: true }));
    }, []);

    const closeAttachmentPicker = useCallback(() => {
        setState((prev) => ({ ...prev, isAttachmentPickerOpen: false }));
    }, []);

    const selectConversation = useCallback((conversationId: string) => {
        setState((prev) => ({
            ...prev,
            selectedConversationId: conversationId,
        }));
    }, []);

    const clearHistory = useCallback(() => {
        if (state.selectedConversationId) {
            queryClient.invalidateQueries({
                queryKey: queryKeys.chat.history(state.selectedConversationId),
            });
        }

        setState((prev) => ({
            ...prev,
            messages: [],
        }));
    }, [queryClient, state.selectedConversationId]);

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
        selectConversation,
        createConversation,
        clearHistory,
    };

    return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextType {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}

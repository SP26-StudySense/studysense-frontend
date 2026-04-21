'use client';

import { useState } from 'react';
import { MessageSquare, MoreVertical, Plus, Trash2 } from 'lucide-react';

import { useChat } from '@/features/chat/context/ChatContext';
import { ConfirmationModal } from '@/shared/ui';
import { formatDateTimeInUserTimeZone } from '@/shared/lib/date-time';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { AttachmentPicker } from './AttachmentPicker';

export function ChatWorkspace() {
  const [menuConversationId, setMenuConversationId] = useState<string | null>(null);
  const [confirmDeleteConversationId, setConfirmDeleteConversationId] = useState<string | null>(null);

  const {
    conversations,
    selectedConversationId,
    selectConversation,
    messages,
    isLoading,
    sendMessage,
    pendingAttachments,
    removeAttachment,
    openAttachmentPicker,
    isAttachmentPickerOpen,
    closeAttachmentPicker,
    addAttachment,
    availableModules,
    availableTasks,
    isConversationLoading,
    isHistoryLoading,
    isCreatingConversation,
    isDeletingConversation,
    createConversation,
    deleteConversation,
  } = useChat();

  return (
    <div className="h-[calc(100dvh-160px)] min-h-[520px] rounded-2xl border border-neutral-200/70 bg-white/70 backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="border-r border-neutral-200/70 bg-neutral-50/70 flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-neutral-200/70">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-neutral-800">Conversations</h2>
            <button
              onClick={createConversation}
              disabled={isConversationLoading || isCreatingConversation}
              className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-white px-2 py-1 text-[11px] font-medium text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
              {isCreatingConversation ? 'Creating...' : 'New'}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Choose a conversation for the current roadmap</p>
        </div>

        <div className="p-2 space-y-1 overflow-y-auto flex-1 min-h-0">
          {isConversationLoading && (
            <p className="px-3 py-2 text-xs text-neutral-500">Loading conversations...</p>
          )}

          {!isConversationLoading && conversations.length === 0 && (
            <p className="px-3 py-2 text-xs text-neutral-500">
              No conversations yet. Send your first message to create one.
            </p>
          )}

          {conversations.map((conversation) => {
            const isActive = conversation.id === selectedConversationId;
            const isMenuOpen = menuConversationId === conversation.id;

            return (
              <div
                key={conversation.id}
                className={`relative w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? 'border-violet-300 bg-violet-50'
                    : 'border-transparent bg-white hover:border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => selectConversation(conversation.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-sm font-medium text-neutral-800 truncate">{conversation.title}</p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {formatDateTimeInUserTimeZone(conversation.lastMessageAt)}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuConversationId((prev) => (prev === conversation.id ? null : conversation.id));
                    }}
                    className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                    aria-label="Conversation options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {isMenuOpen && (
                  <div className="absolute right-2 top-9 z-10 w-44 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDeleteConversationId(conversation.id);
                        setMenuConversationId(null);
                      }}
                      disabled={isDeletingConversation}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete conversation
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <section className="flex flex-col min-w-0 min-h-0">
        <div className="px-4 py-3 border-b border-neutral-200/70 bg-white/70">
          <h1 className="text-base font-semibold text-neutral-900">Study Assistant</h1>
          <p className="text-xs text-neutral-500">Your AI study coach for this roadmap</p>
        </div>

        {isHistoryLoading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-neutral-500 gap-2">
            <MessageSquare className="h-4 w-4" />
            Loading chat history...
          </div>
        ) : (
          <ChatMessageList messages={messages} isLoading={isLoading} />
        )}

        <ChatInput
          onSend={sendMessage}
          onOpenAttachmentPicker={openAttachmentPicker}
          pendingAttachments={pendingAttachments}
          onRemoveAttachment={removeAttachment}
          disabled={isLoading}
        />
      </section>

      <AttachmentPicker
        isOpen={isAttachmentPickerOpen}
        onClose={closeAttachmentPicker}
        onSelect={addAttachment}
        selectedIds={pendingAttachments.map((item) => item.id)}
        modules={availableModules}
        tasks={availableTasks}
      />

      <ConfirmationModal
        isOpen={confirmDeleteConversationId !== null}
        onClose={() => setConfirmDeleteConversationId(null)}
        onConfirm={() => {
          if (!confirmDeleteConversationId) {
            return;
          }

          void deleteConversation(confirmDeleteConversationId);
        }}
        title="Delete conversation?"
        description="This action will permanently remove the selected conversation and all its messages."
        confirmText={isDeletingConversation ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

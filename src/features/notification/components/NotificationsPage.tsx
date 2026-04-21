'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BellRing,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

import { Skeleton } from '@/shared/ui';
import { useNotifications } from '../hooks/use-notifications';
import { formatNotificationDistance } from '../api/date-utils';

const PAGE_SIZE = 20;

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'unseen'>('all');

  const {
    items,
    unreadItems,
    total,
    unreadCount,
    isLoading,
    isRefreshing,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
    refresh,
  } = useNotifications(page, PAGE_SIZE);

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    return Math.ceil(total / PAGE_SIZE);
  }, [total]);

  useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [page, totalPages]);

  const displayItems = activeTab === 'unseen' ? unreadItems : items;

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-3 rounded-xl border border-neutral-200/80 bg-gradient-to-br from-white via-[#f9fbff] to-[#f5f9ff] p-3 shadow-sm shadow-neutral-900/5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-neutral-900">Notifications</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#00bae2]/10 px-2 py-0.5 text-[11px] font-medium text-[#0a7f97]">
              <BellRing className="h-3 w-3" />
              {unreadCount} unread
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => refresh()}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => markAllAsRead()}
              disabled={unreadCount === 0 || isMarkingAllAsRead}
              className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-2 py-1 text-xs font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          </div>
        </div>

        <div className="mt-2 inline-flex rounded-xl bg-white/90 p-1 shadow-sm ring-1 ring-neutral-200/80">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unseen')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              activeTab === 'unseen'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            Unseen {unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`notification-skeleton-${index}`}
              className="rounded-lg border border-neutral-200/80 bg-white/90 px-2.5 py-2 shadow-sm"
            >
              <Skeleton className="h-4 w-48" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <Bell className="h-7 w-7" />
          </div>
          {activeTab === 'unseen' ? (
            <>
              <h2 className="text-lg font-semibold text-neutral-900">No unseen notifications</h2>
              <p className="mt-1 text-sm text-neutral-500">
                You're all caught up for now.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-neutral-900">No notifications yet</h2>
              <p className="mt-1 text-sm text-neutral-500">
                New updates and reminders will appear here.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {displayItems.map((item) => (
              <button
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`w-full rounded-lg border px-2.5 py-1.5 text-left shadow-sm transition ${
                  item.isRead
                    ? 'border-neutral-200/80 bg-white/90 hover:border-neutral-300 hover:bg-neutral-50'
                    : 'border-[#d5e8ff] bg-[#f3f8ff] hover:border-[#bddcff]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="line-clamp-1 text-sm font-semibold leading-5 text-neutral-900">{item.title}</p>
                  </div>
                  {!item.isRead ? (
                    <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#1b74e4]" />
                  ) : null}
                </div>
                <p className="mt-0.5 line-clamp-1 text-[13px] leading-5 text-neutral-700">{item.content}</p>
                <p className="mt-0.5 text-[11px] font-medium text-[#1b74e4]">
                  {formatNotificationDistance(item.createdAt)}
                </p>
              </button>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200/60 bg-white/70 px-3 py-2">
              <p className="text-xs text-neutral-600">
                Showing {from}-{to} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <span className="px-2 text-xs text-neutral-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

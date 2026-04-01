'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

import { useCurrentUser } from '@/features/auth/api/queries';
import { toast } from '@/shared/lib';
import { getPushStatus, requestPushPermissionAndSync, type PushStatus } from './onesignal-client';
import { useNotifications } from './use-notifications';
import { formatNotificationDistance } from './date-utils';

interface NotificationBellProps {
  showTestButton?: boolean;
  iconClassName?: string;
  buttonClassName?: string;
}

export function NotificationBell({
  showTestButton = false,
  iconClassName = 'h-5 w-5',
  buttonClassName = 'relative text-neutral-500 transition-colors hover:text-neutral-900',
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unseen'>('all');
  const { data: user } = useCurrentUser();
  const [pushStatus, setPushStatus] = useState<PushStatus>('unavailable');
  const {
    items,
    unreadItems,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
    sendTest,
    isSendingTest,
  } = useNotifications(1, 7);

  const refreshPushStatus = useCallback(async () => {
    const status = await getPushStatus();
    setPushStatus(status);
  }, []);

  useEffect(() => {
    refreshPushStatus().catch(() => {
      setPushStatus('unavailable');
    });
  }, [refreshPushStatus]);

  const pushStatusLabel: Record<PushStatus, string> = {
    enabled: 'Push enabled',
    'not-enabled': 'Push not enabled',
    blocked: 'Push blocked',
    unsupported: 'Push unsupported',
    unavailable: 'Push unavailable',
  };

  const pushStatusClassName: Record<PushStatus, string> = {
    enabled: 'bg-emerald-100 text-emerald-700',
    'not-enabled': 'bg-amber-100 text-amber-700',
    blocked: 'bg-rose-100 text-rose-700',
    unsupported: 'bg-neutral-200 text-neutral-700',
    unavailable: 'bg-neutral-200 text-neutral-700',
  };

  const handleEnablePush = async () => {
    const granted = await requestPushPermissionAndSync();
    await refreshPushStatus().catch(() => {
      // noop
    });

    if (granted) {
      toast.success('Push notifications enabled');
      return;
    }

    toast.info('Push notifications not enabled', {
      description: 'Please allow browser notifications to receive push alerts.',
    });
  };

  const filteredItems = activeTab === 'unseen' ? unreadItems : items;
  const notificationsHref = (() => {
    const normalizedRoles = (user?.roles ?? []).map((role) =>
      role.toLowerCase().replace(/\s+/g, '')
    );

    if (normalizedRoles.includes('admin')) return '/admin-notifications';
    if (normalizedRoles.includes('analyst')) return '/analyst-notifications';
    if (normalizedRoles.includes('contentmanager')) return '/content-notifications';

    return '/notifications';
  })();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={buttonClassName}
      >
        <Bell className={iconClassName} />
        {unreadCount > 0 ? (
          <span className="absolute -right-2 -top-2 min-w-[18px] rounded-full bg-red-500 px-1.5 text-center text-[10px] font-semibold leading-[18px] text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-[380px] overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-2xl shadow-neutral-900/10">
          <div className="border-b border-neutral-200/70 bg-gradient-to-br from-[#ebfaff] via-[#f7fbff] to-[#f2f7ff] p-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-base font-semibold text-neutral-900">Notification</p>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${pushStatusClassName[pushStatus]}`}
                >
                  {pushStatusLabel[pushStatus]}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="inline-flex rounded-xl bg-white/80 p-1 shadow-sm ring-1 ring-neutral-200/80">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'all'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('unseen')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'unseen'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  Unseen {unreadCount > 0 ? `(${unreadCount})` : ''}
                </button>
              </div>

              <button
                onClick={() => markAllAsRead()}
                disabled={unreadCount === 0 || isMarkingAllAsRead}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark all as read
              </button>
            </div>

            <div className="mt-3 flex items-center justify-end gap-3 pr-1">
              {pushStatus !== 'enabled' ? (
                <button
                  onClick={handleEnablePush}
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Enable Push
                </button>
              ) : null}
              {showTestButton ? (
                <button
                  onClick={() => sendTest()}
                  disabled={isSendingTest}
                  className="text-xs text-[#00bae2] hover:text-[#0a7f97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Test
                </button>
              ) : null}
            </div>
          </div>

          <div className="max-h-[380px] space-y-2 overflow-y-auto bg-white p-3">
            {filteredItems.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-6 text-center text-sm text-neutral-500">
                {activeTab === 'unseen' ? 'No unseen notifications.' : 'No notifications yet.'}
              </p>
            ) : (
              filteredItems.slice(0, 7).map((item) => (
                <button
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                    item.isRead
                      ? 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                      : 'border-[#00bae2]/30 bg-[#00bae2]/5 hover:border-[#00bae2]/50'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-medium text-neutral-900">{item.title}</p>
                    {!item.isRead ? (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#00bae2]" />
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-xs text-neutral-600">{item.content}</p>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    {formatNotificationDistance(item.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-neutral-200 px-3 py-2 text-right">
            <Link
              href={notificationsHref}
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-[#00bae2] transition-colors hover:text-[#0a7f97]"
            >
              See All
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

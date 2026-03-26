'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell } from 'lucide-react';

import { toast } from '@/shared/lib';
import { getPushStatus, requestPushPermissionAndSync, type PushStatus } from './onesignal-client';
import { useNotifications } from './use-notifications';

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
  const [pushStatus, setPushStatus] = useState<PushStatus>('unavailable');
  const {
    items,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
    sendTest,
    isSendingTest,
  } = useNotifications(1, 20);

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
        <div className="absolute right-0 mt-3 w-[360px] rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-neutral-900">Notifications</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${pushStatusClassName[pushStatus]}`}
              >
                {pushStatusLabel[pushStatus]}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => markAllAsRead()}
                disabled={unreadCount === 0 || isMarkingAllAsRead}
                className="text-xs text-neutral-600 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark all as read
              </button>
              {pushStatus !== 'enabled' ? (
                <button
                  onClick={handleEnablePush}
                  className="text-xs text-neutral-600 hover:text-neutral-900"
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

          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <p className="rounded-lg bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
                No notifications yet.
              </p>
            ) : (
              items.slice(0, 10).map((item) => (
                <button
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-left transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-medium text-neutral-900">{item.title}</p>
                    {!item.isRead ? (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#00bae2]" />
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-xs text-neutral-600">{item.content}</p>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

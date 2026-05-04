'use client';

import { useEffect, useMemo, useState } from 'react';
import { Flame, TrendingUp } from 'lucide-react';

import { useCurrentUser } from '@/features/auth/api/queries';
import { cn } from '@/shared/lib/utils';
import {
  readStoredStreakState,
  STREAK_UPDATED_EVENT,
  type StreakUpdatedEventDetail,
} from './streak-storage';

function toUtcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function toUtcDayNumber(dateKey: string): number | null {
  const parsed = Date.parse(`${dateKey}T00:00:00Z`);
  if (!Number.isFinite(parsed)) return null;
  return Math.floor(parsed / 86_400_000);
}

function hasMissedStreak(lastCheckInDate: string | null): boolean {
  if (!lastCheckInDate) return false;

  const previousDay = toUtcDayNumber(lastCheckInDate);
  const todayDay = toUtcDayNumber(toUtcDateKey());

  if (previousDay === null || todayDay === null) return false;
  return todayDay - previousDay > 1;
}

interface StreakBadgeProps {
  className?: string;
}

export function StreakBadge({ className }: StreakBadgeProps) {
  const { data: user } = useCurrentUser();
  const [isMounted, setIsMounted] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const state = readStoredStreakState(user.id);
    if (!state) return;

    setCurrentStreak(state.currentStreak);
    setLongestStreak(state.longestStreak);
    setLastCheckInDate(state.lastCheckInDate);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const handleStreakUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<StreakUpdatedEventDetail>;
      const detail = customEvent.detail;

      if (!detail) return;

      setCurrentStreak(detail.currentStreak);
      setLongestStreak(detail.longestStreak);
      setLastCheckInDate(detail.lastCheckInDate);
      setIsCelebrating(true);
      window.setTimeout(() => setIsCelebrating(false), 1800);
    };

    window.addEventListener(STREAK_UPDATED_EVENT, handleStreakUpdated);
    return () => {
      window.removeEventListener(STREAK_UPDATED_EVENT, handleStreakUpdated);
    };
  }, [user?.id]);

  const isMissed = useMemo(() => hasMissedStreak(lastCheckInDate), [lastCheckInDate]);

  if (!isMounted) {
    return <div className="h-8 w-8 rounded-full bg-neutral-200 animate-pulse" aria-hidden="true" />;
  }

  if (!user?.id) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all duration-300',
        isMissed
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-amber-200 bg-white text-neutral-900 shadow-sm',
        isCelebrating && 'scale-105 shadow-lg shadow-amber-300/40',
        className
      )}
      title={
        isMissed
          ? 'Streak missed. Complete a study session today to rebuild your streak.'
          : `Current streak: ${currentStreak} day${currentStreak === 1 ? '' : 's'}. Longest: ${longestStreak}.`
      }
    >
      <span
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-full',
          isMissed ? 'bg-rose-100' : 'bg-amber-100'
        )}
      >
        <Flame
          className={cn(
            'h-4 w-4',
            isMissed ? 'text-rose-500' : 'text-amber-500',
            isCelebrating && 'animate-bounce'
          )}
        />
      </span>

      <div className="flex items-center gap-1.5">
        <span className={cn('text-sm font-bold leading-none', isCelebrating && 'animate-pulse')}>
          {currentStreak}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">streak</span>
      </div>

      <span className="hidden items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 md:inline-flex">
        <TrendingUp className="h-3 w-3" />
        Best {longestStreak}
      </span>
    </div>
  );
}
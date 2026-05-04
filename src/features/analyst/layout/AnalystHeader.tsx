"use client";

import { NotificationBell } from '@/features/notification';

interface AnalystHeaderProps {
  pageTitle: string;
}

export function AnalystHeader({ pageTitle }: AnalystHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-neutral-200/60 bg-white/80 px-8 backdrop-blur-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell
          buttonClassName="relative rounded-xl p-2 text-neutral-600 transition hover:bg-neutral-100"
          iconClassName="h-5 w-5"
        />
      </div>
    </header>
  );
}

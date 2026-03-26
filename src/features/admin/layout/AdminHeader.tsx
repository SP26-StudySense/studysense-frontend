"use client";

import { UserProfile } from "@/components/dashboard/UserProfile";
import { NotificationBell } from '@/features/notification';

interface AdminHeaderProps {
  pageTitle: string;
}

export function AdminHeader({ pageTitle }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-neutral-200/60 bg-white/60 px-8 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center gap-4">
        <h1 className="text-base font-semibold tracking-tight text-neutral-700">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell showTestButton={true} />

        <div className="h-8 w-px bg-neutral-200"></div>

        <UserProfile />
      </div>
    </header>
  );
}

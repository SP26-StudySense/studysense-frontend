"use client";

import { Bell } from "lucide-react";
import { UserProfile } from "@/components/dashboard/UserProfile";

interface AnalystHeaderProps {
  pageTitle: string;
}

export function AnalystHeader({ pageTitle }: AnalystHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-neutral-200/60 bg-white/60 px-8 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      {/* Left: Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-base font-semibold tracking-tight text-neutral-700">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Bell + UserProfile */}
      <div className="flex items-center gap-6">
        <button className="relative text-neutral-500 transition-colors hover:text-neutral-900">
          <Bell className="h-5 w-5" />
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-px bg-neutral-200" />

        <UserProfile />
      </div>
    </header>
  );
}

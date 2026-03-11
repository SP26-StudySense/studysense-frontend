"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface ContentManagerHeaderProps {
  pageTitle: string;
}

export function ContentManagerHeader({ pageTitle }: ContentManagerHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-64 rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-neutral-100"
        >
          <Bell className="h-5 w-5 text-neutral-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#00bae2]" />
        </Button>
      </div>
    </header>
  );
}

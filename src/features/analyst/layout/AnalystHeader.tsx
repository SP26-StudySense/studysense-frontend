"use client";

import { Search, Bell } from "lucide-react";

interface AnalystHeaderProps {
  pageTitle: string;
}

export function AnalystHeader({ pageTitle }: AnalystHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-neutral-200/60 bg-white/60 px-8 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-xl border border-neutral-200 bg-white/50 py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10"
          />
        </div>

        <button className="relative text-neutral-500 transition-colors hover:text-neutral-900">
          <Bell className="h-5 w-5" />
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-px bg-neutral-200"></div>

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#00bae2] to-[#fec5fb] p-[2px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
              <span className="text-sm font-semibold text-neutral-700">AN</span>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-medium text-neutral-900">Analyst User</p>
            <p className="text-xs text-neutral-500">Analyst</p>
          </div>
        </div>
      </div>
    </header>
  );
}

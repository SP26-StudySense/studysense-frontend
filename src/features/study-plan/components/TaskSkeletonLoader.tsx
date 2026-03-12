'use client';

import { Loader2 } from 'lucide-react';

export function TaskSkeletonLoader() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-4 rounded-2xl bg-neutral-100/50 border border-neutral-200/50"
        >
          <div className="flex-shrink-0 w-5 h-5 rounded bg-neutral-200/80 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200/80 rounded w-3/4" />
            <div className="h-3 bg-neutral-200/60 rounded w-1/2" />
          </div>
          <div className="flex-shrink-0 w-16 h-6 rounded-full bg-neutral-200/60" />
        </div>
      ))}
      
      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Đang tạo task học tập...</span>
      </div>
    </div>
  );
}

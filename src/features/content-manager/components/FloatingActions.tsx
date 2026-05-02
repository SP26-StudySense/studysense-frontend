"use client";

import React from "react";
import { Edit3, Edit2 } from "lucide-react";

export function FloatingActions({
  onOpenEditor,
  onQuickEdit,
  disabled,
}: {
  onOpenEditor: () => void;
  onQuickEdit: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <button
        onClick={onQuickEdit}
        disabled={disabled}
        title="Quick edit (Q)"
        aria-label="Quick edit selected node"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-neutral-200 shadow hover:scale-105 transition-transform disabled:opacity-50"
      >
        <Edit2 className="h-5 w-5 text-neutral-700" />
      </button>

      <button
        onClick={onOpenEditor}
        disabled={disabled}
        title="Open editor (E)"
        aria-label="Open node editor"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#fec5fb] to-[#00bae2] text-neutral-900 shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
      >
        <Edit3 className="h-6 w-6" />
      </button>
    </div>
  );
}

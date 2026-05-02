"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Check } from "lucide-react";

export function QuickEditPopover({
  x,
  y,
  initialTitle,
  onClose,
  onSave,
}: {
  x: number;
  y: number;
  initialTitle: string;
  onClose: () => void;
  onSave: (title: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [title, setTitle] = useState(initialTitle || "");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!(e.target instanceof Node)) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") {
        onSave(title);
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose, onSave, title]);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <div
      ref={ref}
      style={{ left: x + 8, top: y + 8 }}
      className="fixed z-50 w-[260px] rounded-xl border border-neutral-200 bg-white p-3 shadow-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Quick edit</div>
        <button onClick={onClose} className="p-1 rounded-md text-neutral-500 hover:bg-neutral-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#00bae2]"
        aria-label="Edit node title"
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            onSave(title);
            onClose();
          }}
          className="flex-1 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-3 py-2 text-sm font-medium text-neutral-900"
        >
          <Check className="inline h-4 w-4 mr-1" /> Save
        </button>
        <button onClick={onClose} className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium">
          Cancel
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { X } from "lucide-react";

export function EditorDrawer({
  isOpen,
  onClose,
  children,
  width = 420,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Node editor"
        tabIndex={-1}
        className={`fixed top-0 right-0 z-50 h-full transform bg-white shadow-2xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div />
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close editor"
            className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[calc(100%-64px)] overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
}

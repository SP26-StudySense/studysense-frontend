"use client";

import { Edit, Trash2 } from "lucide-react";

interface RowActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  editTitle?: string;
  deleteTitle?: string;
}

export function RowActionButtons({
  onEdit,
  onDelete,
  editTitle = "Edit",
  deleteTitle = "Delete",
}: RowActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onEdit}
        title={editTitle}
        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        title={deleteTitle}
        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

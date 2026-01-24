"use client";

import { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface AdminTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function AdminTable<T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
}: AdminTableProps<T>) {
  const handleEdit = (item: T) => {
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = (item: T) => {
    if (onDelete) {
      onDelete(item);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200/60">
          <thead className="bg-neutral-50/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600"
                >
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 bg-white">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-6 py-12 text-center text-sm text-neutral-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="transition-colors hover:bg-neutral-50/50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900"
                    >
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="space-x-3 whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      {onEdit && (
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg px-3 py-1.5 text-[#00bae2] transition-all hover:bg-[#00bae2]/10"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded-lg px-3 py-1.5 text-red-600 transition-all hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

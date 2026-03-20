"use client";

import type { SurveyTriggerTypeDto } from "../api/types";
import { RowActionButtons } from "./RowActionButtons";

interface SurveyTriggerTypeTableProps {
  items: SurveyTriggerTypeDto[];
  isLoading: boolean;
  onEdit: (item: SurveyTriggerTypeDto) => void;
  onDelete: (item: SurveyTriggerTypeDto) => void;
}

export function SurveyTriggerTypeTable({
  items,
  isLoading,
  onEdit,
  onDelete,
}: SurveyTriggerTypeTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Display Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-neutral-500">
                  Loading SurveyTriggerTypes...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-neutral-500">
                  No SurveyTriggerType found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.code}>
                  <td className="px-4 py-3 align-top text-sm font-semibold text-neutral-800">{item.code}</td>
                  <td className="px-4 py-3 align-top text-sm text-neutral-800">{item.displayName}</td>
                  <td className="px-4 py-3 align-top text-sm text-neutral-600">{item.description || "-"}</td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <RowActionButtons
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

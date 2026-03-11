"use client";

import { Edit, Trash2, Loader2 } from "lucide-react";
import type { SurveyTriggerMappingDto, SurveyTriggerTypeDto } from "../api/types";

interface TriggerMappingTableProps {
  mappings: SurveyTriggerMappingDto[];
  triggerTypes: SurveyTriggerTypeDto[];
  isLoading: boolean;
  isTogglingId?: number | null;
  // Pagination
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  // Actions
  onEdit: (mapping: SurveyTriggerMappingDto) => void;
  onDelete: (id: number) => void;
  onToggleActive: (mapping: SurveyTriggerMappingDto) => void;
}

export function TriggerMappingTable({
  mappings,
  triggerTypes,
  isLoading,
  isTogglingId,
  pageIndex,
  totalPages,
  totalCount,
  onPageChange,
  onEdit,
  onDelete,
  onToggleActive,
}: TriggerMappingTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#00bae2]" />
        <span className="ml-2 text-sm text-neutral-500">Loading mappings...</span>
      </div>
    );
  }

  if (mappings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
        <p className="text-sm text-neutral-500">No trigger mappings found.</p>
        <p className="mt-1 text-xs text-neutral-400">Click "+ Add Mapping" to create one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Survey</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Trigger Type</th>
              <th className="px-4 py-3 text-center font-medium text-neutral-600">Max Attempts</th>
              <th className="px-4 py-3 text-center font-medium text-neutral-600">Cooldown (days)</th>
              <th className="px-4 py-3 text-center font-medium text-neutral-600">Active</th>
              <th className="px-4 py-3 text-center font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {mappings.map((m) => (
              <tr key={m.id} className="transition-colors hover:bg-neutral-50/60">
                {/* Survey */}
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-neutral-800">
                      {m.surveyTitle ?? `Survey #${m.surveyId}`}
                    </span>
                    <span className="text-xs text-neutral-400">ID: {m.surveyId}</span>
                  </div>
                </td>

                {/* Trigger Type */}
                <td className="px-4 py-3">
                  <TriggerTypeBadge type={m.triggerType} triggerTypes={triggerTypes} />
                </td>

                {/* Max Attempts */}
                <td className="px-4 py-3 text-center text-neutral-700">
                  {m.maxAttempts != null ? m.maxAttempts : <span className="text-neutral-400">—</span>}
                </td>

                {/* Cooldown Days */}
                <td className="px-4 py-3 text-center text-neutral-700">
                  {m.cooldownDays != null ? m.cooldownDays : <span className="text-neutral-400">—</span>}
                </td>

                {/* IsActive Toggle */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onToggleActive(m)}
                    disabled={isTogglingId === m.id}
                    title={m.isActive ? "Click to deactivate" : "Click to activate"}
                    className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none disabled:opacity-60"
                    style={{ backgroundColor: m.isActive ? "#00bae2" : "#d1d5db" }}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        m.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                    {isTogglingId === m.id && (
                      <Loader2 className="absolute right-0.5 top-0.5 h-3 w-3 animate-spin text-white" />
                    )}
                  </button>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(m)}
                      title="Edit"
                      className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(m.id)}
                      title="Delete"
                      className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-neutral-500">
            {totalCount} mapping{totalCount !== 1 ? "s" : ""} total
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pageIndex - 1)}
              disabled={pageIndex <= 1}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-3 text-xs text-neutral-600">
              {pageIndex} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(pageIndex + 1)}
              disabled={pageIndex >= totalPages}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Sub-components ====================

function TriggerTypeBadge({ type, triggerTypes }: { type: string; triggerTypes: SurveyTriggerTypeDto[] }) {
  const colorMap: Record<string, string> = {
    ON_REGISTER: "bg-purple-100 text-purple-700",
    ON_START_ROADMAP: "bg-blue-100 text-blue-700",
    ON_COMPLETE_MODULE: "bg-green-100 text-green-700",
  };

  const color = colorMap[type] ?? "bg-neutral-100 text-neutral-700";
  const label = triggerTypes.find((t) => t.code === type)?.displayName ?? type;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

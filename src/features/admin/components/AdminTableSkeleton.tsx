"use client";

interface AdminTableSkeletonProps {
  columns: number;
  rows?: number;
}

export function AdminTableSkeleton({
  columns,
  rows = 8,
}: AdminTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200/60">
          <thead className="bg-neutral-50/50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th
                  key={`header-${index}`}
                  className="px-6 py-4"
                >
                  <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 bg-white">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {Array.from({ length: columns }).map((__, colIndex) => (
                  <td
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="px-6 py-4"
                  >
                    <div className="h-3 w-full max-w-[140px] animate-pulse rounded bg-neutral-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
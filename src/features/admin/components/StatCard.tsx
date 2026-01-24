interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export function StatCard({ title, value, change, trend }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            trend === "up"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {change}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-neutral-900">
        {value}
      </p>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-[#00bae2]/5 to-[#fec5fb]/5 blur-2xl transition-all group-hover:scale-150" />
    </div>
  );
}

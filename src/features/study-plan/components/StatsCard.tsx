'use client';

import { Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface StatsCardProps {
    type: 'hours' | 'tasks';
    value: number;
    className?: string;
}

export function StatsCard({ type, value, className }: StatsCardProps) {
    const isHours = type === 'hours';
    const Icon = isHours ? Clock : CheckCircle2;
    const label = isHours ? 'HOURS STUDIED' : 'TASKS DONE';
    const displayValue = isHours ? value.toFixed(1) : value.toString();

    return (
        <div className={cn(
            "relative overflow-hidden flex flex-col items-center gap-3 rounded-3xl bg-white/70 backdrop-blur-xl border border-neutral-200/60 p-6 shadow-xl shadow-neutral-900/5 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]",
            className
        )}>
            {/* Decorative gradient */}
            <div className={cn(
                "absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl",
                isHours
                    ? "bg-gradient-to-br from-violet-400/30 to-purple-500/20"
                    : "bg-gradient-to-br from-[#00bae2]/30 to-[#fec5fb]/20"
            )} />

            <div className={cn(
                "relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg",
                isHours
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/30"
                    : "bg-gradient-to-br from-[#00bae2] to-[#00a0c6] text-white shadow-[#00bae2]/30"
            )}>
                <Icon className="h-7 w-7" />
            </div>

            <div className="relative text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {label}
                </p>
                <div className="flex items-baseline justify-center gap-1.5 mt-1">
                    <span className="text-4xl font-bold text-neutral-900">
                        {displayValue}
                    </span>
                </div>
            </div>
        </div>
    );
}

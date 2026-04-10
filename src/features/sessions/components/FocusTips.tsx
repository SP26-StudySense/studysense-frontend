'use client';

import { Lightbulb } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FocusTipsProps {
    className?: string;
}

const FOCUS_TIPS = [
    'Put your phone on silent or in another room',
    'Close unnecessary browser tabs',
    'Take a 5-minute break every 25 minutes',
    'Stay hydrated',
];

export function FocusTips({ className }: FocusTipsProps) {
    return (
        <div className={cn(
            "rounded-3xl border border-neutral-200/70 bg-white/80 p-6 shadow-xl shadow-neutral-900/5 backdrop-blur-xl",
            className
        )}>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                    <Lightbulb className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Focus Tips</h3>
            </div>

            {/* Tips List */}
            <ul className="space-y-3 ml-12">
                {FOCUS_TIPS.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-neutral-600">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-cyan-100 text-xs font-semibold text-neutral-700">
                            {index + 1}
                        </span>
                        <span className="pt-0.5">{tip}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { StickyNote } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SessionNotesProps {
    className?: string;
}

export function SessionNotes({ className }: SessionNotesProps) {
    const [notes, setNotes] = useState('');

    return (
        <div className={cn(
            "rounded-3xl bg-white/70 backdrop-blur-xl border border-neutral-200/60 p-6 shadow-xl shadow-neutral-900/5",
            className
        )}>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                    <StickyNote className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Session Notes</h3>
            </div>
            <p className="text-sm text-neutral-500 mb-4 ml-10">
                Jot down thoughts and key learnings
            </p>

            {/* Notes Textarea */}
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your notes here..."
                className="w-full h-36 rounded-2xl border border-neutral-200 bg-white/80 p-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-[#00bae2] focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10 focus:shadow-lg resize-none"
            />
        </div>
    );
}

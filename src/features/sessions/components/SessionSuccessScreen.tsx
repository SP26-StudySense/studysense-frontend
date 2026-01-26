'use client';

import { Sparkles, Home, Map } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { useSessionStore } from '@/store/session.store';

interface SessionSuccessScreenProps {
    isOpen: boolean;
    className?: string;
}

export function SessionSuccessScreen({ isOpen, className }: SessionSuccessScreenProps) {
    const router = useRouter();
    const resetSessionFlow = useSessionStore((state) => state.resetSessionFlow);

    if (!isOpen) return null;

    const handleBackToDashboard = () => {
        resetSessionFlow();
        router.push('/dashboard');
    };

    const handleViewRoadmap = () => {
        resetSessionFlow();
        router.push('/roadmaps');
    };

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-emerald-50/50 to-white",
            className
        )}>
            {/* Content */}
            <div className="flex flex-col items-center text-center px-8">
                {/* Icon */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 mb-6">
                    <Sparkles className="h-10 w-10 text-emerald-600" />
                </div>

                {/* Text */}
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Great work!</h1>
                <p className="text-neutral-500 mb-8">
                    Your session has been saved. Keep up the momentum!
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBackToDashboard}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
                    >
                        <Home className="h-5 w-5" />
                        Back to Dashboard
                    </button>
                    <button
                        onClick={handleViewRoadmap}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 font-semibold shadow-sm hover:bg-neutral-50 hover:scale-[1.02] transition-all"
                    >
                        <Map className="h-5 w-5" />
                        View Roadmap
                    </button>
                </div>
            </div>
        </div>
    );
}

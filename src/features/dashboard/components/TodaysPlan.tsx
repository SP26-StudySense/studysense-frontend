import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2 } from "lucide-react";

export const TodaysPlan = () => {
    return (
        <div className="glass-panel rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#00bae2]" />
                <div>
                    <h3 className="font-bold text-neutral-900">Today&apos;s Plan</h3>
                    <p className="text-xs text-neutral-500">Your recommended tasks for today</p>
                </div>
            </div>

            {/* Active Task */}
            <div className="mb-6 rounded-2xl border border-white bg-white/60 p-5 shadow-sm transition-all hover:shadow-[#00bae2]/10 hover:shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">React Fundamentals</span>
                        <h4 className="mt-1 text-lg font-bold text-neutral-900">useEffect for side effects</h4>
                        <p className="mt-1 text-sm text-neutral-500">Handle side effects in components</p>
                    </div>
                    <span className="rounded-full bg-[#e0faff] px-3 py-1 text-xs font-bold text-[#00bae2]">45 min</span>
                </div>
                <Button className="mt-4 rounded-lg bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-6 py-2 text-xs font-bold text-neutral-900 shadow-md shadow-[#00bae2]/10 hover:shadow-[#00bae2]/30 hover:-translate-y-0.5 transition-all">
                    Start Task
                </Button>
            </div>

            {/* Upcoming List */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-neutral-600">Coming up next</h4>

                <div className="flex items-center justify-between rounded-xl border border-transparent bg-white/30 px-4 py-3 hover:bg-white/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-neutral-400 group-hover:text-[#00bae2] transition-colors" />
                        <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">Custom hooks</span>
                    </div>
                    <span className="text-xs font-medium text-neutral-400">60 min</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-transparent bg-white/30 px-4 py-3 hover:bg-white/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-neutral-400 group-hover:text-[#00bae2] transition-colors" />
                        <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">Create pages and layouts</span>
                    </div>
                    <span className="text-xs font-medium text-neutral-400">45 min</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-transparent bg-white/30 px-4 py-3 hover:bg-white/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-neutral-400 group-hover:text-[#00bae2] transition-colors" />
                        <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">Dynamic routes</span>
                    </div>
                    <span className="text-xs font-medium text-neutral-400">60 min</span>
                </div>
            </div>
        </div>
    );
};

import { Clock, MoreHorizontal } from "lucide-react";

export const RecentSessions = () => {
    return (
        <div className="glass-panel rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            <div className="mb-6">
                <h3 className="font-bold text-neutral-900">Recent Sessions</h3>
                <p className="text-xs text-neutral-500">Your study activity</p>
            </div>

            <div className="space-y-4">
                {/* Session 1 */}
                <div className="flex items-center justify-between rounded-2xl border border-transparent bg-white/50 p-4 transition-all hover:border-[#00bae2]/20 hover:bg-white hover:shadow-lg hover:shadow-[#00bae2]/5 hover:-translate-y-0.5 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e0faff] text-[#00bae2]">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-900">60 minute session</p>
                            <p className="text-xs text-neutral-500">2 tasks completed</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold text-neutral-900">20/1/2026</p>
                        <div className="mt-1 flex justify-end gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00bae2]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00bae2]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00bae2]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00bae2]/30"></span>
                        </div>
                    </div>
                </div>

                {/* Session 2 */}
                <div className="flex items-center justify-between rounded-2xl border border-transparent bg-white/50 p-4 transition-all hover:border-[#00bae2]/20 hover:bg-white hover:shadow-lg hover:shadow-[#00bae2]/5 hover:-translate-y-0.5 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e0faff] text-[#00bae2]">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-900">45 minute session</p>
                            <p className="text-xs text-neutral-500">1 tasks completed</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold text-neutral-900">19/1/2026</p>
                        <div className="mt-1 flex justify-end gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00bae2]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00bae2]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00bae2]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00bae2]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00bae2]"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { Calendar, Clock, Flame, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const StatsOverview = () => {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Today's Focus */}
            <div className="glass-panel flex flex-col justify-between rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#00bae2]/30 hover:shadow-2xl hover:shadow-[#00bae2]/10">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-neutral-500">Today&apos;s Focus</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#fec5fb]/20 to-[#00bae2]/20 text-[#00bae2]">
                        <Target className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-bold text-neutral-900">State & Hooks</h3>
                    <p className="mt-1 text-xs font-medium text-neutral-500">45 min estimated</p>
                </div>
            </div>

            {/* Card 2: Weekly Progress */}
            <div className="glass-panel flex flex-col justify-between rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#00bae2]/30 hover:shadow-2xl hover:shadow-[#00bae2]/10">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-neutral-500">Weekly Progress</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#fec5fb]/20 to-[#00bae2]/20 text-[#00bae2]">
                        <Calendar className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-4 w-full">
                    <div className="mb-2 text-2xl font-bold text-neutral-900">23%</div>
                    <Progress value={23} className="h-2 bg-neutral-100" indicatorClassName="bg-gradient-to-r from-[#fec5fb] to-[#00bae2]" />
                </div>
            </div>

            {/* Card 3: Study Streak */}
            <div className="glass-panel flex flex-col justify-between rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#fec5fb]/30 hover:shadow-2xl hover:shadow-[#fec5fb]/10">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-neutral-500">Study Streak</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#fec5fb]/20 to-[#00bae2]/20 text-[#fec5fb]">
                        <Flame className="h-4 w-4 fill-[#fec5fb]" />
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-2xl font-bold text-neutral-900">2 days</h3>
                    <p className="mt-1 text-xs font-medium text-neutral-500">Keep it going!</p>
                </div>
            </div>

            {/* Card 4: Focus Time */}
            <div className="glass-panel flex flex-col justify-between rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#00bae2]/30 hover:shadow-2xl hover:shadow-[#00bae2]/10">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-neutral-500">Focus Time</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#fec5fb]/20 to-[#00bae2]/20 text-[#00bae2]">
                        <Clock className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-2xl font-bold text-neutral-900">105h</h3>
                    <p className="mt-1 text-xs font-medium text-neutral-500">of 10h weekly goal</p>
                </div>
            </div>
        </div>
    );
};

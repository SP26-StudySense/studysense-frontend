import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export const WelcomeBanner = () => {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold text-neutral-900">
                    Welcome back!
                </h2>
                <p className="text-neutral-500">
                    Ready to continue your learning journey?
                </p>
            </div>

            <Button
                className="group rounded-full bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-8 py-6 text-sm font-bold text-neutral-900 shadow-lg shadow-[#00bae2]/20 hover:shadow-xl hover:shadow-[#00bae2]/30 hover:-translate-y-0.5 transition-all duration-300"
            >
                <Play className="mr-2 h-4 w-4 fill-current" />
                Continue Studying
            </Button>
        </div>
    );
};

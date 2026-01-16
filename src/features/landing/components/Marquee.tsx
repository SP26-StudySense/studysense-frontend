import { Hexagon, Triangle, Box, Cloud, Slack } from 'lucide-react';

export const Marquee = () => {
    return (
        <section className="mb-20 w-full overflow-hidden border-y border-neutral-200 bg-white py-10">
            <div className="mx-auto mb-6 max-w-[1400px] px-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Alumni working at world-class teams
                </p>
            </div>
            <div className="relative flex w-full">
                <div className="flex animate-marquee items-center gap-16 whitespace-nowrap">
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Hexagon /> ACME Corp
                    </span>
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Triangle /> Vercel
                    </span>
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Box /> Stripe
                    </span>
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Cloud /> Linear
                    </span>
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Slack /> Slack
                    </span>
                    {/* Duplicate for loop */}
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Hexagon /> ACME Corp
                    </span>
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Triangle /> Vercel
                    </span>
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Box /> Stripe
                    </span>
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Cloud /> Linear
                    </span>
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Slack /> Slack
                    </span>
                    {/* Third set just in case of wide screens */}
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Hexagon /> ACME Corp
                    </span>
                    <span className="flex items-center gap-2 text-xl font-bold text-neutral-300">
                        <Triangle /> Vercel
                    </span>
                </div>
            </div>
        </section>
    );
};

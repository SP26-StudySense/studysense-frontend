import { Hexagon, Triangle, Box, Cloud, Slack } from 'lucide-react';

export const Marquee = () => {
    const companies = [
        { icon: Hexagon, name: 'ACME Corp' },
        { icon: Triangle, name: 'Vercel' },
        { icon: Box, name: 'Stripe' },
        { icon: Cloud, name: 'Linear' },
        { icon: Slack, name: 'Slack' },
    ];

    return (
        <section className="mb-20 w-full overflow-hidden border-y border-neutral-200 bg-white py-10">
            <div className="mx-auto mb-6 max-w-[1400px] px-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Alumni working at world-class teams
                </p>
            </div>
            <div className="relative flex w-full marquee-fade">
                <div className="flex animate-marquee items-center gap-16 whitespace-nowrap">
                    {/* Triple the items for seamless loop */}
                    {[...companies, ...companies, ...companies].map((company, index) => (
                        <span
                            key={index}
                            className="flex items-center gap-2 text-xl font-bold text-neutral-300 transition-colors duration-300 hover:text-neutral-500 cursor-pointer"
                        >
                            <company.icon />
                            {company.name}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

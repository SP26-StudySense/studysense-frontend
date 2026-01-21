'use client';

import { useRef, useEffect } from 'react';
import { UserPlus, Check } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTransitionRouter } from '@/shared/context/TransitionContext';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export const SkillGraph = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const codeRef = useRef<HTMLDivElement>(null);
    const { navigateWithTransition } = useTransitionRouter();

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const content = section.querySelector('[data-skill-content]');
        const codeBlock = section.querySelector('[data-skill-code]');

        gsap.set(content, { opacity: 0, x: -50 });
        gsap.set(codeBlock, { opacity: 0, x: 50 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 70%',
            },
        });

        tl.to(content, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' })
            .to(codeBlock, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, '-=0.5');

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <section ref={sectionRef} className="mx-auto mb-24 max-w-[1400px] px-6 lg:px-12">
            <div className="relative overflow-hidden rounded-[40px] bg-neutral-900 p-8 shadow-2xl lg:p-16">
                {/* Background grid on dark */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                ></div>

                <div className="relative z-10 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                    <div data-skill-content className="space-y-8">
                        <div className="inline-block rounded-full border border-neutral-700 bg-neutral-800/50 px-3 py-1 font-mono text-xs text-[#00bae2] glow-cyan">
                            git checkout -b new-career
                        </div>
                        <h2 className="text-4xl font-medium tracking-tight text-white leading-[1.1] lg:text-5xl">
                            Visualize your knowledge gap.
                        </h2>
                        <p className="max-w-md text-lg text-neutral-400">
                            Create a personal account to track what you know, what you&apos;re learning, and
                            showcase your skill graph to potential employers.
                        </p>
                        <button
                            onClick={() => navigateWithTransition('/register')}
                            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-6 py-3 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,186,226,0.4)] cursor-pointer"
                        >
                            Create Profile
                            <UserPlus width="16" className="transition-transform duration-300 group-hover:scale-110" />
                        </button>
                    </div>

                    {/* Code/Graph Visual */}
                    <div
                        ref={codeRef}
                        data-skill-code
                        className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 font-mono text-xs shadow-2xl backdrop-blur-md lg:text-sm transition-all duration-300 hover:border-neutral-700"
                    >
                        <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-4">
                            <span className="text-neutral-400">skill_matrix.json</span>
                            <div className="flex gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500/20 transition-colors hover:bg-red-500/40"></div>
                                <div className="h-3 w-3 rounded-full bg-yellow-500/20 transition-colors hover:bg-yellow-500/40"></div>
                                <div className="h-3 w-3 rounded-full bg-green-500/20 transition-colors hover:bg-green-500/40"></div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex">
                                <span className="w-6 text-purple-400">1</span>
                                <span className="text-blue-400">const</span>{' '}
                                <span className="text-yellow-200">myProfile</span>{' '}
                                <span className="text-neutral-300">=</span>{' '}
                                <span className="text-neutral-300">{`{`}</span>
                            </div>
                            <div className="flex">
                                <span className="w-6 text-neutral-600">2</span>
                                <span className="pl-4 text-purple-300">role</span>:{' '}
                                <span className="text-green-300">&quot;Full Stack Developer&quot;</span>,
                            </div>
                            <div className="flex">
                                <span className="w-6 text-neutral-600">3</span>
                                <span className="pl-4 text-purple-300">level</span>:{' '}
                                <span className="text-orange-300">&quot;Intermediate&quot;</span>,
                            </div>
                            <div className="flex">
                                <span className="w-6 text-neutral-600">4</span>
                                <span className="pl-4 text-purple-300">skills</span>:{' '}
                                <span className="text-neutral-300">[</span>
                            </div>
                            {/* Skill Item */}
                            <div className="group -ml-1 flex cursor-pointer rounded px-1 transition-colors hover:bg-white/5">
                                <span className="w-6 text-neutral-600">5</span>
                                <span className="pl-8 text-neutral-300">{`{`}</span>{' '}
                                <span className="text-purple-300">name</span>:{' '}
                                <span className="text-green-300">&quot;React&quot;</span>,{' '}
                                <span className="text-purple-300">mastery</span>:{' '}
                                <span className="text-[#00bae2] transition-all group-hover:text-shadow-glow">90%</span>{' '}
                                <span className="text-neutral-300">{`}`}</span>,
                            </div>
                            {/* Skill Item */}
                            <div className="group -ml-1 flex cursor-pointer rounded px-1 transition-colors hover:bg-white/5">
                                <span className="w-6 text-neutral-600">6</span>
                                <span className="pl-8 text-neutral-300">{`{`}</span>{' '}
                                <span className="text-purple-300">name</span>:{' '}
                                <span className="text-green-300">&quot;TypeScript&quot;</span>,{' '}
                                <span className="text-purple-300">mastery</span>:{' '}
                                <span className="text-[#00bae2] transition-all group-hover:text-shadow-glow">85%</span>{' '}
                                <span className="text-neutral-300">{`}`}</span>,
                            </div>
                            <div className="flex">
                                <span className="w-6 text-neutral-600">7</span>
                                <span className="text-neutral-300">]</span>
                            </div>
                            <div className="flex">
                                <span className="w-6 text-neutral-600">8</span>
                                <span className="text-neutral-300">{`}`}</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4">
                            <span className="text-neutral-500">Last updated: Just now</span>
                            <span className="flex items-center gap-1 text-[#00bae2]">
                                <Check className="animate-pulse" />
                                Verified
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

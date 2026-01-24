'use client';

import { useRef, useEffect } from 'react';
import { ArrowRight, Search, Atom, CheckCircle2, Circle, Trophy } from 'lucide-react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useTransitionRouter } from '@/shared/context/TransitionContext';
import { Button } from '@/shared/ui/button';

// Register GSAP plugin
gsap.registerPlugin(ScrambleTextPlugin);

export const Hero = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const card1Ref = useRef<HTMLDivElement>(null);
    const card2Ref = useRef<HTMLDivElement>(null);
    const { navigateWithTransition } = useTransitionRouter();

    // Text content constants for scramble animation
    const HERO_TEXT = {
        badge: 'New: DevOps 2024 Roadmap Updated',
        titleLine1: "Don't just learn code.",
        titleLine2: 'Engineer your path.',
        description: 'Step-by-step guides and curated learning paths for developers. Track your progress, verify your skills, and master the modern stack without the noise.',
    };

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Get elements
        const badge = section.querySelector('[data-hero-badge]');
        const badgeText = section.querySelector('[data-hero-badge-text]');
        const titleLine1 = section.querySelector('[data-hero-title-line1]');
        const titleLine2 = section.querySelector('[data-hero-title-line2]');
        const desc = section.querySelector('[data-hero-desc]');
        const buttons = section.querySelector('[data-hero-buttons]');

        // Set initial states
        gsap.set([badge, desc, buttons], { opacity: 0, y: 40 });

        // Animate entrance with scramble text effect
        tl.to(badge, { opacity: 1, y: 0, duration: 0.4 })
            .to(badgeText, {
                duration: 0.4,
                scrambleText: {
                    text: HERO_TEXT.badge,
                    chars: 'upperAndLowerCase',
                    revealDelay: 0.3,
                    speed: 0.4,
                },
            }, '-=0.2')
            .to(titleLine1, {
                duration: 0.6,
                scrambleText: {
                    text: HERO_TEXT.titleLine1,
                    chars: 'upperAndLowerCase',
                    revealDelay: 0.2,
                    speed: 0.3,
                },
            }, '-=0.8')
            .to(titleLine2, {
                duration: 0.5,
                scrambleText: {
                    text: HERO_TEXT.titleLine2,
                    chars: 'upperAndLowerCase',
                    revealDelay: 0.3,
                    speed: 0.3,
                },
            }, '-=0.8')
            .to(desc, { opacity: 1, y: 0, duration: 0.4 }, '-=0.6')
            .to(desc, {
                duration: 1.8,
                scrambleText: {
                    text: HERO_TEXT.description,
                    chars: 'lowerCase',
                    revealDelay: 0.1,
                    speed: 0.5,
                },
            }, '-=0.3')
            .to(buttons, { opacity: 1, y: 0, duration: 0.5 }, '-=1.2');

        // Floating animation for cards
        if (card1Ref.current) {
            gsap.set(card1Ref.current, { opacity: 0, x: 30 });
            tl.to(card1Ref.current, { opacity: 1, x: 0, duration: 0.4 }, '-=0.8');

            gsap.to(card1Ref.current, {
                y: -10,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: 1,
            });
        }

        if (card2Ref.current) {
            gsap.set(card2Ref.current, { opacity: 0, x: 30 });
            tl.to(card2Ref.current, { opacity: 1, x: 0, duration: 0.4 }, '-=0.4');

            gsap.to(card2Ref.current, {
                y: -12,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: 1,
            });
        }

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="mx-auto mb-20 grid min-h-[70vh] max-w-[1400px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12 lg:px-12"
        >
            <div className="space-y-8 lg:col-span-7">
                <div
                    data-hero-badge
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/50 px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur-sm"
                >
                    <span className="h-2 w-2 rounded-full bg-[#00bae2] shadow-[0_0_8px_#00bae2] animate-pulse"></span>
                    <span data-hero-badge-text></span>
                </div>

                <h1
                    data-hero-title
                    className="text-5xl font-medium tracking-tighter text-neutral-900 leading-[1.05] lg:text-7xl"
                >
                    <span data-hero-title-line1></span>
                    <br />
                    <span className="relative inline-block text-neutral-400">
                        <span data-hero-title-line2></span>
                        <svg
                            className="absolute -bottom-1 left-0 -z-10 h-3 w-full text-[#fec5fb] opacity-60"
                            viewBox="0 0 100 10"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M0 5 Q 50 10 100 5"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                            ></path>
                        </svg>
                    </span>
                </h1>

                <p
                    data-hero-desc
                    className="max-w-xl text-lg leading-relaxed text-neutral-500"
                ></p>

                <div data-hero-buttons className="flex flex-col gap-4 pt-2 sm:flex-row">
                    <Button
                        variant="brand"
                        size="xl"
                        onClick={() => navigateWithTransition('/register')}
                        className="group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Start Learning
                            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 transition-all duration-300 group-hover:bg-white/40"></div>
                    </Button>
                    <Button
                        variant="brandOutline"
                        size="xl"
                        className="gap-2"
                    >
                        <Search className="w-[18px]" />
                        Browse Roles
                    </Button>
                </div>
            </div>

            {/* Hero Visual: Interactive Progress */}
            <div className="relative flex h-full min-h-[400px] items-center justify-center lg:col-span-5 lg:justify-end">
                {/* Abstract Glow */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#fec5fb]/30 to-[#00bae2]/30 blur-[80px]"></div>

                <div className="relative w-full max-w-sm">
                    {/* Card 1: Skill Node */}
                    <div
                        ref={card1Ref}
                        className="glass-panel mb-6 transform rounded-2xl border border-neutral-100 p-5 shadow-xl transition-all duration-500 -rotate-2 hover:rotate-0 hover:shadow-2xl hover-glow cursor-pointer"
                    >
                        <div className="mb-4 flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110">
                                <Atom width="22" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900">React Ecosystem</h3>
                                <p className="text-xs text-neutral-500">Frontend Path • Module 4</p>
                            </div>
                            <div className="ml-auto">
                                <div
                                    className="radial-progress text-[10px] font-bold text-[#00bae2]"
                                    style={{ '--value': 75, '--size': '2rem' } as any}
                                >
                                    75%
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 rounded border border-neutral-100 bg-neutral-50 p-2 text-xs text-neutral-600 transition-colors hover:bg-neutral-100">
                                <CheckCircle2 className="text-emerald-500" />
                                <span>Hooks &amp; Context API</span>
                            </div>
                            <div className="flex items-center gap-3 rounded border border-neutral-100 bg-neutral-50 p-2 text-xs text-neutral-600 transition-colors hover:bg-neutral-100">
                                <Circle className="text-neutral-300" />
                                <span>State Management (Redux/Zustand)</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Terminal */}
                    <div
                        ref={card2Ref}
                        className="relative z-10 transform rounded-2xl border border-neutral-800 bg-[#111] p-5 font-mono text-xs text-neutral-300 shadow-2xl transition-all duration-500 rotate-3 hover:rotate-0 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] cursor-pointer"
                    >
                        <div className="mb-4 flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500/80"></div>
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80"></div>
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500/80"></div>
                        </div>
                        <p className="mb-2">
                            <span className="text-emerald-400">user@devpath</span>:
                            <span className="text-blue-400">~</span>$ git commit -m &quot;mastered backend&quot;
                        </p>
                        <p className="mb-2 text-neutral-500">Accessing roadmap database...</p>
                        <div className="flex items-center gap-2 text-white">
                            <span>
                                <Trophy className="text-[#00bae2]" />
                            </span>
                            <span>Badge Unlocked: API Architect</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

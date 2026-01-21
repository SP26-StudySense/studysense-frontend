'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTransitionRouter } from '@/shared/context/TransitionContext';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export const CTA = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const { navigateWithTransition } = useTransitionRouter();

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const content = section.querySelector('[data-cta-content]');
        gsap.set(content, { opacity: 0, y: 40 });

        gsap.to(content, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 75%',
            },
        });

        // Floating decorative animation
        const decorative = section.querySelector('[data-cta-decorative]');
        if (decorative) {
            gsap.to(decorative, {
                scale: 1.1,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
            });
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <section ref={sectionRef} className="mx-auto mb-20 max-w-[1400px] px-6 lg:px-12">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#fec5fb] to-[#00bae2] p-12 text-center shadow-[0_20px_60px_rgba(0,186,226,0.3)]">
                <div data-cta-content className="relative z-10 mx-auto max-w-2xl">
                    <h2 className="mb-6 text-3xl font-medium tracking-tight text-neutral-900 lg:text-5xl">
                        Ready to start your journey?
                    </h2>
                    <p className="mb-8 text-lg font-medium text-neutral-800">
                        Join 500,000+ developers learning together.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <button
                            onClick={() => navigateWithTransition('/register')}
                            className="group rounded-full bg-neutral-900 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-neutral-800 hover:shadow-2xl cursor-pointer"
                        >
                            Get Started for Free
                        </button>
                        <button className="rounded-full border border-neutral-900/10 bg-white/50 px-8 py-4 font-semibold text-neutral-900 backdrop-blur transition-all duration-300 hover:bg-white/80 hover:shadow-lg cursor-pointer">
                            View All Roadmaps
                        </button>
                    </div>
                </div>
                {/* Decorative background elements */}
                <div
                    data-cta-decorative
                    className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-40"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 10% 20%, white 0%, transparent 20%), radial-gradient(circle at 90% 80%, white 0%, transparent 20%)',
                    }}
                ></div>
            </div>
        </section>
    );
};

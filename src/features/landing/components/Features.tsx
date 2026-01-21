'use client';

import { useRef, useEffect } from 'react';
import { Map, CheckSquare, Users } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export const Features = () => {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const header = section.querySelector('[data-features-header]');
        const cards = section.querySelectorAll('[data-feature-card]');

        // Animate header
        gsap.set(header, { opacity: 0, y: 30 });
        gsap.to(header, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
            },
        });

        // Animate cards with stagger
        gsap.set(cards, { opacity: 0, y: 50 });
        gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 70%',
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <section ref={sectionRef} className="mx-auto mb-24 max-w-[1400px] px-6 lg:px-12">
            <div data-features-header className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-medium tracking-tight text-neutral-900">
                    Stop learning randomly.
                </h2>
                <p className="text-neutral-500">
                    The internet is full of tutorials. We provide the structure. Choose a path and follow it
                    from beginner to expert.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Item 1 */}
                <div
                    data-feature-card
                    className="group rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-neutral-200 cursor-pointer"
                >
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00bae2]/20 group-hover:text-neutral-800">
                        <Map width="24" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900">Role-based Paths</h3>
                    <p className="text-sm leading-relaxed text-neutral-500">
                        Don&apos;t know what to learn next? Follow our standardized roadmaps for Frontend,
                        Backend, DevOps, and more.
                    </p>
                </div>
                {/* Item 2 */}
                <div
                    data-feature-card
                    className="group rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-neutral-200 cursor-pointer"
                >
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00bae2]/20 group-hover:text-neutral-800">
                        <CheckSquare width="24" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900">Track Progress</h3>
                    <p className="text-sm leading-relaxed text-neutral-500">
                        Mark topics as done. Save resources. Visualize your journey as you conquer complex
                        topics.
                    </p>
                </div>
                {/* Item 3 */}
                <div
                    data-feature-card
                    className="group rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-neutral-200 cursor-pointer"
                >
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00bae2]/20 group-hover:text-neutral-800">
                        <Users width="24" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900">Community Verified</h3>
                    <p className="text-sm leading-relaxed text-neutral-500">
                        Content is open-source and maintained by thousands of top developers. Always up to date.
                    </p>
                </div>
            </div>
        </section>
    );
};

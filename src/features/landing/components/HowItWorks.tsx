'use client';

import { useRef, useEffect } from 'react';
import { Map, Rocket, BarChart3, Trophy } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const steps = [
    {
        icon: Map,
        number: '01',
        title: 'Pick a Roadmap',
        description: 'Choose a learning path that matches your career goals from our curated templates.',
    },
    {
        icon: Rocket,
        number: '02',
        title: 'Start Your Journey',
        description: 'The system automatically creates a study plan with detailed tasks for each module.',
    },
    {
        icon: BarChart3,
        number: '03',
        title: 'Track Your Progress',
        description: 'Complete tasks one by one and visualize your progress with charts and statistics.',
    },
    {
        icon: Trophy,
        number: '04',
        title: 'Achieve Your Goals',
        description: 'Master the skills and get ready for your next job opportunity.',
    },
];

export const HowItWorks = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const timeline = timelineRef.current;
        if (!section || !timeline) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const header = section.querySelector('[data-how-header]');
        const stepCards = section.querySelectorAll('[data-step-card]');
        const timelineLine = timeline.querySelector('[data-timeline-line]');

        const ctx = gsap.context(() => {
            // Animate header
            gsap.fromTo(header,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                    },
                }
            );

            // Animate timeline line (draw effect)
            if (timelineLine) {
                gsap.fromTo(timelineLine,
                    { scaleY: 0, transformOrigin: 'top center' },
                    {
                        scaleY: 1,
                        duration: 1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 70%',
                        },
                    }
                );
            }

            // Animate step cards with stagger
            gsap.fromTo(stepCards,
                { opacity: 0, x: -50 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.5,
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 60%',
                    },
                }
            );

            // Animate icons with bounce
            const icons = section.querySelectorAll('[data-step-icon]');
            gsap.fromTo(icons,
                { scale: 0, rotation: -180 },
                {
                    scale: 1,
                    rotation: 0,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 60%',
                    },
                }
            );
        }, section);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="mx-auto mb-24 max-w-[1200px] px-6 lg:px-12">
            {/* Header */}
            <div data-how-header className="mx-auto mb-16 max-w-2xl text-center">
                <span className="mb-4 inline-block rounded-full bg-[#00bae2]/10 px-4 py-1.5 text-sm font-medium text-[#00bae2]">
                    Simple & Effective
                </span>
                <h2 className="mb-4 text-3xl font-medium tracking-tight text-neutral-900">
                    Get started in 4 simple steps
                </h2>
                <p className="text-neutral-500">
                    StudySense helps you learn systematically with ease. No more getting lost in a sea of knowledge.
                </p>
            </div>

            {/* Timeline */}
            <div ref={timelineRef} className="relative">
                {/* Vertical line (hidden on mobile) */}
                <div className="absolute left-8 top-0 bottom-0 hidden md:block w-0.5 bg-neutral-200">
                    <div
                        data-timeline-line
                        className="absolute inset-0 bg-gradient-to-b from-[#00bae2] to-[#fec5fb]"
                    />
                </div>

                {/* Steps */}
                <div className="space-y-8 md:space-y-12">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.number}
                                data-step-card
                                className="relative flex items-start gap-6 md:gap-8"
                            >
                                {/* Icon circle */}
                                <div
                                    data-step-icon
                                    className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-[#00bae2]/20 shadow-lg"
                                >
                                    <Icon className="h-7 w-7 text-[#00bae2]" />
                                    {/* Number badge */}
                                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#00bae2] to-[#00a5c9] text-xs font-bold text-white shadow-md">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-2">
                                    <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                                        {step.title}
                                    </h3>
                                    <p className="text-neutral-500 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

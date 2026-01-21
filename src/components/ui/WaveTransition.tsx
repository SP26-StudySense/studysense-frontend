'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTransitionRouter } from '@/shared/context/TransitionContext';
import { usePathname } from 'next/navigation';

export const WaveTransition = () => {
    const { isTransitioning, setTransitioning } = useTransitionRouter();
    const pathname = usePathname();
    const pathRef = useRef<SVGPathElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // SVG Paths for the wave effect (bottom to top)
    const PATH_BOTTOM = 'M 0 100 V 100 Q 50 100 100 100 V 100 z'; // Flat at bottom
    const PATH_WAVE = 'M 0 100 V 50 Q 50 0 100 50 V 100 z'; // Wave cresting
    const PATH_TOP = 'M 0 100 V 0 Q 50 0 100 0 V 100 z'; // Full screen coverage

    useEffect(() => {
        // Reset transition state on route change completion
        if (isTransitioning) {
            // Wait a bit for the next page to load, then reverse animation
            const timer = setTimeout(() => {
                animateOut();
            }, 1000); // 800ms enter + small buffer
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    const animateIn = () => {
        if (!pathRef.current) return;

        const tl = gsap.timeline();

        // Ensure wrapper is visible
        gsap.set(wrapperRef.current, { zIndex: 9999, pointerEvents: 'all' });

        // Animate from Bottom to Top (Cover screen)
        tl.fromTo(pathRef.current,
            { attr: { d: PATH_BOTTOM } },
            {
                duration: 0.8,
                attr: { d: PATH_WAVE },
                ease: 'power2.in'
            }
        )
            .to(pathRef.current, {
                duration: 0.4,
                attr: { d: PATH_TOP },
                ease: 'power2.out'
            });
    };

    const animateOut = () => {
        if (!pathRef.current) return;

        const tl = gsap.timeline({
            onComplete: () => {
                setTransitioning(false);
                gsap.set(wrapperRef.current, { zIndex: -1, pointerEvents: 'none' });
            }
        });

        // Current state is TOP (covering screen)
        // We want to "uncover" nicely? Or just reverse?
        // Let's reverse to bottom to reveal the new page

        // Animate from Top back to Bottom (Reveal screen)
        tl.to(pathRef.current, {
            duration: 0.4,
            attr: { d: PATH_WAVE },
            ease: 'power2.in'
        })
            .to(pathRef.current, {
                duration: 0.8,
                attr: { d: PATH_BOTTOM },
                ease: 'power2.out'
            });
    };

    useEffect(() => {
        if (isTransitioning) {
            animateIn();
        }
    }, [isTransitioning]);

    return (
        <div
            ref={wrapperRef}
            className="fixed inset-0 pointer-events-none z-[-1] flex items-end justify-center"
        >
            <svg
                className="w-full h-full absolute inset-0"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#00bae2" />
                        <stop offset="1" stopColor="#fec5fb" />
                    </linearGradient>
                </defs>
                <path
                    ref={pathRef}
                    className="path"
                    fill="url(#wave-grad)"
                    vectorEffect="non-scaling-stroke"
                    d={PATH_BOTTOM}
                />
            </svg>
        </div>
    );
};

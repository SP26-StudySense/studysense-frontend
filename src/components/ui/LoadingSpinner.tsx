'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    text?: string;
}

const sizeConfig = {
    sm: {
        container: 'w-6 h-6',
        svg: 'w-5 h-5',
        dotRadius: 2,
    },
    md: {
        container: 'w-12 h-12',
        svg: 'w-10 h-10',
        dotRadius: 4,
    },
    lg: {
        container: 'w-16 h-16',
        svg: 'w-12 h-12',
        dotRadius: 4,
    },
};

export const LoadingSpinner = ({
    size = 'md',
    showText = false,
    text = 'Loading...',
}: LoadingSpinnerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dotsRef = useRef<SVGCircleElement[]>([]);
    const config = sizeConfig[size];
    const dotRadius = config.dotRadius;
    const viewBoxSize = size === 'sm' ? 48 : 64;
    const dotCx1 = viewBoxSize === 48 ? 15 : 20;
    const dotCx2 = viewBoxSize === 48 ? 24 : 32;
    const dotCx3 = viewBoxSize === 48 ? 33 : 44;

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const tl = gsap.timeline({ repeat: -1 });

        // Animate 3 dots with stagger
        if (dotsRef.current.length > 0) {
            tl.to(dotsRef.current, {
                duration: 0.6,
                scale: 1.5,
                opacity: 0.3,
                ease: 'sine.inOut',
                stagger: {
                    each: 0.15,
                    repeat: 3,
                    yoyo: true,
                }
            })
                .to(dotsRef.current, {
                    duration: 0.3,
                    scale: 1,
                    opacity: 1,
                }, 0);
        }

        // Rotate container
        gsap.to(containerRef.current, {
            duration: 3,
            rotation: 360,
            ease: 'none',
            repeat: -1
        });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div
                ref={containerRef}
                className={`flex items-center justify-center ${config.container}`}
            >
                {/* SVG Icon with 3 dots */}
                <svg
                    className={config.svg}
                    viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Background rounded square */}
                    <rect
                        x="4"
                        y="4"
                        width={viewBoxSize - 8}
                        height={viewBoxSize - 8}
                        rx="8"
                        fill="currentColor"
                        className="text-neutral-900"
                    />

                    {/* Three dots - loader indicator */}
                    <circle
                        ref={(el) => {
                            if (el) dotsRef.current[0] = el;
                        }}
                        cx={dotCx1}
                        cy={viewBoxSize / 2}
                        r={dotRadius}
                        fill="white"
                    />
                    <circle
                        ref={(el) => {
                            if (el) dotsRef.current[1] = el;
                        }}
                        cx={dotCx2}
                        cy={viewBoxSize / 2}
                        r={dotRadius}
                        fill="white"
                    />
                    <circle
                        ref={(el) => {
                            if (el) dotsRef.current[2] = el;
                        }}
                        cx={dotCx3}
                        cy={viewBoxSize / 2}
                        r={dotRadius}
                        fill="white"
                    />

                    {/* Gradient overlay */}
                    <defs>
                        <linearGradient
                            id="grad-loader"
                            x1="0"
                            y1="0"
                            x2={viewBoxSize}
                            y2={viewBoxSize}
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0" stopColor="#fec5fb" stopOpacity="0.3" />
                            <stop offset="1" stopColor="#00bae2" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>
                    <rect
                        x="4"
                        y="4"
                        width={viewBoxSize - 8}
                        height={viewBoxSize - 8}
                        rx="8"
                        fill="url(#grad-loader)"
                    />
                </svg>
            </div>
            {showText && <p className="text-sm text-neutral-500">{text}</p>}
        </div>
    );
};

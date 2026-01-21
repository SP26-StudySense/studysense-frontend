'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { GitFork, Twitter, Github, Disc } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);
}

// Exact paths from CodePen demo
const DOWN_PATH = 'M0-0.3C0-0.3,464,156,1139,156S2278-0.3,2278-0.3V683H0V-0.3z';
const CENTER_PATH = 'M0-0.3C0-0.3,464,0,1139,0s1139-0.3,1139-0.3V683H0V-0.3z';

export const Footer = () => {
    const footerRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        const footer = footerRef.current;
        const path = pathRef.current;
        if (!footer || !path) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // ScrollTrigger for bouncy effect
        ScrollTrigger.create({
            trigger: footer,
            start: 'top bottom',
            onEnter: (self) => {
                const velocity = self.getVelocity();
                const variation = velocity / 10000;

                gsap.fromTo(
                    path,
                    { morphSVG: DOWN_PATH },
                    {
                        duration: 2,
                        morphSVG: CENTER_PATH,
                        ease: `elastic.out(${1 + variation}, ${1 - variation})`,
                        overwrite: true,
                    }
                );
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <footer ref={footerRef} className="relative w-full">
            {/* Single unified SVG that covers entire footer area */}
            <svg
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 2278 683"
                className="absolute inset-0 w-full h-full"
            >
                <defs>
                    <linearGradient
                        id="grad-1"
                        x1="0"
                        y1="0"
                        x2="2278"
                        y2="683"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0.2" stopColor="#fec5fb" />
                        <stop offset="0.8" stopColor="#00bae2" />
                    </linearGradient>
                </defs>
                <path
                    ref={pathRef}
                    id="bouncy-path"
                    fill="url(#grad-1)"
                    d={DOWN_PATH}
                />
            </svg>

            {/* Noise overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-30 mix-blend-color-dodge"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
                }}
            />

            {/* Footer Content - positioned on top of SVG */}
            <div className="relative z-10 pt-32 pb-8">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
                    <div className="flex flex-col justify-between gap-8 md:flex-row">
                        <div className="max-w-xs space-y-3">
                            <Link href="#" className="flex items-center gap-2 cursor-pointer group">
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-900/20 text-neutral-900 transition-transform duration-300 group-hover:scale-110 backdrop-blur">
                                    <GitFork width="14" />
                                </div>
                                <span className="font-semibold text-neutral-900">StudySense</span>
                            </Link>
                            <p className="text-sm text-neutral-700">
                                Community-driven learning roadmap platform.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-8 md:gap-16">
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Roadmaps</h4>
                                <ul className="space-y-1 text-sm text-neutral-700">
                                    <li><Link href="#" className="hover:text-neutral-900">Frontend</Link></li>
                                    <li><Link href="#" className="hover:text-neutral-900">Backend</Link></li>
                                    <li><Link href="#" className="hover:text-neutral-900">DevOps</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Resources</h4>
                                <ul className="space-y-1 text-sm text-neutral-700">
                                    <li><Link href="#" className="hover:text-neutral-900">Guides</Link></li>
                                    <li><Link href="#" className="hover:text-neutral-900">Videos</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Project</h4>
                                <ul className="space-y-1 text-sm text-neutral-700">
                                    <li><Link href="#" className="hover:text-neutral-900">About Us</Link></li>
                                    <li><Link href="#" className="hover:text-neutral-900">GitHub</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-6 flex items-center justify-between border-t border-neutral-900/10 pt-4 text-xs text-neutral-600">
                        <p>© 2024 StudySense</p>
                        <div className="flex gap-3">
                            <Link href="#" className="hover:text-neutral-900"><Twitter size={16} /></Link>
                            <Link href="#" className="hover:text-neutral-900"><Github size={16} /></Link>
                            <Link href="#" className="hover:text-neutral-900"><Disc size={16} /></Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

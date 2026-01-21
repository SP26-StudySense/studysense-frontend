'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook for scroll-triggered fade-up animation
 */
export function useScrollFadeUp<T extends HTMLElement>(
    options: {
        delay?: number;
        duration?: number;
        y?: number;
        stagger?: number;
    } = {}
) {
    const ref = useRef<T>(null);
    const { delay = 0, duration = 0.8, y = 40, stagger = 0.1 } = options;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const children = el.querySelectorAll('[data-animate]');
        const targets = children.length > 0 ? children : el;

        gsap.set(targets, { opacity: 0, y });

        const animation = gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration,
            delay,
            stagger,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
        });

        return () => {
            animation.kill();
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger === el) t.kill();
            });
        };
    }, [delay, duration, y, stagger]);

    return ref;
}

/**
 * Hook for hero section entrance animation
 */
export function useHeroAnimation<T extends HTMLElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Badge
        const badge = el.querySelector('[data-hero-badge]');
        // Title
        const title = el.querySelector('[data-hero-title]');
        // Description
        const desc = el.querySelector('[data-hero-desc]');
        // Buttons
        const buttons = el.querySelector('[data-hero-buttons]');
        // Visual
        const visual = el.querySelector('[data-hero-visual]');

        gsap.set([badge, title, desc, buttons], { opacity: 0, y: 30 });
        gsap.set(visual, { opacity: 0, x: 50 });

        tl.to(badge, { opacity: 1, y: 0, duration: 0.6 })
            .to(title, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
            .to(desc, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
            .to(buttons, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
            .to(visual, { opacity: 1, x: 0, duration: 1 }, '-=0.8');

        return () => {
            tl.kill();
        };
    }, []);

    return ref;
}

/**
 * Hook for floating animation
 */
export function useFloatingAnimation<T extends HTMLElement>(
    options: {
        y?: number;
        duration?: number;
        delay?: number;
    } = {}
) {
    const ref = useRef<T>(null);
    const { y = 15, duration = 3, delay = 0 } = options;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const animation = gsap.to(el, {
            y: -y,
            duration,
            delay,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
        });

        return () => {
            animation.kill();
        };
    }, [y, duration, delay]);

    return ref;
}

/**
 * Hook for staggered card reveal
 */
export function useStaggerReveal<T extends HTMLElement>(
    options: {
        stagger?: number;
        duration?: number;
    } = {}
) {
    const ref = useRef<T>(null);
    const { stagger = 0.15, duration = 0.8 } = options;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const cards = el.querySelectorAll('[data-card]');
        if (cards.length === 0) return;

        gsap.set(cards, { opacity: 0, y: 50 });

        const animation = gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration,
            stagger,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
        });

        return () => {
            animation.kill();
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger === el) t.kill();
            });
        };
    }, [stagger, duration]);

    return ref;
}

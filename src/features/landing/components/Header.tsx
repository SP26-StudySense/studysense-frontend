'use client';

import Link from 'next/link';
import { GitFork, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransitionRouter } from '@/shared/context/TransitionContext';

export const Header = () => {
    const { navigateWithTransition } = useTransitionRouter();
    return (
        <header className="glass-panel fixed left-0 right-0 top-0 z-50 border-b border-neutral-200/60">
            <div className="flex h-16 w-full items-center justify-between px-8 lg:px-16 xl:px-24">
                <Link href="/" className="group flex items-center gap-2 cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-[#00bae2] transition-transform duration-300 group-hover:scale-105">
                        <GitFork className="h-[18px] w-[18px]" strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-neutral-900">
                        Study<span className="text-neutral-500">Sense</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-x-8 md:flex">
                    <Link
                        href="#roadmaps"
                        className="link-underline text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                        Roadmaps
                    </Link>
                    <Link
                        href="#guides"
                        className="link-underline text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                        Best Practices
                    </Link>
                    <Link
                        href="#community"
                        className="link-underline text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                        Community
                    </Link>
                </nav>

                <div className="flex items-center gap-x-4">
                    <button
                        onClick={() => navigateWithTransition('/login')}
                        className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors sm:block cursor-pointer"
                    >
                        Log in
                    </button>
                    <button onClick={() => navigateWithTransition('/register')}>
                        <div className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-neutral-900/10 transition-all duration-300 hover:bg-neutral-800 hover:scale-105 hover:shadow-xl cursor-pointer">
                            Sign Up Free
                            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

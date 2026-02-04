'use client';

import Link from 'next/link';
import { GitFork, ChevronRight } from 'lucide-react';
import { useTransitionRouter } from '@/shared/context/TransitionContext';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/shared/ui/button';
import { UserProfile } from '@/components/dashboard/UserProfile';

export const Header = () => {
    const { navigateWithTransition } = useTransitionRouter();
    const { isAuthenticated, isLoading } = useAuth();

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
                        href="/"
                        className="link-underline text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                        Home
                    </Link>
                    <Link
                        href="/roadmaps"
                        className="link-underline text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                        Roadmaps
                    </Link>
                    <Link
                        href="#community"
                        className="link-underline text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                        Community
                    </Link>
                </nav>

                <div className="flex items-center gap-x-4">
                    {isLoading ? (
                        <div className="h-8 w-8 rounded-full bg-neutral-200 animate-pulse" />
                    ) : isAuthenticated ? (
                        <UserProfile />
                    ) : (
                        <>
                            <button
                                onClick={() => navigateWithTransition('/login')}
                                className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors sm:block cursor-pointer"
                            >
                                Log in
                            </button>
                            <Button
                                variant="brand"
                                size="sm"
                                onClick={() => navigateWithTransition('/register')}
                                className="gap-2"
                            >
                                Sign Up Free
                                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

'use client';

import Link from 'next/link';
import { GitFork, ChevronRight, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useTransitionRouter } from '@/shared/context/TransitionContext';
import { useAuth } from '@/features/auth/hooks/use-auth';

export const Header = () => {
    const { navigateWithTransition } = useTransitionRouter();
    const { user, isAuthenticated, logout, isLoading } = useAuth();

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
                        href="#community"
                        className="link-underline text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                        Community
                    </Link>
                    {isAuthenticated && (
                        <Link
                            href="/dashboard"
                            className="link-underline text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                        >
                            Dashboard
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-x-4">
                    {isLoading ? (
                        <div className="h-8 w-8 rounded-full bg-neutral-200 animate-pulse" />
                    ) : isAuthenticated && user ? (
                        <div className="relative group">
                            {/* Avatar + Name */}
                            <div className="flex items-center gap-2.5 cursor-pointer rounded-full py-1.5 px-2 transition-colors hover:bg-neutral-100">
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.firstName || 'User avatar'}
                                        className="h-8 w-8 rounded-full object-cover ring-2 ring-neutral-200"
                                    />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white ring-2 ring-neutral-200">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                                <span className="hidden text-sm font-medium text-neutral-700 sm:block max-w-[120px] truncate">
                                    {user.firstName || user.email}
                                </span>
                            </div>

                            {/* Hover Dropdown */}
                            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="min-w-[180px] rounded-xl border border-neutral-200 bg-white p-2 shadow-xl shadow-neutral-900/10">
                                    <div className="px-3 py-2 border-b border-neutral-100 mb-2">
                                        <p className="text-sm font-medium text-neutral-900 truncate">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-xs text-neutral-500 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => logout()}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Log out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

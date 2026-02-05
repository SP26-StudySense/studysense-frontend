'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Map,
    Calendar,
    LogOut,
    GitFork,
    History
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useStudyPlans } from '@/features/study-plan/api';
import { useSessionStore } from '@/store/session.store';

const baseSidebarItems = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Study Schedule',
        href: '/study-plans/1',
        icon: BookOpen,
    },
    {
        title: 'Sessions',
        href: '/sessions',
        icon: Calendar,
    },
    {
        title: 'History',
        href: '/sessions/history',
        icon: History,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, isLoggingOut } = useAuth();
    const { data: studyPlans = [] } = useStudyPlans();

    const activeStudyPlanIdStore = useSessionStore((state) => state.activeStudyPlanId);

    const activeStudyPlanId = (() => {
        // 1. If we have a stored active ID and we are on dashboard or some other page that doesn't specify ID, use it
        if (activeStudyPlanIdStore && !pathname.match(/^\/(study-plans|my-roadmap)\/(\d+)/)) {
            return activeStudyPlanIdStore;
        }

        const match = pathname.match(/^\/(study-plans|my-roadmap)\/(\d+)/);
        if (match) return match[2];
        // Sort by createdAt descending to get the most recent study plan
        if (studyPlans.length > 0) {
            const sortedPlans = [...studyPlans].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return String(sortedPlans[0].id);
        }
        return null;
    })();

    // Build sidebar items with dynamic study plan and roadmap links
    const sidebarItems = activeStudyPlanId
        ? [
            baseSidebarItems[0], // Overview
            {
                title: 'Study Schedule',
                href: `/study-plans/${activeStudyPlanId}`,
                icon: BookOpen,
            },
            {
                title: 'My Roadmap',
                href: `/my-roadmap/${activeStudyPlanId}`,
                icon: Map,
            },
            ...baseSidebarItems.slice(2), // Sessions, History
        ]
        : baseSidebarItems;

    // Check if a link is active
    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === href;
        }
        // Specific exception: Don't highlight 'Sessions' when on 'History' page
        if (href === '/sessions' && pathname.startsWith('/sessions/history')) {
            return false;
        }
        // Exception: Highlight 'Study Plans' for any study plan page
        if (href.startsWith('/study-plans') && pathname.startsWith('/study-plans')) {
            return true;
        }
        // Exception: Highlight 'My Roadmap' for any my-roadmap page
        if (href.startsWith('/my-roadmap') && pathname.startsWith('/my-roadmap')) {
            return true;
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-neutral-200/60 bg-white/80 backdrop-blur-xl">
            {/* Logo */}
            <div className="flex h-20 shrink-0 items-center px-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-[#c1ff72] shadow-lg shadow-neutral-900/10">
                        <GitFork className="h-[22px] w-[22px]" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-neutral-900">
                        Study<span className="text-neutral-500">Sense</span>
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <nav className="flex flex-col gap-1">
                    <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Menu
                    </div>
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive(item.href)
                                    ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/10"
                                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                            )}
                        >
                            <item.icon className={cn(
                                "h-[18px] w-[18px] transition-colors",
                                isActive(item.href) ? "text-[#c1ff72]" : "text-neutral-500 group-hover:text-neutral-900"
                            )} strokeWidth={2} />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Footer / Logout */}
            <div className="border-t border-neutral-200 p-4">
                <Button
                    variant="ghost"
                    disabled={isLoggingOut}
                    className="flex w-full items-center justify-start gap-3 rounded-xl py-6 text-neutral-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => logout()}
                >
                    {isLoggingOut ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        <>
                            <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
                            <span className="text-sm font-medium">Log out</span>
                        </>
                    )}
                </Button>
            </div>
        </aside>
    );
}

// Fallback for missing cn utility if not present, but usually it is in @/lib/utils
// If @/lib/utils doesn't exist, I'll need to create it or adjust imports.
// Assuming it exists based on common project structures, but will verify if it fails.

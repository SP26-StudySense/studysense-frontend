'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Map,
    Calendar,
    MessageSquare,
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
import { useNavigationGuard } from '@/shared/hooks/useNavigationGuard';
import { ConfirmationModal } from '@/shared/ui';

const baseSidebarItems = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Study Plan',
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
    {
        title: 'Chat',
        href: '/chat',
        icon: MessageSquare,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, isLoggingOut } = useAuth();
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const { data: studyPlans = [] } = useStudyPlans();
    const { navigateWithGuard } = useNavigationGuard();

    const activeStudyPlanIdStore = useSessionStore((state) => state.activeStudyPlanId);
    const setActiveStudyPlanId = useSessionStore((state) => state.setActiveStudyPlanId);

    const activeStudyPlanId = (() => {
        // 1. Extract ID from URL if present in plan-scoped sections
        const planScopedMatch = pathname.match(/^\/(dashboard|study-plans|my-roadmap|sessions)\/(\d+)/);
        if (planScopedMatch) return planScopedMatch[2];
        
        // 2. Use stored active ID if available
        if (activeStudyPlanIdStore) {
            return activeStudyPlanIdStore;
        }
        
        // 3. Fallback: Sort by createdAt descending to get the most recent study plan
        if (studyPlans.length > 0) {
            const sortedPlans = [...studyPlans].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return String(sortedPlans[0].id);
        }
        return null;
    })();

    // Sync pathname ID to store to maintain consistency
    useEffect(() => {
        const match = pathname.match(/^\/(dashboard|study-plans|my-roadmap|sessions)\/(\d+)/);
        if (match) {
            const idFromPath = match[2];
            if (idFromPath !== activeStudyPlanIdStore) {
                setActiveStudyPlanId(idFromPath);
            }
        }
    }, [pathname, activeStudyPlanIdStore, setActiveStudyPlanId]);

    // Build sidebar items with dynamic study plan and roadmap links
    const sidebarItems = activeStudyPlanId
        ? [
            {
                title: 'Overview',
                href: `/dashboard/${activeStudyPlanId}`,
                icon: LayoutDashboard,
            },
            {
                title: 'Roadmap',
                href: `/my-roadmap/${activeStudyPlanId}`,
                icon: Map,
            },
            {
                title: 'Sessions',
                href: `/sessions/${activeStudyPlanId}`,
                icon: Calendar,
            },
            {
                title: 'Chat',
                href: '/chat',
                icon: MessageSquare,
            },
            {
                title: 'History',
                href: `/sessions/${activeStudyPlanId}/history`,
                icon: History,
            },
        ]
        : baseSidebarItems;

    // Check if a link is active
    const isActive = (href: string) => {
        // Exception: Highlight 'Overview' for any dashboard page
        if (href.startsWith('/dashboard')) {
            return pathname.startsWith('/dashboard');
        }
        // Specific exception: Don't highlight 'Sessions' when on 'History' page
        if (href.startsWith('/sessions/') && href.endsWith('/history') && pathname.startsWith('/sessions/')) {
            return pathname.endsWith('/history');
        }
        if ((href === '/sessions' || /^\/sessions\/\d+$/.test(href)) && pathname.startsWith('/sessions/') && pathname.endsWith('/history')) {
            return false;
        }
        // Exception: Highlight 'Study Plans' for any study plan page
        if (href.startsWith('/study-plans') && pathname.startsWith('/study-plans')) {
            return true;
        }
        // Exception: Highlight 'Roadmap' for any my-roadmap page
        if (href.startsWith('/my-roadmap') && pathname.startsWith('/my-roadmap')) {
            return true;
        }
        return pathname.startsWith(href);
    };

    const handleSidebarNavigation = (href: string) => {
        // Prevent stale session queries when user switches roadmap then opens Sessions quickly.
        if (href.startsWith('/sessions') && activeStudyPlanId) {
            setActiveStudyPlanId(activeStudyPlanId);
        }

        navigateWithGuard(href);
    };

    return (
        <aside className="fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-neutral-200/60 bg-white/80 backdrop-blur-xl">
            {/* Logo */}
            <div className="flex h-20 shrink-0 items-center px-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-lg shadow-neutral-900/10">
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
                        <button
                            key={item.href}
                            onClick={() => handleSidebarNavigation(item.href)}
                            className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full text-left cursor-pointer border-0 bg-transparent",
                                isActive(item.href)
                                    ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/10"
                                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                            )}
                        >
                            <item.icon className={cn(
                                "h-[18px] w-[18px] transition-colors",
                                isActive(item.href) ? "text-white" : "text-neutral-500 group-hover:text-neutral-900"
                            )} strokeWidth={2} />
                            {item.title}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Footer / Logout */}
            <div className="border-t border-neutral-200 p-4">
                <Button
                    variant="ghost"
                    disabled={isLoggingOut}
                    className="flex w-full items-center justify-start gap-3 rounded-xl py-6 text-neutral-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setIsLogoutConfirmOpen(true)}
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

            <ConfirmationModal
                isOpen={isLogoutConfirmOpen}
                onClose={() => setIsLogoutConfirmOpen(false)}
                onConfirm={() => {
                    void logout();
                }}
                title="Log out"
                description="Are you sure you want to log out of your account?"
                confirmText="Log out"
                cancelText="Stay logged in"
                variant="danger"
            />
        </aside>
    );
}

// Fallback for missing cn utility if not present, but usually it is in @/lib/utils
// If @/lib/utils doesn't exist, I'll need to create it or adjust imports.
// Assuming it exists based on common project structures, but will verify if it fails.

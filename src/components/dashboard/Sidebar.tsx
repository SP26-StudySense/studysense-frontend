'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Map,
    Calendar,
    Users,
    Settings,
    LogOut,
    GitFork,
    History
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const sidebarItems = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Study Plans',
        href: '/study-plans/1',
        icon: BookOpen,
    },
    {
        title: 'Roadmaps',
        href: '/roadmaps',
        icon: Map,
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
        title: 'Community',
        href: '/community',
        icon: Users,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, isLoggingOut } = useAuth();

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
        if (href === '/study-plans/1' && pathname.startsWith('/study-plans')) {
            return true;
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-neutral-200/60 bg-white/80 backdrop-blur-xl">
            {/* Logo */}
            <div className="flex h-20 shrink-0 items-center px-6">
                <Link href="/dashboard" className="flex items-center gap-3">
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

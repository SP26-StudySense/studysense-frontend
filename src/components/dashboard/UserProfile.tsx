'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, LogOut } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function UserProfile() {
    const { user, isLoading, logout, isLoggingOut } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
            </div>
        );
    }

    if (!user) return null;

    const initials = `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();

    // Helper to capitalize first letter
    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
    const fullName = `${capitalize(user.firstName ?? '')} ${capitalize(user.lastName ?? '')}`.trim() || user.email;

    return (
        <div className="relative group">
            {/* Avatar + Name (trigger) */}
            <div className="flex items-center gap-3 cursor-pointer rounded-full py-1.5 px-2 transition-colors hover:bg-neutral-100">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-neutral-900 leading-none">
                        {fullName}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                        {user.email}
                    </p>
                </div>
                <Avatar className="h-10 w-10 border border-neutral-200 ring-2 ring-white transition-transform hover:scale-105">
                    <AvatarImage src={user.avatarUrl ?? ''} alt={fullName} />
                    <AvatarFallback className="bg-neutral-900 text-white font-medium text-sm">
                        {initials || 'U'}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Hover Dropdown */}
            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="min-w-[200px] rounded-xl border border-neutral-200 bg-white p-2 shadow-xl shadow-neutral-900/10">
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-neutral-100 mb-2">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                            {fullName}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                            {user.email}
                        </p>
                    </div>

                    {/* Profile Link */}
                    <Link
                        href="/profile"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                    >
                        <Settings className="h-4 w-4" />
                        Profile
                    </Link>

                    {/* Logout Button */}
                    <button
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoggingOut ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                <LogOut className="h-4 w-4" />
                                Log out
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

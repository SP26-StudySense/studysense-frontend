'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

export function UserProfile() {
    const { user, isLoading } = useAuth();

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

    // Debug log
    console.log('[UserProfile] User data:', {
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        email: user.email,
        roles: user.roles
    });

    // Helper to capitalize first letter
    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
    const fullName = `${capitalize(user.firstName ?? '')} ${capitalize(user.lastName ?? '')}`.trim() || user.email;



    return (
        <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-neutral-900 leading-none">
                    {fullName}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                    {user.email}
                </p>
            </div>
            <Avatar className="h-10 w-10 border border-neutral-200 ring-2 ring-white cursor-pointer transition-transform hover:scale-105">
                <AvatarImage src={user.avatarUrl ?? ''} alt={fullName} />
                <AvatarFallback className="bg-neutral-900 text-white font-medium text-sm">
                    {initials || 'U'}
                </AvatarFallback>
            </Avatar>
        </div>
    );
}

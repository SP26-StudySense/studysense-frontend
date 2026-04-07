'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Loader2 } from 'lucide-react';

import { useProfileData } from '@/features/profile/hooks';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileInfoCard } from '@/features/profile/components/ProfileInfoCard';
import { PasswordChangeCard } from '@/features/profile/components/PasswordChangeCard';

export default function ProfilePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        profile,
        isLoading,
        isError,
        updateProfile,
        isUpdating,
        changePassword,
        isChangingPassword,
        uploadAvatar,
        isUploadingAvatar,
    } = useProfileData();

    // GSAP entrance animation
    useEffect(() => {
        const container = containerRef.current;
        if (!container || isLoading) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const elements = container.querySelectorAll('[data-animate]');

        gsap.set(elements, { opacity: 0, y: 30 });
        gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power3.out',
        });
    }, [isLoading]);

    // Handle avatar change - update profile with new avatar URL
    const handleAvatarChange = async (url: string) => {
        await updateProfile({ avatarUrl: url });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00bae2]" />
                    <p className="text-sm text-neutral-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-neutral-900">Failed to load profile</h2>
                    <p className="mt-1 text-sm text-neutral-500">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="mx-auto max-w-5xl space-y-8">
            {/* Profile Header with Avatar */}
            <div data-animate>
                <ProfileHeader
                    profile={profile}
                    onAvatarUpload={uploadAvatar}
                    onAvatarChange={handleAvatarChange}
                    isUploadingAvatar={isUploadingAvatar}
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Personal Info - 2 columns */}
                <div data-animate className="lg:col-span-2">
                    <ProfileInfoCard
                        profile={profile}
                        onUpdate={updateProfile}
                        isUpdating={isUpdating}
                    />
                </div>

                {/* Password Change - 1 column */}
                <div data-animate>
                    <PasswordChangeCard
                        onChangePassword={changePassword}
                        isChanging={isChangingPassword}
                    />
                </div>
            </div>
        </div>
    );
}

'use client';

import { AvatarUpload } from './AvatarUpload';
import { Mail, MapPin } from 'lucide-react';
import type { UserProfile } from '../types';

interface ProfileHeaderProps {
    profile: UserProfile;
    onAvatarUpload: (file: File) => Promise<string>;
    onAvatarChange: (url: string) => Promise<void>;
    isUploadingAvatar: boolean;
}

export function ProfileHeader({
    profile,
    onAvatarUpload,
    onAvatarChange,
    isUploadingAvatar,
}: ProfileHeaderProps) {
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'User';
    const initials = `${profile.firstName?.charAt(0) ?? ''}${profile.lastName?.charAt(0) ?? ''}`.toUpperCase() || 'U';

    return (
        <div className="relative overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
            {/* Cover Background */}
            <div className="relative h-48 bg-gradient-to-br from-[#fec5fb]/60 via-[#00bae2]/40 to-[#fec5fb]/30">
                {/* Decorative Blobs */}
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-[#00bae2]/30 blur-3xl" />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Profile Info */}
            <div className="relative px-8 pb-8">
                {/* Avatar - Positioned to overlap cover */}
                <div className="-mt-16 mb-4 flex justify-center lg:justify-start">
                    <AvatarUpload
                        currentAvatarUrl={profile.avatarUrl}
                        userName={fullName}
                        userInitials={initials}
                        onUpload={onAvatarUpload}
                        onAvatarChange={onAvatarChange}
                        isUploading={isUploadingAvatar}
                    />
                </div>

                {/* Name & Info */}
                <div className="text-center lg:text-left">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                        {fullName}
                    </h1>

                    <div className="mt-2 flex flex-col items-center gap-2 lg:flex-row lg:items-center lg:gap-4">
                        <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                            <Mail className="h-4 w-4" />
                            <span>{profile.email}</span>
                        </div>

                        {profile.address && (
                            <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                                <MapPin className="h-4 w-4" />
                                <span>{profile.address}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

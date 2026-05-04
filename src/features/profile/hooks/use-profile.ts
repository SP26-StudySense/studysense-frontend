'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';
import { useProfile, useUpdateProfile, useChangePassword, useUploadFile } from '../api';
import type { UpdateProfileRequest, ChangePasswordRequest, UserProfile } from '../types';

interface UseProfileReturn {
    // State
    profile: UserProfile | null;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;

    // Update profile
    updateProfile: (data: UpdateProfileRequest) => Promise<void>;
    isUpdating: boolean;

    // Change password
    changePassword: (data: ChangePasswordRequest) => Promise<void>;
    isChangingPassword: boolean;

    // Upload avatar
    uploadAvatar: (file: File) => Promise<string>;
    isUploadingAvatar: boolean;

    // Helpers
    refetch: () => void;
}

export function useProfileData(): UseProfileReturn {
    const queryClient = useQueryClient();

    const { data: profile, isLoading, isError, error, refetch } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();
    const uploadFileMutation = useUploadFile();

    const updateProfile = useCallback(
        async (data: UpdateProfileRequest) => {
            await updateProfileMutation.mutateAsync(data);
        },
        [updateProfileMutation]
    );

    const changePassword = useCallback(
        async (data: ChangePasswordRequest) => {
            await changePasswordMutation.mutateAsync(data);
        },
        [changePasswordMutation]
    );

    const uploadAvatar = useCallback(
        async (file: File): Promise<string> => {
            const result = await uploadFileMutation.mutateAsync(file);
            return result.publicUrl;
        },
        [uploadFileMutation]
    );

    return {
        profile: profile ?? null,
        isLoading,
        isError,
        error: error as Error | null,

        updateProfile,
        isUpdating: updateProfileMutation.isPending,

        changePassword,
        isChangingPassword: changePasswordMutation.isPending,

        uploadAvatar,
        isUploadingAvatar: uploadFileMutation.isPending,

        refetch,
    };
}

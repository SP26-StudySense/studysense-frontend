/**
 * Profile API mutations using React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { put, apiClient } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import { toast } from '@/shared/lib';
import type {
    UpdateProfileRequest,
    UpdateProfileResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    UploadResponse,
} from '../types';
import { getUserFromStorage, saveUserToStorage } from '@/features/auth/api/mutations';
import type { User } from '@/features/auth/types';

/**
 * Update user profile
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => {
            // Format the request data - ensure date is in ISO format if provided
            const requestData: Record<string, unknown> = {};

            if (data.firstName !== undefined) requestData.firstName = data.firstName;
            if (data.lastName !== undefined) requestData.lastName = data.lastName;
            if (data.avatarUrl !== undefined) requestData.avatarUrl = data.avatarUrl;
            if (data.address !== undefined) requestData.address = data.address;
            if (data.gender !== undefined) requestData.gender = data.gender;
            if (data.phoneNumber !== undefined) requestData.phoneNumber = data.phoneNumber;

            // Format date - backend expects ISO format or null
            if (data.dob !== undefined) {
                if (data.dob) {
                    // Convert YYYY-MM-DD to ISO string
                    requestData.dob = new Date(data.dob).toISOString();
                } else {
                    requestData.dob = null;
                }
            }

            return put<UpdateProfileResponse>(endpoints.users.profile, requestData);
        },
        onSuccess: (response) => {
            // Update profile cache
            queryClient.setQueryData(queryKeys.users.profile(), response);

            // Update auth user cache (for avatar/name updates in header)
            // We need to merge with existing user data to preserve roles/permissions
            const currentUser = getUserFromStorage();
            if (currentUser) {
                const updatedUser: User = {
                    ...currentUser,
                    firstName: response.firstName || currentUser.firstName || '',
                    lastName: response.lastName || currentUser.lastName || '',
                    avatarUrl: response.avatarUrl,
                    // Preserve other fields
                };

                // Update storage and cache
                saveUserToStorage(updatedUser);
                queryClient.setQueryData(queryKeys.auth.me(), updatedUser);
            } else {
                // Fallback for edge cases
                queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
            }

            toast.success('Profile updated!', {
                description: 'Your profile information has been saved.',
            });
        },
        onError: (error) => {
            toast.apiError(error, 'Failed to update profile');
        },
    });
}

/**
 * Change password
 */
export function useChangePassword() {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) =>
            put<ChangePasswordResponse>('/users/password', data),
        onSuccess: (response) => {
            toast.success('Password changed!', {
                description: response.message || 'Your password has been updated successfully.',
            });
        },
        onError: (error) => {
            toast.apiError(error, 'Failed to change password');
        },
    });
}

/**
 * Upload file to storage
 */
export function useUploadFile() {
    return useMutation({
        mutationFn: async (file: File): Promise<UploadResponse> => {
            const formData = new FormData();
            formData.append('File', file); // Backend expects 'File' (PascalCase)

            // Don't set Content-Type header manually - browser will set it with correct boundary
            const response = await apiClient.post<UploadResponse>('/storage/upload', formData);

            return response.data as UploadResponse;
        },
        onError: (error) => {
            toast.apiError(error, 'Failed to upload file');
        },
    });
}


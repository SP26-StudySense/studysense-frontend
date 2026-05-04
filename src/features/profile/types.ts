/**
 * Profile types matching Backend DTOs
 */

// User profile - matches GetProfileResponse
export interface UserProfile {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    address: string | null;
    dob: string | null; // ISO date string
    gender: string | null;
    phoneNumber: string | null;
}

// Update profile request - matches UpdateProfileRequest
export interface UpdateProfileRequest {
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    address?: string | null;
    dob?: string | null;
    gender?: string | null;
    phoneNumber?: string | null;
}

// Update profile response - matches UpdateProfileResponse
export interface UpdateProfileResponse extends UserProfile { }

// Change password request - matches ChangePasswordRequest
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

// Change password response - matches ChangePasswordResponse
export interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

// File upload response - matches UploadResponse
export interface UploadResponse {
    success: boolean;
    objectName: string;
    publicUrl: string;
    fileName: string;
}

// Gender options
export const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export type Gender = typeof GENDER_OPTIONS[number]['value'];

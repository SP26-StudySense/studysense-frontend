'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { ChangePasswordRequest } from '../types';

interface PasswordChangeCardProps {
    onChangePassword: (data: ChangePasswordRequest) => Promise<void>;
    isChanging: boolean;
}

export function PasswordChangeCard({ onChangePassword, isChanging }: PasswordChangeCardProps) {
    const [formData, setFormData] = useState<ChangePasswordRequest>({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [errors, setErrors] = useState<Partial<ChangePasswordRequest>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<ChangePasswordRequest> = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }

        if (!formData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await onChangePassword(formData);
            // Reset form on success
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
            setErrors({});
        } catch (error) {
            // Error is handled by mutation
        }
    };

    const handleChange = (field: keyof ChangePasswordRequest, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const togglePassword = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    // Password strength indicator
    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
        if (strength <= 4) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
        return { strength: 3, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);

    return (
        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fec5fb]/30 to-[#00bae2]/20">
                    <Lock className="h-5 w-5 text-neutral-700" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Change Password</h2>
                    <p className="text-sm text-neutral-500">Update your account password</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Password */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Current Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={formData.currentPassword}
                            onChange={(e) => handleChange('currentPassword', e.target.value)}
                            className={`w-full rounded-xl border bg-neutral-50 px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10 ${errors.currentPassword
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-neutral-200 focus:border-[#00bae2]'
                                }`}
                            placeholder="Enter current password"
                        />
                        <button
                            type="button"
                            onClick={() => togglePassword('current')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                            {showPasswords.current ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.currentPassword && (
                        <p className="text-xs text-red-500">{errors.currentPassword}</p>
                    )}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={formData.newPassword}
                            onChange={(e) => handleChange('newPassword', e.target.value)}
                            className={`w-full rounded-xl border bg-neutral-50 px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10 ${errors.newPassword
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-neutral-200 focus:border-[#00bae2]'
                                }`}
                            placeholder="Enter new password"
                        />
                        <button
                            type="button"
                            onClick={() => togglePassword('new')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                            {showPasswords.new ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.newPassword && (
                        <div className="mt-2 space-y-1">
                            <div className="flex gap-1">
                                {[1, 2, 3].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1 flex-1 rounded-full transition-colors ${level <= passwordStrength.strength
                                                ? passwordStrength.color
                                                : 'bg-neutral-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-neutral-500">
                                Password strength: <span className="font-medium">{passwordStrength.label}</span>
                            </p>
                        </div>
                    )}

                    {errors.newPassword && (
                        <p className="text-xs text-red-500">{errors.newPassword}</p>
                    )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={formData.confirmNewPassword}
                            onChange={(e) => handleChange('confirmNewPassword', e.target.value)}
                            className={`w-full rounded-xl border bg-neutral-50 px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10 ${errors.confirmNewPassword
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-neutral-200 focus:border-[#00bae2]'
                                }`}
                            placeholder="Confirm new password"
                        />
                        <button
                            type="button"
                            onClick={() => togglePassword('confirm')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                            {showPasswords.confirm ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.confirmNewPassword && (
                        <p className="text-xs text-red-500">{errors.confirmNewPassword}</p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="brand"
                    disabled={isChanging}
                    className="w-full gap-2"
                >
                    {isChanging ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="h-4 w-4" />
                            Update Password
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}

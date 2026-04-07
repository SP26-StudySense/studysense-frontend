'use client';

import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Calendar, Users, Pencil, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import type { UserProfile, UpdateProfileRequest } from '../types';
import { GENDER_OPTIONS } from '../types';

interface ProfileInfoCardProps {
    profile: UserProfile;
    onUpdate: (data: UpdateProfileRequest) => Promise<void>;
    isUpdating: boolean;
}

export function ProfileInfoCard({ profile, onUpdate, isUpdating }: ProfileInfoCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateProfileRequest>({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        address: profile.address,
        dob: profile.dob,
        gender: profile.gender,
    });

    // Sync form data when profile changes
    useEffect(() => {
        if (!isEditing) {
            setFormData({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phoneNumber: profile.phoneNumber,
                address: profile.address,
                dob: profile.dob,
                gender: profile.gender,
            });
        }
    }, [profile, isEditing]);

    const handleCancel = () => {
        setFormData({
            firstName: profile.firstName,
            lastName: profile.lastName,
            phoneNumber: profile.phoneNumber,
            address: profile.address,
            dob: profile.dob,
            gender: profile.gender,
        });
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            await onUpdate(formData);
            setIsEditing(false);
        } catch (error) {
            // Error is handled by the mutation
        }
    };

    const handleChange = (field: keyof UpdateProfileRequest, value: string | null) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Format date for display
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return '—';
        }
    };

    // Format date for input
    const formatDateForInput = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    const getGenderLabel = (value: string | null) => {
        if (!value) return '—';
        const option = GENDER_OPTIONS.find((o) => o.value === value);
        return option?.label ?? value;
    };

    return (
        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fec5fb]/30 to-[#00bae2]/20">
                        <User className="h-5 w-5 text-neutral-700" />
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-900">Personal Information</h2>
                </div>

                {!isEditing ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="gap-2 text-neutral-600 hover:bg-neutral-900 hover:text-white"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            disabled={isUpdating}
                            className="gap-1 text-neutral-600"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            variant="brand"
                            size="sm"
                            onClick={handleSave}
                            disabled={isUpdating}
                            className="gap-1"
                        >
                            {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                            Save
                        </Button>
                    </div>
                )}
            </div>

            {/* Fields Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
                {/* First Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                        First Name
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.firstName ?? ''}
                            onChange={(e) => handleChange('firstName', e.target.value || null)}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10"
                            placeholder="Enter first name"
                        />
                    ) : (
                        <p className="text-sm font-medium text-neutral-900">
                            {profile.firstName || '—'}
                        </p>
                    )}
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Last Name
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.lastName ?? ''}
                            onChange={(e) => handleChange('lastName', e.target.value || null)}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10"
                            placeholder="Enter last name"
                        />
                    ) : (
                        <p className="text-sm font-medium text-neutral-900">
                            {profile.lastName || '—'}
                        </p>
                    )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
                        <Phone className="h-3.5 w-3.5" />
                        Phone Number
                    </label>
                    {isEditing ? (
                        <input
                            type="tel"
                            value={formData.phoneNumber ?? ''}
                            onChange={(e) => handleChange('phoneNumber', e.target.value || null)}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10"
                            placeholder="Enter phone number"
                        />
                    ) : (
                        <p className="text-sm font-medium text-neutral-900">
                            {profile.phoneNumber || '—'}
                        </p>
                    )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
                        <Calendar className="h-3.5 w-3.5" />
                        Date of Birth
                    </label>
                    {isEditing ? (
                        <input
                            type="date"
                            value={formatDateForInput(formData.dob)}
                            onChange={(e) => handleChange('dob', e.target.value || null)}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10"
                        />
                    ) : (
                        <p className="text-sm font-medium text-neutral-900">
                            {formatDate(profile.dob)}
                        </p>
                    )}
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
                        <Users className="h-3.5 w-3.5" />
                        Gender
                    </label>
                    {isEditing ? (
                        <select
                            value={formData.gender ?? ''}
                            onChange={(e) => handleChange('gender', e.target.value || null)}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00bae2] focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10"
                        >
                            <option value="">Select gender</option>
                            {GENDER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-sm font-medium text-neutral-900">
                            {getGenderLabel(profile.gender)}
                        </p>
                    )}
                </div>

                {/* Address - Full width */}
                <div className="space-y-1.5 sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
                        <MapPin className="h-3.5 w-3.5" />
                        Address
                    </label>
                    {isEditing ? (
                        <textarea
                            value={formData.address ?? ''}
                            onChange={(e) => handleChange('address', e.target.value || null)}
                            rows={2}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition-all resize-none focus:border-[#00bae2] focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10"
                            placeholder="Enter your address"
                        />
                    ) : (
                        <p className="text-sm font-medium text-neutral-900">
                            {profile.address || '—'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

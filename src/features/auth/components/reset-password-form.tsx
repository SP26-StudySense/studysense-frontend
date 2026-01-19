'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

import { resetPasswordSchema, type ResetPasswordInput } from '../schema/auth.schema';
import { useResetPassword } from '../api/mutations';

export const ResetPasswordForm = () => {
    const searchParams = useSearchParams();
    const [apiError, setApiError] = useState<string | null>(null);
    const [isInvalidLink, setIsInvalidLink] = useState(false);

    // Get userId and token from URL
    const userId = searchParams.get('userId') || '';
    const token = searchParams.get('token') || '';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            userId: '',
            token: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const resetPasswordMutation = useResetPassword();

    // Set userId and token from URL params
    useEffect(() => {
        if (userId && token) {
            setValue('userId', userId);
            setValue('token', token);
        } else {
            setIsInvalidLink(true);
        }
    }, [userId, token, setValue]);

    const onSubmit = async (data: ResetPasswordInput) => {
        setApiError(null);

        try {
            await resetPasswordMutation.mutateAsync(data);
            // Redirect is handled in mutation onSuccess
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
            setApiError(errorMessage);
        }
    };

    // Invalid link state
    if (isInvalidLink) {
        return (
            <div className="glass-panel w-full rounded-2xl border border-neutral-200 bg-white/50 p-8 shadow-sm backdrop-blur-xl">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Invalid reset link</h3>
                    <p className="text-sm text-neutral-600">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link
                        href="/forgot-password"
                        className="mt-4 text-sm font-medium text-neutral-900 hover:underline"
                    >
                        Request new reset link
                    </Link>
                </div>
            </div>
        );
    }

    // Success state - mutation redirects, but just in case
    if (resetPasswordMutation.isSuccess) {
        return (
            <div className="glass-panel w-full rounded-2xl border border-neutral-200 bg-white/50 p-8 shadow-sm backdrop-blur-xl">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Password reset successful</h3>
                    <p className="text-sm text-neutral-600">
                        Your password has been reset. You can now log in with your new password.
                    </p>
                    <Link
                        href="/login"
                        className="mt-4 text-sm font-medium text-neutral-900 hover:underline"
                    >
                        Go to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel w-full rounded-2xl border border-neutral-200 bg-white/50 p-8 shadow-sm backdrop-blur-xl">
            <div className="mb-6 text-center">
                <h2 className="text-xl font-semibold text-neutral-900">Set new password</h2>
                <p className="mt-2 text-sm text-neutral-600">
                    Your new password must be different from previously used passwords.
                </p>
            </div>

            {apiError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Hidden fields for userId and token */}
                <input type="hidden" {...register('userId')} />
                <input type="hidden" {...register('token')} />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-900">New Password</label>
                    <input
                        {...register('newPassword')}
                        type="password"
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    />
                    {errors.newPassword && (
                        <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-900">Confirm Password</label>
                    <input
                        {...register('confirmPassword')}
                        type="password"
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full rounded-lg bg-neutral-900 py-6 text-sm font-semibold text-white shadow-lg shadow-neutral-900/10 hover:bg-neutral-800 hover:-translate-y-0.5 transition-all"
                    disabled={isSubmitting || resetPasswordMutation.isPending}
                >
                    {isSubmitting || resetPasswordMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                        </>
                    ) : (
                        'Reset password'
                    )}
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-neutral-500">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1 font-medium text-neutral-900 hover:underline"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to login
                </Link>
            </p>
        </div>
    );
};

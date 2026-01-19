'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

import { forgotPasswordSchema, type ForgotPasswordInput } from '../schema/auth.schema';
import { useForgotPassword } from '../api/mutations';

export const ForgotPasswordForm = () => {
    const [apiError, setApiError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const forgotPasswordMutation = useForgotPassword();

    const onSubmit = async (data: ForgotPasswordInput) => {
        setApiError(null);

        try {
            await forgotPasswordMutation.mutateAsync({ email: data.email });
            setSubmittedEmail(data.email);
            setIsSuccess(true);
        } catch (error: unknown) {
            // Note: Backend always returns success message for security
            // But we still handle potential network errors
            const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
            setApiError(errorMessage);
        }
    };

    // Success state
    if (isSuccess) {
        return (
            <div className="glass-panel w-full rounded-2xl border border-neutral-200 bg-white/50 p-8 shadow-sm backdrop-blur-xl">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Check your email</h3>
                    <p className="text-sm text-neutral-600">
                        If an account exists for <span className="font-medium">{submittedEmail}</span>,
                        you will receive a password reset link.
                    </p>
                    <Link
                        href="/login"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel w-full rounded-2xl border border-neutral-200 bg-white/50 p-8 shadow-sm backdrop-blur-xl">
            <div className="mb-6 text-center">
                <h2 className="text-xl font-semibold text-neutral-900">Forgot password?</h2>
                <p className="mt-2 text-sm text-neutral-600">
                    No worries, we&apos;ll send you reset instructions.
                </p>
            </div>

            {apiError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-900">Email</label>
                    <input
                        {...register('email')}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full rounded-lg bg-neutral-900 py-6 text-sm font-semibold text-white shadow-lg shadow-neutral-900/10 hover:bg-neutral-800 hover:-translate-y-0.5 transition-all"
                    disabled={isSubmitting || forgotPasswordMutation.isPending}
                >
                    {isSubmitting || forgotPasswordMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
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

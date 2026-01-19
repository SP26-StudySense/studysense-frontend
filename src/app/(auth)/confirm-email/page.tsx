'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useConfirmEmail } from '@/features/auth/api/mutations';

function ConfirmEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    const userId = searchParams.get('userId') || '';
    const token = searchParams.get('token') || '';
    const returnUrl = searchParams.get('returnUrl') || '/login';

    const confirmEmailMutation = useConfirmEmail();

    useEffect(() => {
        if (!userId || !token) {
            setStatus('error');
            setMessage('Invalid confirmation link. Please check your email for the correct link.');
            return;
        }

        // Call confirm email API
        confirmEmailMutation.mutate(
            { userId, token, returnUrl },
            {
                onSuccess: (data) => {
                    setStatus('success');
                    setMessage(data.message || 'Your email has been confirmed successfully!');
                    // Redirect after 3 seconds
                    setTimeout(() => {
                        router.push(`/login?confirmed=true`);
                    }, 3000);
                },
                onError: (error) => {
                    setStatus('error');
                    setMessage(error instanceof Error ? error.message : 'Failed to confirm email. The link may have expired.');
                },
            }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, token]);

    return (
        <div className="glass-panel w-full rounded-2xl border border-neutral-200 bg-white/50 p-8 shadow-sm backdrop-blur-xl">
            <div className="flex flex-col items-center text-center space-y-4">
                {status === 'loading' && (
                    <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                            <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900">Confirming your email...</h3>
                        <p className="text-sm text-neutral-600">Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900">Email confirmed!</h3>
                        <p className="text-sm text-neutral-600">{message}</p>
                        <p className="text-xs text-neutral-400">Redirecting to login...</p>
                        <Link
                            href="/login"
                            className="mt-4 text-sm font-medium text-neutral-900 hover:underline"
                        >
                            Go to login now
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900">Confirmation failed</h3>
                        <p className="text-sm text-neutral-600">{message}</p>
                        <Link
                            href="/login"
                            className="mt-4 text-sm font-medium text-neutral-900 hover:underline"
                        >
                            Back to login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ConfirmEmailPage() {
    return (
        <AuthLayout subtitle="Email confirmation">
            <ConfirmEmailContent />
        </AuthLayout>
    );
}

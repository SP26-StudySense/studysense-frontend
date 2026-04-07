import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Set a new password for your account',
};

// Loading fallback for suspense
function ResetPasswordLoading() {
    return (
        <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900"></div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <AuthLayout subtitle="Set a new password">
            <Suspense fallback={<ResetPasswordLoading />}>
                <ResetPasswordForm />
            </Suspense>
        </AuthLayout>
    );
}

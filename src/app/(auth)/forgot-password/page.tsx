import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password',
    description: 'Reset your password',
};

export default function ForgotPasswordPage() {
    return (
        <AuthLayout subtitle="Reset your password">
            <ForgotPasswordForm />
        </AuthLayout>
    );
}

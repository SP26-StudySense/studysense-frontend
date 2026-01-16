import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { RegisterForm } from '@/features/auth/components/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <AuthLayout subtitle="Create a new account">
      <RegisterForm />
    </AuthLayout>
  );
}

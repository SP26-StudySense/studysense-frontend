'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Chrome, Loader2, AlertCircle } from 'lucide-react';

import { loginSchema, type LoginInput } from '../schema/auth.schema';
import { useLogin, useGoogleLogin } from '../api/mutations';

export const LoginForm = () => {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUserName: '',
      password: '',
    },
  });

  const loginMutation = useLogin();
  const { loginWithGoogle } = useGoogleLogin();

  const onSubmit = async (data: LoginInput) => {
    setApiError(null);
    try {
      await loginMutation.mutateAsync({
        emailOrUserName: data.emailOrUserName,
        password: data.password,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setApiError(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle('/dashboard');
  };

  return (
    <div className="glass-panel w-full rounded-2xl border border-neutral-200 bg-white/50 p-8 shadow-sm backdrop-blur-xl">
      {apiError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-900">Email or Username</label>
          <input
            {...register('emailOrUserName')}
            type="text"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
          {errors.emailOrUserName && (
            <p className="text-xs text-red-500">{errors.emailOrUserName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-900">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full rounded-lg bg-neutral-900 py-6 text-sm font-semibold text-white shadow-lg shadow-neutral-900/10 hover:bg-neutral-800 hover:-translate-y-0.5 transition-all"
          disabled={isSubmitting || loginMutation.isPending}
        >
          {isSubmitting || loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#fafafa] px-2 text-neutral-400">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white py-5 text-neutral-800 hover:bg-neutral-50 hover:text-neutral-900"
        onClick={handleGoogleLogin}
      >
        <Chrome className="h-4 w-4 text-neutral-700" />
        Continue with Google
      </Button>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-neutral-900 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

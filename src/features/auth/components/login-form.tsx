'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { Chrome, AlertCircle, Eye, EyeOff } from 'lucide-react';

import { loginSchema, type LoginInput } from '../schema/auth.schema';
import { useLogin, useGoogleLogin } from '../api/mutations';

export const LoginForm = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="glass-panel w-full rounded-3xl border border-white/40 bg-white/60 p-8 shadow-xl backdrop-blur-xl">
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
            className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
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
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="brand"
          size="xl"
          className="w-full"
          disabled={isSubmitting || loginMutation.isPending}
        >
          {isSubmitting || loginMutation.isPending ? (
            <>
              <LoadingSpinner size="sm" />
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
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white/50 py-4 text-neutral-800 hover:bg-white hover:text-neutral-900 hover:shadow-md transition-all duration-300"
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

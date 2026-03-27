'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Chrome } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { registerSchema, type RegisterInput } from '../schema/auth.schema';
import { useRegister, useGoogleLogin } from '../api/mutations';
import { useTransitionRouter } from '@/shared/context/TransitionContext';

export const RegisterForm = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useRegister();
  const { loginWithGoogle } = useGoogleLogin();
  const { navigateWithTransition } = useTransitionRouter();

  const onSubmit = async (data: RegisterInput) => {
    setApiError(null);
    setSuccessMessage(null);

    try {
      const response = await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Show success message - user needs to confirm email
      setSuccessMessage(response.message || 'Registration successful! Please check your email to confirm your account.');
      reset();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setApiError(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle('/dashboard');
  };

  // Show success state
  if (successMessage) {
    return (
      <div className="glass-panel w-full rounded-2xl border border-neutral-200 bg-white/50 p-8 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Check your email</h3>
          <p className="text-sm text-neutral-600">{successMessage}</p>
          <button
            type="button"
            onClick={() => navigateWithTransition('/login')}
            className="mt-4 text-sm font-medium text-neutral-900 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel w-full rounded-3xl border border-white/40 bg-white/60 p-8 shadow-xl backdrop-blur-xl">
      {apiError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900">First Name</label>
            <input
              {...register('firstName')}
              placeholder="John"
              className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900">Last Name</label>
            <input
              {...register('lastName')}
              placeholder="Doe"
              className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
            />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-900">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-900">Password</label>
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

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-900">Confirm Password</label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:ring-4 focus:ring-[#00bae2]/10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="brand"
          size="xl"
          className="w-full"
          disabled={isSubmitting || registerMutation.isPending}
        >
          {isSubmitting || registerMutation.isPending ? (
            <>
              <LoadingSpinner size="sm" />
              Creating account...
            </>
          ) : (
            'Create Account'
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
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigateWithTransition('/login')}
          className="font-semibold text-neutral-900 hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

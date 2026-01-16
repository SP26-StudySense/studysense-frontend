'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { routes } from '@/shared/config/routes';
import { queryKeys } from '@/shared/api/query-keys';
import { clearTokens, isAuthenticated } from '@/shared/api/client';
import { useCurrentUser } from '../api/queries';
import { useLogin, useLogout, useRegister } from '../api/mutations';
import type { LoginRequest, RegisterRequest, User } from '../types';

interface UseAuthReturn {
    // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;

    // Helpers
    checkAuth: () => boolean;
}

export function useAuth(): UseAuthReturn {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: user, isLoading } = useCurrentUser();
    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const logoutMutation = useLogout();

    const login = useCallback(
        async (data: LoginRequest) => {
            await loginMutation.mutateAsync(data);
        },
        [loginMutation]
    );

    const register = useCallback(
        async (data: RegisterRequest) => {
            await registerMutation.mutateAsync(data);
        },
        [registerMutation]
    );

    const logout = useCallback(async () => {
        await logoutMutation.mutateAsync();
    }, [logoutMutation]);

    const checkAuth = useCallback(() => {
        return isAuthenticated();
    }, []);

    return {
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
    };
}

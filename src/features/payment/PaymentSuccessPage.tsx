'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ArrowRight, Receipt, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { saveUserToStorage } from '@/features/auth/api/mutations';
import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import { usePaymentStatus } from './hooks/usePaymentStatus';

export function PaymentSuccessPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const orderCode = searchParams.get('orderCode') || searchParams.get('id');
    const { status, isLoading } = usePaymentStatus(orderCode);

    useEffect(() => {
        if (status !== 'success' || !orderCode) return;

        const syncKey = `payment-success-synced-${orderCode}`;
        if (sessionStorage.getItem(syncKey)) return;

        sessionStorage.setItem(syncKey, '1');

        const syncFreshState = async () => {
            try {
                const membershipRaw = await get<unknown>(endpoints.users.membership);
                const membershipObj = (membershipRaw ?? {}) as Record<string, unknown>;
                const latestSubscriptionType = String(
                    membershipObj.subscriptionType ?? membershipObj.SubscriptionType ?? ''
                ) || null;

                const currentUser = queryClient.getQueryData(queryKeys.auth.me()) as
                    | Record<string, unknown>
                    | undefined;

                if (currentUser) {
                    const nextUser = {
                        ...currentUser,
                        subscriptionType: latestSubscriptionType,
                    };

                    queryClient.setQueryData(queryKeys.auth.me(), nextUser);
                    saveUserToStorage(nextUser as Parameters<typeof saveUserToStorage>[0]);
                }
            } catch {
                // Keep UI flow resilient even if membership sync fails.
            }

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['membership'] }),
                queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),
            ]);

            router.refresh();
        };

        void syncFreshState();
    }, [status, orderCode, queryClient, router]);

    if (isLoading || status === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#00bae2] mb-4" />
                <h1 className="text-2xl font-bold text-neutral-900">Verifying your payment...</h1>
                <p className="text-neutral-500 mt-2">Please wait while we confirm your transaction securely with the bank.</p>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-center">
                <h1 className="text-2xl font-bold text-red-600">Payment Unsuccessful</h1>
                <p className="text-neutral-500 mt-2">Your payment was not successful based on our systems.</p>
                <Link href="/" className="mt-6 text-[#00bae2] hover:underline">Return to Home</Link>
            </div>
        );
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-[65vh] pt-[10px] pb-12 text-center animate-in fade-in zoom-in duration-700 relative">
            {/* Decorative background elements local to this page */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-20" />
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-[#00bae2] animate-bounce opacity-20 delay-300" />
            <div className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-purple-400 animate-pulse opacity-20 delay-700" />

            {/* Success Icon Section */}
            <div className="relative mb-8 group">
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-2xl animate-pulse group-hover:bg-emerald-500/40 transition-colors" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-50 to-white border-[6px] border-white shadow-xl transform transition-transform group-hover:scale-110 duration-500">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    {/* Animated ring */}
                    <div className="absolute inset-[-6px] rounded-full border-2 border-emerald-500/20 animate-[ping_3s_ease-in-out_infinite]" />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl px-4">
                <h1 className="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">
                    Payment Successful!
                </h1>
                <p className="mx-auto mb-8 max-w-md text-neutral-500">
                    Thank you for joining StudySense Premium. Your account has been upgraded and you're ready to master your learning journey.
                </p>
            </div>

            {/* Transaction Card - Glassmorphism style */}
            <div className="w-full max-w-sm mb-10 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md p-6 text-left shadow-2xl shadow-emerald-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Receipt className="h-16 w-16 rotate-12" />
                </div>
                
                <div className="flex items-center gap-3 text-neutral-900 font-bold mb-4">
                    <div className="p-2 rounded-lg bg-[#00bae2]/10">
                        <Receipt className="h-5 w-5 text-[#00bae2]" />
                    </div>
                    Order Details
                </div>
                
                <div className="space-y-3 relative z-10 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-500 font-medium">Plan</span>
                        <span className="font-bold text-neutral-900">Premium Membership</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent my-1" />
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-500 font-medium">Status</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/50 uppercase">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            Paid
                        </span>
                    </div>
                    {orderCode && (
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Transaction ID</span>
                            <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100/50 px-1.5 py-0.5 rounded">#{orderCode}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <Link
                    href="/membership"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00bae2] to-[#0097c7] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00bae2]/25 transition-all hover:shadow-[#00bae2]/40 hover:scale-105 active:scale-95"
                >
                    View My Membership
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 hover:shadow-md hover:border-neutral-300"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

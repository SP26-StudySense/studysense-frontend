'use client';

import { useEffect } from 'react';
import { XCircle, RefreshCcw, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePaymentStatus } from './hooks/usePaymentStatus';
import { post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

export function PaymentFailedPage() {
    const searchParams = useSearchParams();
    const orderCode = searchParams.get('orderCode') || searchParams.get('id');
    const isCanceled = searchParams.get('cancel') === 'true' || searchParams.get('status') === 'CANCELLED';
    const { status, isLoading } = usePaymentStatus(isCanceled ? null : orderCode); // Don't poll if we already know it's canceled

    useEffect(() => {
        if (isCanceled && orderCode) {
            // Silently cancel the payment locally in background
            post(endpoints.payments.cancelPayment(orderCode)).catch(e => {
                console.error("Failed to cancel payment explicitely:", e);
            });
        }
    }, [isCanceled, orderCode]);

    // If it's explicitly canceled, we skip the loader and just show the failed/cancel UI immediately.
    if (!isCanceled && (isLoading || status === 'pending')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#00bae2] mb-4" />
                <h1 className="text-2xl font-bold text-neutral-900">Confirming status...</h1>
                <p className="text-neutral-500 mt-2">Please wait while we verify your transaction status.</p>
            </div>
        );
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] py-12 text-center animate-in fade-in zoom-in duration-700 relative">
            {/* Decorative background elements */}
            <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-red-400 animate-pulse opacity-10" />
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-neutral-400 animate-bounce opacity-10 delay-500" />

            {/* Error Icon Section */}
            <div className="relative mb-8 group">
                <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl animate-pulse group-hover:bg-red-500/30 transition-colors" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white border-[6px] border-red-50 shadow-xl transform transition-transform group-hover:scale-110 duration-500">
                    <XCircle className="h-12 w-12 text-red-500" />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl px-4">
                <h1 className="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">
                    {isCanceled ? 'Payment Canceled' : 'Payment Failed'}
                </h1>
                <p className="mx-auto mb-8 max-w-md text-neutral-500">
                    {isCanceled 
                        ? 'You have canceled the checkout process. No charges have been made.' 
                        : 'Unfortunately, your transaction cannot be completed at this time. Please check your payment method again or try again later.'}
                </p>
            </div>

            {/* Error Details Card */}
            <div className="w-full max-w-sm mb-10 rounded-2xl border border-red-100 bg-red-50/30 backdrop-blur-sm p-6 text-left shadow-sm relative overflow-hidden">
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-600 font-medium">Issue</span>
                        <span className="font-bold text-red-700 bg-red-100/50 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                            {isCanceled ? 'Canceled' : 'Declined'}
                        </span>
                    </div>
                    <div className="h-px bg-red-100/50 my-1" />
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-600 font-medium">Attempted Plan</span>
                        <span className="font-bold text-neutral-900">Premium Membership</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/upgrade-plan"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-neutral-800 hover:scale-105 active:scale-95"
                >
                    <RefreshCcw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                    Try Again
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 hover:shadow-md"
                >
                    <Home className="h-4 w-4 text-neutral-400" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

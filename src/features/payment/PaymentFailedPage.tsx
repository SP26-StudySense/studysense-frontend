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
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-center animate-in fade-in zoom-in duration-500">
            {/* Error Icon */}
            <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-100 border-4 border-white shadow-sm">
                    <XCircle className="h-12 w-12 text-red-600" />
                </div>
            </div>

            {/* Content */}
            <h1 className="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">
                {isCanceled ? 'Payment Canceled' : 'Payment Failed'}
            </h1>
            <p className="mx-auto mb-8 max-w-md text-neutral-500">
                {isCanceled 
                    ? 'You have canceled the checkout process. No charges have been made.' 
                    : 'Unfortunately, your transaction cannot be completed at this time. Please check your payment method again or try again later.'}
            </p>

            {/* Error Details Card */}
            <div className="w-full max-w-sm mb-10 rounded-2xl border border-red-100 bg-red-50/50 p-6 text-left shadow-sm">
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-neutral-600">Issue</span>
                        <span className="font-medium text-neutral-900">{isCanceled ? 'Canceled by User' : 'Transaction declined'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-600">Plan</span>
                        <span className="font-medium text-neutral-900">Premium Membership</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/upgrade-plan"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-neutral-800 hover:-translate-y-0.5"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-8 py-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 hover:shadow-sm"
                >
                    <Home className="h-4 w-4 text-neutral-500" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

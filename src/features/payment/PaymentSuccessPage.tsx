'use client';

import { CheckCircle2, ArrowRight, Receipt } from 'lucide-react';
import Link from 'next/link';

export function PaymentSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-center animate-in fade-in zoom-in duration-500">
            {/* Success Icon */}
            <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 border-4 border-white shadow-sm">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </div>
            </div>

            {/* Content */}
            <h1 className="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">
                Payment Successful!
            </h1>
            <p className="mx-auto mb-8 max-w-md text-neutral-500">
                Thank you for upgrading to StudySense Premium. Your smarter learning journey starts here.
            </p>

            {/* Transaction Card */}
            <div className="w-full max-w-sm mb-10 rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-sm">
                <div className="flex items-center gap-3 text-neutral-900 font-semibold mb-4 border-b border-neutral-100 pb-4">
                    <Receipt className="h-5 w-5 text-[#00bae2]" />
                    Order Details
                </div>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-neutral-500">Plan</span>
                        <span className="font-medium text-neutral-900">Premium Membership</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-500">Status</span>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            Paid
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/membership"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00bae2] to-[#0097c7] px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-[#00bae2]/30 hover:shadow-xl hover:-translate-y-0.5"
                >
                    View My Membership
                    <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-8 py-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 hover:shadow-sm"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

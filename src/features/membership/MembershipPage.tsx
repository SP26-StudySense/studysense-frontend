'use client';

import {
    Crown, Shield, Calendar, CreditCard, Clock, CheckCircle2,
    XCircle, ArrowUpRight, Zap, AlertCircle, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCurrentUser } from '@/features/auth/api/queries';
import { useUserMembership, useUserPayments } from './api/queries';
import type { UserPayment } from './api/types';

type PaymentStatusKey = 'success' | 'failed' | 'pending' | 'canceled';

const statusConfig = {
    success: {
        label: 'Paid',
        icon: CheckCircle2,
        className: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    failed: {
        label: 'Failed',
        icon: XCircle,
        className: 'text-red-600 bg-red-50 border-red-100',
    },
    pending: {
        label: 'Pending',
        icon: Clock,
        className: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    canceled: {
        label: 'Canceled',
        icon: XCircle,
        className: 'text-neutral-600 bg-neutral-100 border-neutral-200',
    },
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function getDaysRemainingLabel(days: number) {
    if (days > 60) return 'text-emerald-600';
    if (days > 14) return 'text-amber-600';
    return 'text-red-600';
}

function normalizeSubscriptionType(value: unknown): 'free' | 'premium' | 'pro' {
    if (typeof value === 'number') {
        if (value === 2) return 'premium';
        if (value === 3) return 'pro';
        return 'free';
    }

    const normalized = String(value ?? '').toLowerCase();
    if (normalized.includes('premium')) return 'premium';
    if (normalized.includes('pro')) return 'pro';
    return 'free';
}

function normalizePaymentStatus(value: unknown): PaymentStatusKey {
    if (typeof value === 'number') {
        if (value === 1) return 'success';
        if (value === 2) return 'failed';
        if (value === 3) return 'canceled';
        return 'pending';
    }

    const normalized = String(value ?? '').toLowerCase();
    if (normalized.includes('success')) return 'success';
    if (normalized.includes('fail')) return 'failed';
    if (normalized.includes('cancel')) return 'canceled';
    return 'pending';
}

function formatVnd(amount: number, currency?: string) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency || 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

function addMonths(date: Date, months: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

export function MembershipPage() {
    const { data: user, isLoading: isUserLoading } = useCurrentUser();
    const { data: membership, isLoading: isMembershipLoading } = useUserMembership(!!user);
    const { data: paymentsResponse, isLoading: isPaymentsLoading } = useUserPayments(!!user);

    const payments = paymentsResponse?.payments ?? [];

    const successfulPayments = useMemo(
        () => payments.filter((p) => normalizePaymentStatus(p.status) === 'success'),
        [payments]
    );

    const latestSuccessfulPayment = successfulPayments[0];

    const userSubType = normalizeSubscriptionType(membership?.subscriptionType);
    const userSubStartDateRaw = membership?.subscriptionStartDate ?? undefined;
    const userSubEndDateRaw = membership?.subscriptionEndDate ?? undefined;

    const inferredSubscriptionType =
        userSubType !== 'free'
            ? userSubType
            : latestSuccessfulPayment
                ? normalizeSubscriptionType(latestSuccessfulPayment.subscriptionType)
                : 'free';

    const startDate = userSubStartDateRaw
        ? new Date(userSubStartDateRaw)
        : latestSuccessfulPayment
            ? new Date(latestSuccessfulPayment.paymentDate)
            : null;

    const endDate = userSubEndDateRaw
        ? new Date(userSubEndDateRaw)
        : latestSuccessfulPayment
            ? addMonths(new Date(latestSuccessfulPayment.paymentDate), latestSuccessfulPayment.subscriptionDuration || 1)
            : null;

    const now = new Date();
    const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
    const isPremium = inferredSubscriptionType !== 'free' && (!!endDate ? endDate > now : true);

    const totalSubscriptionDays =
        startDate && endDate
            ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
            : Math.max(1, (latestSuccessfulPayment?.subscriptionDuration || 1) * 30);

    const remainingPercentage = Math.max(
        0,
        Math.min(100, Math.round((daysRemaining / totalSubscriptionDays) * 100))
    );

    const planLabel = inferredSubscriptionType === 'premium' ? 'Premium' : inferredSubscriptionType === 'pro' ? 'Pro' : 'Free';
    const displayPrice = latestSuccessfulPayment ? formatVnd(latestSuccessfulPayment.amount, latestSuccessfulPayment.currency) : '0 ₫';
    const durationMonths = latestSuccessfulPayment?.subscriptionDuration || 1;

    const transactions = useMemo(
        () =>
            payments.map((payment: UserPayment) => {
                const status = normalizePaymentStatus(payment.status);
                const planName = normalizeSubscriptionType(payment.subscriptionType);
                const planText = planName === 'premium' ? 'Premium' : planName === 'pro' ? 'Pro' : 'Free';

                return {
                    id: `TXN-${payment.paymentId}`,
                    date: payment.paymentDate,
                    description: `${planText} Plan - ${payment.subscriptionDuration} month${payment.subscriptionDuration > 1 ? 's' : ''}`,
                    amount: formatVnd(payment.amount, payment.currency),
                    status,
                    method: payment.currency || 'VND',
                };
            }),
        [payments]
    );

    if (isUserLoading || isMembershipLoading || isPaymentsLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <LoadingSpinner size="lg" showText text="Loading membership..." />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16">
            {/* Page Header */}
            <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Link href="/" className="hover:text-neutral-700 transition-colors">Home</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-neutral-900 font-medium">Membership</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">My Membership</h1>
                <p className="text-neutral-500">Manage your subscription and view billing history</p>
            </div>

            {/* Current Plan Card */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-[#00bae2]/30 bg-white shadow-lg">
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00bae2]/5 via-white to-[#fec5fb]/5 pointer-events-none" />
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-[#fec5fb]/20 to-[#00bae2]/10 blur-3xl pointer-events-none" />

                <div className="relative p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        {/* Plan Info */}
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00bae2] to-[#0097c7] shadow-lg shadow-[#00bae2]/25">
                                <Crown className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-neutral-900">{planLabel}</h2>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#00bae2]/10 to-[#fec5fb]/10 border border-[#00bae2]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#00bae2]">
                                        <Shield className="h-2.5 w-2.5" />
                                        {isPremium ? 'Active' : 'Free'}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-sm text-neutral-500">
                                    Billed at {displayPrice} · Expires on{' '}
                                    <span className="font-medium text-neutral-700">{endDate ? formatDate(endDate.toISOString()) : 'N/A'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Link
                                href="/upgrade-plan"
                                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:shadow-sm"
                            >
                                <Zap className="h-4 w-4 text-[#00bae2]" />
                                Manage Plan
                            </Link>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Start Date
                            </div>
                            <p className="font-semibold text-neutral-900">{startDate ? formatDate(startDate.toISOString()) : 'N/A'}</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                                <Clock className="h-3.5 w-3.5" />
                                Expires
                            </div>
                            <p className="font-semibold text-neutral-900">{endDate ? formatDate(endDate.toISOString()) : 'N/A'}</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Days Remaining
                            </div>
                            <p className={`font-bold text-lg ${getDaysRemainingLabel(daysRemaining)}`}>
                                {daysRemaining} days
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                            <span>Subscription progress</span>
                            <span>{remainingPercentage}% remaining</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#00bae2] to-[#fec5fb] transition-all"
                                style={{ width: `${remainingPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Free plan upgrade nudge (only shown for free users) */}
            {!isPremium && (
                <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                            <Crown className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900">You're on the Free Plan</h3>
                            <p className="mt-1 text-sm text-amber-700">
                                Upgrade to Premium to unlock unlimited study plans, AI-powered roadmaps, and more.
                            </p>
                        </div>
                        <Link
                            href="/upgrade-plan"
                            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-700"
                        >
                            Upgrade
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900">Transaction History</h2>
                        <p className="mt-0.5 text-sm text-neutral-500">Your past billing records</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <CreditCard className="h-4 w-4" />
                        <span>{transactions.length} transactions</span>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    {/* Header */}
                    <div className="hidden grid-cols-[2fr_1.5fr_1fr_1fr] border-b border-neutral-100 bg-neutral-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 sm:grid">
                        <span>Transaction</span>
                        <span>Date & Method</span>
                        <span className="text-center">Status</span>
                        <span className="text-right">Amount</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-neutral-50">
                        {transactions.map((txn) => {
                            const config = statusConfig[txn.status];
                            const Icon = config.icon;
                            return (
                                <div
                                    key={txn.id}
                                    className="grid grid-cols-1 gap-2 px-6 py-4 transition-colors hover:bg-neutral-50/60 sm:grid-cols-[2fr_1.5fr_1fr_1fr] sm:items-center"
                                >
                                    {/* Description */}
                                    <div>
                                        <p className="font-medium text-neutral-900 text-sm">{txn.description}</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">{txn.id}</p>
                                    </div>

                                    {/* Date & Method */}
                                    <div>
                                        <p className="text-sm text-neutral-700">{formatDate(txn.date)}</p>
                                        <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                                            <CreditCard className="h-3 w-3" />
                                            {txn.method}
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div className="sm:text-center">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}>
                                            <Icon className="h-3 w-3" />
                                            {config.label}
                                        </span>
                                    </div>

                                    {/* Amount */}
                                    <div className="sm:text-right">
                                        <span className="font-semibold text-neutral-900">{txn.amount}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Empty state (hidden when there are transactions) */}
                {transactions.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/40 py-16 text-center">
                        <CreditCard className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
                        <p className="font-medium text-neutral-500">No transactions yet</p>
                        <p className="mt-1 text-sm text-neutral-400">
                            {isPremium
                                ? 'We could not find any payment records for this account yet.'
                                : 'Your billing history will appear here once you make a payment.'}
                        </p>
                        {!isPremium && (
                            <Link
                                href="/upgrade-plan"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                            >
                                <Crown className="h-4 w-4" />
                                Upgrade to Premium
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Cancel / Manage */}
            {isPremium && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 className="font-semibold text-neutral-900">Subscription Settings</h3>
                    <p className="mt-1 text-sm text-neutral-500">
                        {/* Manage auto-renewal or cancel your subscription at any time. */}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        {/* <button className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:shadow-sm">
                            <Shield className="h-4 w-4 text-neutral-500" />
                            Enable Auto-Renew
                        </button> */}
                        <button className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100">
                            <XCircle className="h-4 w-4" />
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

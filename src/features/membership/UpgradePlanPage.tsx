'use client';

import { useState } from 'react';
import { Check, Zap, Crown, ArrowRight, Star, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

const freePlanFeatures = [
    'Access to all public roadmaps',
    'Basic progress tracking',
    'Up to 3 active study plans',
    'Community forum access',
    'Basic AI suggestions',
    'Email support',
];

const premiumPlanFeatures = [
    'Everything in Free',
    'Unlimited study plans',
    'Advanced AI-powered roadmaps',
    'Personalized learning paths',
    'Priority AI chat assistant',
    'Detailed analytics & insights',
    'Offline access',
    'Priority support',
    'Early access to new features',
    'Custom study schedule builder',
];

const faqs = [
    {
        q: 'Can I switch from Free to Premium anytime?',
        a: 'Yes! You can upgrade to Premium at any time. Your progress and data are always preserved.',
    },
    {
        q: 'What happens when my Premium plan expires?',
        a: "Your account reverts to Free. You'll keep all your progress and data, but Premium features become inaccessible.",
    },
    {
        q: 'Is there a student discount?',
        a: 'Yes, we offer a 30% discount for verified students. Contact our support team with your student ID.',
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Absolutely. Cancel your Premium subscription anytime from your Membership page. No hidden fees.',
    },
];

type BillingCycle = 'monthly' | 'sixmonths';

const pricingConfig: Record<BillingCycle, { label: string; price: string; perMonth: string; note: string; savings?: string }> = {
    monthly: {
        label: '1 Month',
        price: '9.999',
        perMonth: '9.999 ₫/month',
        note: 'Billed monthly. Cancel anytime.',
    },
    sixmonths: {
        label: '6 Months',
        price: '49.999',
        perMonth: '~8.333 ₫/month',
        note: 'Billed once every 6 months.',
        savings: 'Save 10.000 ₫',
    },
};

export function UpgradePlanPage() {
    const [billing, setBilling] = useState<BillingCycle>('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const currentPricing = pricingConfig[billing];

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const data = await post<{ checkoutUrl: string }>(endpoints.payments.createPayment, {
                subscriptionType: 2, // Premium
                subscriptionDuration: billing === 'sixmonths' ? 6 : 1,
                returnUrl: window.location.origin + '/payment/success',
                cancelUrl: window.location.origin + '/payment/fail'
            });
            
            if (data?.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error) {
            console.error('Failed to create payment link:', error);
            alert('Something went wrong initiating the payment. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-20 pb-16">
            {/* Hero */}
            <section className="text-center space-y-5 pt-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    Unlock Your Full Potential
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-neutral-900 lg:text-6xl">
                    Simple, Transparent{' '}
                    <span className="bg-gradient-to-r from-[#00bae2] to-[#fec5fb] bg-clip-text text-transparent">
                        Pricing
                    </span>
                </h1>
                <p className="mx-auto max-w-xl text-lg text-neutral-500">
                    Start free and upgrade when you're ready. No hidden costs, no surprises.
                </p>
            </section>

            {/* Billing Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex items-center rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm gap-1">
                    {(['monthly', 'sixmonths'] as BillingCycle[]).map((cycle) => (
                        <button
                            key={cycle}
                            onClick={() => setBilling(cycle)}
                            className={`relative inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                                billing === cycle
                                    ? 'bg-neutral-900 text-white shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        >
                            {pricingConfig[cycle].label}
                            {cycle === 'sixmonths' && (
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    billing === cycle
                                        ? 'bg-[#00bae2] text-white'
                                        : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                    Save
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pricing Cards */}
            <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-4xl mx-auto w-full">
                {/* Free Plan */}
                <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-6">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                            <Zap className="h-6 w-6 text-neutral-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900">Free</h2>
                        <p className="mt-1 text-sm text-neutral-500">Great for getting started</p>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-end gap-1">
                            <span className="text-5xl font-bold text-neutral-900">0</span>
                            <span className="mb-1.5 text-neutral-500">₫</span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-400">Forever free. No credit card required.</p>
                    </div>

                    <ul className="mb-8 flex-1 space-y-3">
                        {freePlanFeatures.map((feature) => (
                            <li key={feature} className="flex items-center gap-3 text-sm text-neutral-600">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100">
                                    <Check className="h-3 w-3 text-neutral-600" />
                                </span>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <Link
                        href="/roadmaps"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50"
                    >
                        Get Started Free
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Premium Plan */}
                <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-[#00bae2] bg-white p-8 shadow-lg">
                    {/* Popular badge */}
                    <div className="absolute right-6 top-6">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#00bae2] to-[#fec5fb] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                            <Star className="h-3 w-3" />
                            Most Popular
                        </span>
                    </div>

                    {/* Background glow */}
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-[#fec5fb]/20 to-[#00bae2]/10 blur-3xl pointer-events-none" />

                    <div className="relative mb-6">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00bae2] to-[#fec5fb]">
                            <Crown className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900">Premium</h2>
                        <p className="mt-1 text-sm text-neutral-500">For serious learners</p>
                    </div>

                    <div className="relative mb-6">
                        {/* Savings badge for 6-month */}
                        {currentPricing.savings && (
                            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <Sparkles className="h-3 w-3" />
                                {currentPricing.savings}
                            </div>
                        )}
                        <div className="flex items-end gap-1">
                            <span className="text-5xl font-bold text-neutral-900">{currentPricing.price}</span>
                            <span className="mb-1.5 text-neutral-500">₫</span>
                            <span className="mb-1.5 text-neutral-400 text-sm">
                                / {billing === 'monthly' ? 'month' : '6 months'}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-400">{currentPricing.perMonth} · {currentPricing.note}</p>
                    </div>

                    <ul className="relative mb-8 flex-1 space-y-3">
                        {premiumPlanFeatures.map((feature, i) => (
                            <li key={feature} className="flex items-center gap-3 text-sm text-neutral-600">
                                <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${i === 0 ? 'bg-neutral-100' : 'bg-gradient-to-br from-[#00bae2]/20 to-[#fec5fb]/20'}`}>
                                    <Check className={`h-3 w-3 ${i === 0 ? 'text-neutral-600' : 'text-[#00bae2]'}`} />
                                </span>
                                <span className={i === 0 ? 'text-neutral-400' : ''}>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button 
                        onClick={handleUpgrade}
                        disabled={isLoading}
                        className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#00bae2] to-[#0097c7] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00bae2]/25 transition-all hover:shadow-xl hover:shadow-[#00bae2]/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:hover:translate-y-0"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
                        {isLoading ? 'Processing...' : 'Upgrade to Premium'}
                        {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </button>
                </div>
            </section>

            {/* Feature Comparison Table */}
            <section className="max-w-4xl mx-auto w-full space-y-6">
                <h2 className="text-center text-2xl font-bold text-neutral-900">Full Feature Comparison</h2>
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                <th className="px-6 py-4 text-left font-semibold text-neutral-700">Feature</th>
                                <th className="px-6 py-4 text-center font-semibold text-neutral-700">Free</th>
                                <th className="px-6 py-4 text-center font-semibold text-[#00bae2]">
                                    <span className="flex items-center justify-center gap-1">
                                        <Crown className="h-3.5 w-3.5" />
                                        Premium
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {[
                                { feature: 'Public roadmap access', free: true, premium: true },
                                { feature: 'Progress tracking', free: true, premium: true },
                                { feature: 'Community forum', free: true, premium: true },
                                { feature: 'Active study plans', free: 'Up to 3', premium: 'Unlimited' },
                                { feature: 'AI suggestions', free: 'Basic', premium: 'Advanced' },
                                { feature: 'Personalized learning path', free: false, premium: true },
                                { feature: 'AI chat assistant', free: false, premium: true },
                                { feature: 'Analytics & insights', free: false, premium: true },
                                { feature: 'Offline access', free: false, premium: true },
                                { feature: 'Support', free: 'Email', premium: 'Priority' },
                            ].map((row) => (
                                <tr key={row.feature} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-6 py-3.5 text-neutral-700">{row.feature}</td>
                                    <td className="px-6 py-3.5 text-center">
                                        {typeof row.free === 'boolean' ? (
                                            row.free ? (
                                                <span className="inline-flex justify-center"><Check className="h-4 w-4 text-emerald-500" /></span>
                                            ) : (
                                                <span className="text-neutral-300">—</span>
                                            )
                                        ) : (
                                            <span className="text-neutral-600 font-medium">{row.free}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        {typeof row.premium === 'boolean' ? (
                                            row.premium ? (
                                                <span className="inline-flex justify-center"><Check className="h-4 w-4 text-[#00bae2]" /></span>
                                            ) : (
                                                <span className="text-neutral-300">—</span>
                                            )
                                        ) : (
                                            <span className="text-[#00bae2] font-semibold">{row.premium}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto w-full space-y-6">
                <h2 className="text-center text-2xl font-bold text-neutral-900">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <div
                            key={faq.q}
                            className="rounded-2xl border border-neutral-200/60 bg-white/60 p-6 backdrop-blur-sm shadow-sm transition-all hover:shadow-md"
                        >
                            <h3 className="font-semibold text-neutral-900">{faq.q}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-neutral-500">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="relative max-w-3xl mx-auto w-full overflow-hidden rounded-3xl p-10 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl" />
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 30% 50%, #00bae2 0%, transparent 50%), radial-gradient(circle at 70% 50%, #fec5fb 0%, transparent 50%)`,
                    }}
                />
                <div className="relative z-10 space-y-4">
                    <Crown className="mx-auto h-10 w-10 text-[#00bae2]" />
                    <h2 className="text-2xl font-bold text-white">Ready to go Premium?</h2>
                    <p className="text-neutral-400 text-sm max-w-md mx-auto">
                        Join thousands of learners who've already unlocked a smarter way to learn.
                    </p>
                    <button 
                        onClick={handleUpgrade}
                        disabled={isLoading}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00bae2] to-[#0097c7] px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-[#00bae2]/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-75 disabled:hover:translate-y-0"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {isLoading ? 'Processing...' : `Upgrade Now — ${currentPricing.price} ₫ / ${billing === 'monthly' ? 'month' : '6 months'}`}
                    </button>
                </div>
            </section>
        </div>
    );
}

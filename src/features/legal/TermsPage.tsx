'use client';

import Link from 'next/link';
import { FileText, Users, CreditCard, AlertTriangle, Scale, Mail } from 'lucide-react';

const sections = [
    {
        icon: <FileText className="w-5 h-5" />,
        title: '1. Acceptance of Terms',
        content: `By creating an account or accessing StudySense in any way, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform. We reserve the right to modify these terms at any time; continued use after changes are posted constitutes acceptance.`,
    },
    {
        icon: <Users className="w-5 h-5" />,
        title: '2. User Accounts',
        content: `You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use of your account. StudySense is not liable for losses caused by unauthorised account access.`,
    },
    {
        icon: <FileText className="w-5 h-5" />,
        title: '3. Acceptable Use',
        content: `You agree not to misuse our services. Prohibited activities include: attempting to gain unauthorised access to any part of the platform, distributing malware or harmful code, scraping content without permission, impersonating other users, or using the service for any unlawful purpose. Violation of these rules may result in account suspension or termination.`,
    },
    {
        icon: <CreditCard className="w-5 h-5" />,
        title: '4. Subscriptions & Payments',
        content: `Some features of StudySense require a paid subscription. Subscription fees are billed in advance on a recurring basis. You may cancel at any time; your access will continue until the end of the current billing period. All fees are non-refundable unless required by law. We reserve the right to change pricing with 30 days' notice.`,
    },
    {
        icon: <AlertTriangle className="w-5 h-5" />,
        title: '5. Disclaimer of Warranties',
        content: `StudySense is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or that any content is accurate or complete. Use of the platform is at your own risk. We make no representations about the suitability of our AI-generated study plans for your specific needs.`,
    },
    {
        icon: <Scale className="w-5 h-5" />,
        title: '6. Limitation of Liability',
        content: `To the maximum extent permitted by law, StudySense shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability for any claims related to these terms shall not exceed the amount you paid to us in the twelve months preceding the claim.`,
    },
    {
        icon: <Mail className="w-5 h-5" />,
        title: '7. Contact',
        content: `If you have questions or concerns about these Terms of Service, please contact us at studysense.it@gmail.com. We aim to respond to all enquiries within 30 days.`,
    },
];

export const TermsPage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="relative pt-24 pb-16 text-center overflow-hidden">
                <div
                    className="absolute inset-0 -z-10"
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 60% at 50% 0%, hsla(215,80%,60%,0.12) 0%, transparent 70%)',
                    }}
                />
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 mb-6">
                    <FileText className="w-3.5 h-3.5" />
                    Legal
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                    Terms of Service
                </h1>
                <p className="text-gray-500 text-base max-w-xl mx-auto">
                    Last updated:{' '}
                    <span className="font-medium text-gray-700">
                        April 17, 2026
                    </span>
                </p>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto mt-4">
                    Please read these terms carefully before using StudySense.
                    They govern your use of our platform and services.
                </p>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 pb-24">
                <div className="space-y-8">
                    {sections.map((section, idx) => (
                        <div
                            key={idx}
                            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-600">
                                    {section.icon}
                                </div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    {section.title}
                                </h2>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <div className="mt-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 text-center">
                    <p className="text-sm text-gray-600">
                        By using StudySense, you also agree to our{' '}
                        <Link
                            href="/privacy-policy"
                            className="font-medium text-blue-700 hover:underline"
                        >
                            Privacy Policy
                        </Link>
                        . These terms are effective as of the date you first access
                        or use our services.
                    </p>
                </div>
            </div>
        </div>
    );
};

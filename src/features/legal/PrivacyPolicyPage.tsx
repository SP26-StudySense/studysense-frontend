'use client';

import Link from 'next/link';
import { Shield, Eye, Lock, Database, Mail, RefreshCw } from 'lucide-react';

const sections = [
    {
        icon: <Eye className="w-5 h-5" />,
        title: '1. Information We Collect',
        content: `We collect information you provide directly when you create an account, including your name, email address, and password. We also collect information about how you use our platform, such as the study plans you create, quizzes you take, and features you interact with. Additionally, we automatically collect certain technical data including IP addresses, browser type, device information, and cookies when you access our services.`,
    },
    {
        icon: <Database className="w-5 h-5" />,
        title: '2. How We Use Your Information',
        content: `We use your information to provide, personalise, and improve our educational services. This includes generating tailored study plans, tracking your learning progress, sending important account notifications, and analysing usage patterns to enhance platform performance. We do not sell your personal data to third parties.`,
    },
    {
        icon: <Lock className="w-5 h-5" />,
        title: '3. Data Security',
        content: `We implement industry-standard security measures including encryption in transit (TLS/HTTPS), hashed password storage, and regular security audits to protect your personal information. While we strive to secure your data, no method of internet transmission is 100% secure, and we cannot guarantee absolute security.`,
    },
    {
        icon: <RefreshCw className="w-5 h-5" />,
        title: '4. Data Retention',
        content: `We retain your personal data for as long as your account is active or as needed to provide our services. You may request deletion of your account and associated data at any time. Certain data may be retained for a limited period thereafter to comply with legal obligations.`,
    },
    {
        icon: <Shield className="w-5 h-5" />,
        title: '5. Your Rights',
        content: `Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the processing of your personal data. You may also have the right to data portability and to withdraw consent at any time. To exercise these rights, please contact us using the details below.`,
    },
    {
        icon: <Mail className="w-5 h-5" />,
        title: '6. Contact Us',
        content: `If you have any questions about this Privacy Policy or our data practices, please contact us at studysense.it@gmail.com. We will respond to your enquiry within 30 days.`,
    },
];

export const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="relative pt-24 pb-16 text-center overflow-hidden">
                <div
                    className="absolute inset-0 -z-10"
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 60% at 50% 0%, hsla(265,80%,60%,0.12) 0%, transparent 70%)',
                    }}
                />
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-medium text-purple-700 mb-6">
                    <Shield className="w-3.5 h-3.5" />
                    Legal
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                    Privacy Policy
                </h1>
                <p className="text-gray-500 text-base max-w-xl mx-auto">
                    Last updated:{' '}
                    <span className="font-medium text-gray-700">
                        April 17, 2026
                    </span>
                </p>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto mt-4">
                    We are committed to protecting your privacy. This policy
                    explains how StudySense collects, uses, and safeguards your
                    personal information.
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
                                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-50 text-purple-600">
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
                <div className="mt-12 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 p-6 text-center">
                    <p className="text-sm text-gray-600">
                        By using StudySense, you agree to our{' '}
                        <Link
                            href="/terms"
                            className="font-medium text-purple-700 hover:underline"
                        >
                            Terms of Service
                        </Link>{' '}
                        and this Privacy Policy. We may update this policy
                        periodically; continued use constitutes acceptance of
                        changes.
                    </p>
                </div>
            </div>
        </div>
    );
};

import { PrivacyPolicyPage } from '@/features/legal/PrivacyPolicyPage';
import { PublicLayout } from '@/components/layout/PublicLayout';

export const metadata = {
    title: 'Privacy Policy — StudySense',
    description:
        'Read the StudySense Privacy Policy to understand how we collect, use, and protect your personal data.',
};

export default function PrivacyPolicy() {
    return (
        <PublicLayout>
            <PrivacyPolicyPage />
        </PublicLayout>
    );
}

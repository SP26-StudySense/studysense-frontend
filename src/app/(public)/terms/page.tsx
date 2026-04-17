import { TermsPage } from '@/features/legal/TermsPage';
import { PublicLayout } from '@/components/layout/PublicLayout';

export const metadata = {
    title: 'Terms of Service — StudySense',
    description:
        'Review the StudySense Terms of Service to understand your rights and obligations when using our platform.',
};

export default function Terms() {
    return (
        <PublicLayout>
            <TermsPage />
        </PublicLayout>
    );
}

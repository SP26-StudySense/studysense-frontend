import { MembershipPage } from '@/features/membership/MembershipPage';
import { PublicLayout } from '@/components/layout/PublicLayout';

export const metadata = {
    title: 'My Membership — StudySense',
    description: 'View your current StudySense subscription plan, expiry date, and billing history.',
};

export default function Membership() {
    return (
        <PublicLayout>
            <div className="container mx-auto px-6 max-w-6xl">
                <MembershipPage />
            </div>
        </PublicLayout>
    );
}

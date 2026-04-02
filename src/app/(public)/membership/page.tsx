import { MembershipPage } from '@/features/membership/MembershipPage';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthGuard } from '@/features/auth/components/auth-guard';

export const metadata = {
    title: 'My Membership — StudySense',
    description: 'View your current StudySense subscription plan, expiry date, and billing history.',
};

export default function Membership() {
    return (
        <AuthGuard>
            <PublicLayout>
                <div className="container mx-auto px-6 max-w-6xl">
                    <MembershipPage />
                </div>
            </PublicLayout>
        </AuthGuard>
    );
}

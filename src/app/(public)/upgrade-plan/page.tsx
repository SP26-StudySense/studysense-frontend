import { UpgradePlanPage } from '@/features/membership/UpgradePlanPage';
import { PublicLayout } from '@/components/layout/PublicLayout';

export const metadata = {
    title: 'Upgrade Plan — StudySense',
    description: 'Choose the right StudySense plan for your learning goals. Start free or unlock Premium features.',
};

export default function UpgradePlan() {
    return (
        <PublicLayout>
            <div className="container mx-auto px-6 max-w-6xl">
                <UpgradePlanPage />
            </div>
        </PublicLayout>
    );
}

import { LandingPage } from '@/features/landing/LandingPage';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function Page() {
    return (
        <PublicLayout>
            <LandingPage />
        </PublicLayout>
    );
}

import { AboutPage } from '@/features/about/AboutPage';
import { PublicLayout } from '@/components/layout/PublicLayout';

export const metadata = {
    title: 'About Us — StudySense',
    description: 'Learn about the StudySense team, our mission, and the values that drive our learning platform.',
};

export default function AboutUsPage() {
    return (
        <PublicLayout>
            <div className="container mx-auto px-6 max-w-6xl">
                <AboutPage />
            </div>
        </PublicLayout>
    );
}

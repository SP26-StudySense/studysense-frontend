import { PaymentFailedPage } from '@/features/payment/PaymentFailedPage';
import { PublicLayout } from '@/components/layout/PublicLayout';

export const metadata = {
    title: 'Payment Failed — StudySense',
    description: 'Your payment could not be processed.',
};

export default function Failed() {
    return (
        <PublicLayout>
            <div className="container mx-auto px-6 max-w-6xl">
                <PaymentFailedPage />
            </div>
        </PublicLayout>
    );
}

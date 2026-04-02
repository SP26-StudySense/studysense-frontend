import { PaymentSuccessPage } from '@/features/payment/PaymentSuccessPage';
import { PublicLayout } from '@/components/layout/PublicLayout';

export const metadata = {
    title: 'Payment Successful — StudySense',
    description: 'Thank you for upgrading to StudySense Premium.',
};

export default function Success() {
    return (
        <PublicLayout>
            <div className="container mx-auto px-6 max-w-6xl">
                <PaymentSuccessPage />
            </div>
        </PublicLayout>
    );
}

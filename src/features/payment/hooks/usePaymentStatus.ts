import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

export type PaymentStatusKey = 'pending' | 'success' | 'failed' | 'canceled' | 'unknown';

function normalizePaymentStatus(value: unknown): PaymentStatusKey {
  if (typeof value === 'number') {
    if (value === 0) return 'pending';
    if (value === 1) return 'success';
    if (value === 2) return 'failed';
    if (value === 3) return 'canceled';
    return 'unknown';
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'pending') return 'pending';
    if (normalized === 'success') return 'success';
    if (normalized === 'failed') return 'failed';
    if (normalized === 'canceled' || normalized === 'cancelled') return 'canceled';
    return 'unknown';
  }

  return 'unknown';
}

export const usePaymentStatus = (paymentId: string | null) => {
  const [status, setStatus] = useState<PaymentStatusKey>('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!paymentId) {
      setIsLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await apiClient.get(endpoints.payments.paymentStatus(paymentId));
        setStatus(normalizePaymentStatus(response.data.status));
      } catch (err) {
        console.error('Failed to verify payment status', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();

    // Setup polling interval for webhook synchronization
    const interval = setInterval(() => {
       if (status === 'pending') {
           fetchStatus();
       } else {
           clearInterval(interval);
       }
    }, 3000); 

    return () => clearInterval(interval);
  }, [paymentId, status]);

  return { status, isLoading };
};

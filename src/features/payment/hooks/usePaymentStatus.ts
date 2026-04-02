import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

export const usePaymentStatus = (paymentId: string | null) => {
  const [status, setStatus] = useState<number>(0); // 0 = Pending, 1 = Success, 2 = Failed
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!paymentId) {
      setIsLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await apiClient.get(endpoints.payments.paymentStatus(paymentId));
        setStatus(response.data.status);
      } catch (err) {
        console.error('Failed to verify payment status', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();

    // Setup polling interval for webhook synchronization
    const interval = setInterval(() => {
       if (status === 0) { // Keep polling if Pending
           fetchStatus();
       } else {
           clearInterval(interval);
       }
    }, 3000); 

    return () => clearInterval(interval);
  }, [paymentId, status]);

  return { status, isLoading };
};

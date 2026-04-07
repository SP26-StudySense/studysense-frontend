export interface UserPayment {
  paymentId: number;
  userId: string;
  subscriptionType: string | number;
  amount: number;
  currency: string;
  status: string | number;
  subscriptionDuration: number;
  paymentDate: string;
}

export interface GetUserPaymentsResponse {
  payments: UserPayment[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface UserMembershipResponse {
  userId: string;
  email: string;
  subscriptionType: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  hasActiveSubscription: boolean;
  daysRemaining: number;
}

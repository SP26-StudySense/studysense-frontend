import { AuthGuard } from '@/features/auth/components/auth-guard';
import { UserNotificationsPage } from '@/features/notification';

export default function NotificationsRoute() {
  return (
    <AuthGuard>
      <UserNotificationsPage />
    </AuthGuard>
  );
}

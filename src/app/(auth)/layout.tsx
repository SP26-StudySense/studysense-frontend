import { GuestGuard } from '@/features/auth/components/auth-guard';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <GuestGuard>
      {children}
    </GuestGuard>
  );
}

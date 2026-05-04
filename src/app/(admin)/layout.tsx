import { AdminLayout } from "@/features/admin/layout";
import { AdminGuard } from "@/features/auth";

interface AdminRouteLayoutProps {
  children: React.ReactNode;
}

export default function AdminRouteLayout({ children }: AdminRouteLayoutProps) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}

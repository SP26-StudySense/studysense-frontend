import { AdminLayout } from "@/features/admin/layout";

interface AdminRouteLayoutProps {
  children: React.ReactNode;
}

export default function AdminRouteLayout({ children }: AdminRouteLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}

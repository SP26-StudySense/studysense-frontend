import { ContentManagerLayout } from "@/features/content-manager/layout";
import { ContentManagerGuard } from "@/features/auth";

interface ContentManagerRouteLayoutProps {
  children: React.ReactNode;
}

export default function ContentManagerRouteLayout({ children }: ContentManagerRouteLayoutProps) {
  return (
    <ContentManagerGuard>
      <ContentManagerLayout>{children}</ContentManagerLayout>
    </ContentManagerGuard>
  );
}

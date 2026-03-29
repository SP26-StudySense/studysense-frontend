import { AnalystLayout } from "@/features/analyst/layout";
import { AnalystGuard } from "@/features/auth";

interface AnalystRouteLayoutProps {
  children: React.ReactNode;
}

export default function AnalystRouteLayout({ children }: AnalystRouteLayoutProps) {
  return (
    <AnalystGuard>
      <AnalystLayout>{children}</AnalystLayout>
    </AnalystGuard>
  );
}

import { AnalystLayout } from "@/features/analyst/layout";

interface AnalystRouteLayoutProps {
  children: React.ReactNode;
}

export default function AnalystRouteLayout({ children }: AnalystRouteLayoutProps) {
  return <AnalystLayout>{children}</AnalystLayout>;
}

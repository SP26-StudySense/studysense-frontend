import { ContentManagerLayout } from "@/features/content-manager/layout";

interface ContentManagerRouteLayoutProps {
  children: React.ReactNode;
}

export default function ContentManagerRouteLayout({ children }: ContentManagerRouteLayoutProps) {
  return <ContentManagerLayout>{children}</ContentManagerLayout>;
}

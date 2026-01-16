import { AuthGuard } from '@/features/auth/components/auth-guard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {/* Sidebar - to be implemented */}
        <aside className="hidden w-64 border-r bg-card lg:block">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
              <span className="text-xl font-bold">StudySense</span>
            </div>

            {/* Navigation - placeholder */}
            <nav className="flex-1 space-y-1 p-4">
              <p className="text-sm text-muted-foreground">
                Navigation will be implemented here
              </p>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Header - to be implemented */}
          <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <p className="text-sm text-muted-foreground">
              Header will be implemented here
            </p>
          </header>

          {/* Page content */}
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}

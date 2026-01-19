import { AuthGuard } from '@/features/auth/components/auth-guard';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { UserProfile } from '@/components/dashboard/UserProfile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#fafafa] font-sans text-neutral-900 selection:bg-[#c1ff72] selection:text-black">
        <div className="grid-lines pointer-events-none fixed inset-0 z-0 opacity-60"></div>

        <Sidebar />

        <main className="relative z-10 pl-72 transition-all duration-300">
          {/* Header */}
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-neutral-200/60 bg-[#fafafa]/80 px-8 backdrop-blur-xl">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
              <p className="text-sm text-neutral-500">Welcome back to your learning journey.</p>
            </div>

            <UserProfile />
          </header>

          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

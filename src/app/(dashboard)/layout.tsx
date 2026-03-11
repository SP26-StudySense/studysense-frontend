'use client';

import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/features/auth/components/auth-guard';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { UserProfile } from '@/components/dashboard/UserProfile';
import { ChatProvider, ChatPopup, ChatToggleButton } from '@/features/chat';
import { Search, Bell } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Map routes to titles
function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/profile')) return 'Profile';
  if (pathname.startsWith('/study-plans')) return 'Study Plans';
  if (pathname.startsWith('/my-roadmap')) return 'My Roadmap';
  if (pathname.startsWith('/roadmaps')) return 'Roadmaps';
  if (pathname === '/sessions/history') return 'Session History';
  if (pathname.startsWith('/sessions')) return 'Sessions';
  if (pathname.startsWith('/community')) return 'Community';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'Dashboard';
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <AuthGuard>
      <ChatProvider>
        <div className="min-h-screen bg-gradient-to-b from-[#f0fffe] via-[#faf5fc] to-[#f0fffe] font-sans text-neutral-900 selection:bg-[#00bae2] selection:text-white relative overflow-hidden">
          {/* Premium Background Effects */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Gradient Blobs */}
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#fec5fb]/40 to-[#00bae2]/20 blur-[100px] animate-pulse" />
            <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#00bae2]/30 to-[#fec5fb]/10 blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-[#fec5fb]/20 to-transparent blur-[80px]" />

            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                    linear-gradient(to right, #000 1px, transparent 1px),
                    linear-gradient(to bottom, #000 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }}
            />

            {/* Noise Texture */}
            <div
              className="absolute inset-0 opacity-[0.02] mix-blend-multiply"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
              }}
            />
          </div>

          <Sidebar />

          <main className="relative z-10 pl-72 transition-all duration-300">
            {/* Header */}
            <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-neutral-200/60 bg-white/60 px-8 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
              <div className="flex items-center gap-8">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">{pageTitle}</h1>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full rounded-xl border border-neutral-200 bg-white/50 py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#00bae2] focus:bg-white focus:ring-4 focus:ring-[#00bae2]/10"
                  />
                </div>

                <button className="relative text-neutral-500 transition-colors hover:text-neutral-900">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <div className="h-8 w-px bg-neutral-200"></div>

                <UserProfile />
              </div>
            </header>

            <div className="p-8">
              {children}
            </div>
          </main>

          {/* Chat AI Popup */}
          <ChatToggleButton />
          <ChatPopup />
        </div>
      </ChatProvider>
    </AuthGuard>
  );
}


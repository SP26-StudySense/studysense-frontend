"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Map routes to titles
function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/admin-users")) return "User Management";
  if (pathname.startsWith("/admin/admin-courses")) return "Course Management";
  if (pathname.startsWith("/admin/admin-transactions"))
    return "Transaction Management";
  if (pathname.startsWith("/admin/admin-roadmaps")) return "Roadmap Management";
  if (pathname.startsWith("/admin/admin-categories")) return "Category Management";
  if (pathname.startsWith("/admin/admin-profile")) return "Admin Profile";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  return "Admin Dashboard";
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
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
            backgroundSize: "60px 60px",
          }}
        />

        {/* Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-multiply"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      <AdminSidebar />

      <main className="relative z-10 pl-72 transition-all duration-300">
        <AdminHeader pageTitle={pageTitle} />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

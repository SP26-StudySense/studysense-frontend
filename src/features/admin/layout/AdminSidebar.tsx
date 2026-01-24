"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Map,
  CreditCard,
  FolderTree,
  UserCog,
  LogOut,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin-users",
    icon: Users,
  },
  {
    title: "Categories",
    href: "/admin-categories",
    icon: FolderTree,
  },
  {
    title: "Roadmaps",
    href: "/admin-roadmaps",
    icon: Map,
  },
  {
    title: "Transactions",
    href: "/admin-transactions",
    icon: CreditCard,
  },
  {
    title: "Profile",
    href: "/admin-profile",
    icon: UserCog,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-neutral-200/60 bg-white/80 backdrop-blur-xl">
      {/* Logo/Brand */}
      <div className="flex h-20 items-center border-b border-neutral-200/60 px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fec5fb] to-[#ff9bf5]">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">
              Admin Panel
            </h2>
            <p className="text-xs text-neutral-500">Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-[#fec5fb]/10 to-[#ff9bf5]/10 text-[#fec5fb] shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200/60 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50 hover:text-neutral-900">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  UserCog,
  LogOut,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/content-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Roadmaps",
    href: "/content-roadmaps",
    icon: Map,
  },
  {
    title: "Profile",
    href: "/content-profile",
    icon: UserCog,
  },
];

export function ContentManagerSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/content-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-neutral-200/60 bg-white/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center px-6">
        <Link href="/content-dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fec5fb] to-[#00bae2] shadow-lg shadow-[#00bae2]/20">
            <Layers className="h-[22px] w-[22px] text-neutral-900" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900">
            Study<span className="text-neutral-500">Sense</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="flex flex-col gap-1">
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Content Manager
          </div>
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive(item.href)
                  ? "bg-gradient-to-r from-[#fec5fb] to-[#00bae2] text-neutral-900 shadow-lg shadow-[#00bae2]/20"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isActive(item.href)
                    ? "text-neutral-900"
                    : "text-neutral-500 group-hover:text-neutral-900"
                )}
              />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-neutral-200/60 p-4">
        <div className="mb-3 rounded-xl bg-neutral-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#fec5fb] to-[#00bae2] text-sm font-bold text-neutral-900">
              SJ
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                Sarah Johnson
              </p>
              <p className="truncate text-xs text-neutral-500">
                Frontend Development
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

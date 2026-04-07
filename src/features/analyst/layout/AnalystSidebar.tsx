"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  GitBranch,
  LogOut,
  GitFork,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { ConfirmationModal } from "@/shared/ui";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/analyst-dashboard",
    icon: BarChart3,
  },
  {
    title: "Surveys",
    href: "/analyst-survey",
    icon: ClipboardList,
  },
  {
    title: "Trigger Mapping",
    href: "/analyst-triggermapping",
    icon: GitBranch,
  },
];

export function AnalystSidebar() {
  const pathname = usePathname();
  const { user, logout, isLoggingOut } = useAuth();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const displayName = useMemo(() => {
    if (!user) return "Analyst";

    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    if (fullName) return fullName;

    return user.email?.split("@")[0] || "Analyst";
  }, [user]);

  const initials = useMemo(() => {
    if (!user) return "AN";

    const first = user.firstName?.trim()?.charAt(0) ?? "";
    const last = user.lastName?.trim()?.charAt(0) ?? "";
    const value = `${first}${last}`.toUpperCase();
    if (value) return value;

    return user.email?.trim()?.charAt(0)?.toUpperCase() || "AN";
  }, [user]);

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-neutral-200/60 bg-white/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center px-6">
        <Link
          href="/analyst-dashboard"
          className="group flex items-center gap-2 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-[#00bae2] transition-transform duration-300 group-hover:scale-105">
            <GitFork className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            Study<span className="text-neutral-500">Sense</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="flex flex-col gap-1">
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Analyst
          </div>
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive(item.href)
                  ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/10"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isActive(item.href)
                    ? "text-[#c1ff72]"
                    : "text-neutral-500 group-hover:text-neutral-900"
                )}
                strokeWidth={2}
              />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-neutral-200/60 p-4">
        <div className="mb-3 rounded-xl bg-neutral-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#fec5fb] to-[#00bae2] text-sm font-bold text-neutral-900">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">
                {displayName}
              </p>
              <p className="truncate text-xs text-neutral-500">
                {user?.email || "-"}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          disabled={isLoggingOut}
          className="w-full justify-start gap-2 text-neutral-600 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setIsLogoutConfirmOpen(true)}
        >
          {isLoggingOut ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
              <span>Logout</span>
            </>
          )}
        </Button>

        <ConfirmationModal
          isOpen={isLogoutConfirmOpen}
          onClose={() => setIsLogoutConfirmOpen(false)}
          onConfirm={() => {
            void logout();
          }}
          title="Log out"
          description="Are you sure you want to log out of your account?"
          confirmText="Log out"
          cancelText="Stay logged in"
          variant="danger"
        />
      </div>
    </aside>
  );
}

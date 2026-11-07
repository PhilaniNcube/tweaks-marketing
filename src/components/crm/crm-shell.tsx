"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  FileSpreadsheet,
  CreditCard,
  Building2,
  Archive,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";

export interface CrmShellProps {
  children: React.ReactNode;
  currentUser: {
    name: string;
    email: string;
    role?: string;
  };
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Operations Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/projects",
    label: "Projects & Pipeline",
    icon: FolderKanban,
    exact: false,
  },
  {
    href: "/projects/new",
    label: "New Project Intake",
    icon: PlusCircle,
    exact: true,
  },
  {
    href: "/quotes",
    label: "Quotes",
    icon: FileSpreadsheet,
    exact: false,
  },
  {
    href: "/payments",
    label: "Payments & POs",
    icon: CreditCard,
    exact: false,
  },
  {
    href: "/institutions",
    label: "Institutions",
    icon: Building2,
    exact: false,
  },
  {
    href: "/archive",
    label: "Archive",
    icon: Archive,
    exact: false,
  },
  {
    href: "/settings",
    label: "Rate Card & Settings",
    icon: Settings,
    exact: false,
  },
];

export function CrmShell({ children, currentUser }: CrmShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    if (href === "/projects" && pathname === "/projects/new") return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out of CRM");
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 z-30">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-tweaks-blue text-white flex items-center justify-center font-black text-sm tracking-tighter">
              TW
            </div>
            <div>
              <p className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Tweaks CRM
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-tweaks-blue mt-0.5">
                Operations Suite
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Action CTA */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800/70">
          <Link
            href="/projects/new"
            className="w-full py-2.5 px-3 bg-tweaks-blue hover:bg-tweaks-red text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Log New Project Brief
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-bold transition-colors ${
                  active
                    ? "bg-tweaks-blue/10 text-tweaks-blue border-l-2 border-tweaks-blue"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 space-y-3 bg-slate-50/60 dark:bg-zinc-950/40">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {currentUser.email}
              </p>
            </div>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-tweaks-blue/10 text-tweaks-blue border border-tweaks-blue/20 shrink-0">
              {currentUser.role || "admin"}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/"
              target="_blank"
              className="flex-1 py-1.5 px-2.5 text-[11px] font-bold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="h-3 w-3" />
              Website
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 py-1.5 px-2.5 text-[11px] font-bold text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-xs bg-white dark:bg-zinc-900 h-full flex flex-col z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
              <span className="font-black text-sm">Tweaks CRM</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-bold ${
                      active
                        ? "bg-tweaks-blue/10 text-tweaks-blue border-l-2 border-tweaks-blue"
                        : "text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Mobile Bar */}
        <header className="lg:hidden h-14 px-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-1.5 text-slate-600 dark:text-zinc-300"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-black">Tweaks CRM</span>
          </div>
          <Link
            href="/projects/new"
            className="px-2.5 py-1.5 bg-tweaks-blue text-white text-xs font-bold flex items-center gap-1"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Camera,
  LayoutDashboard,
  CalendarRange,
  Users,
  LogOut,
  ContactRound,
  Menu,
  X,
  Building2,
} from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
};

const NAV: Item[] = [
  { href: "/scan", label: "สแกน", icon: Camera },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: true },
  { href: "/admin/events", label: "Events", icon: CalendarRange, adminOnly: true },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/admin/companies", label: "Companies", icon: Building2, superAdminOnly: true },
];

export function AppShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = NAV.filter((i) => {
    if (i.superAdminOnly) return profile.role === "super_admin";
    if (i.adminOnly) return profile.role === "admin" || profile.role === "super_admin";
    return true;
  });

  useEffect(() => setMenuOpen(false), [pathname]);

  const onLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-[100dvh] bg-muted/30 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-7xl px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 mr-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <ContactRound className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold tracking-tight">SmartCard</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* User menu */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right text-sm leading-tight">
              <div className="font-medium truncate max-w-[140px]">
                {profile.display_name || profile.email}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {profile.role}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="rounded-md p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
              title="ออกจากระบบ"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-md p-2 hover:bg-muted"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-3 space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <div className="px-3 py-2 text-sm">
                  <div className="font-medium">
                    {profile.display_name || profile.email}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {profile.role}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm hover:bg-muted text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 pb-20 md:pb-6">{children}</main>

      {/* Footer copyright (desktop only — mobile has bottom nav) */}
      <footer className="hidden md:block border-t bg-background/50 mt-auto">
        <div className="container mx-auto max-w-7xl px-4 py-3 text-center text-xs text-muted-foreground">
          SmartCard © 2026{" "}
          <span className="font-medium">Arnon Arpaket</span>. All rights reserved.
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {items.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 gap-0.5 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

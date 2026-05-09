/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserGuide } from "@/components/help/UserGuide";
import { AdminGuide } from "@/components/help/AdminGuide";

export const dynamic = "force-dynamic";

export default async function HelpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin =
    profile?.role === "admin" || profile?.role === "super_admin";
  const isSuperAdmin = profile?.role === "super_admin";

  return isAdmin ? <AdminGuide isSuperAdmin={isSuperAdmin} /> : <UserGuide />;
}

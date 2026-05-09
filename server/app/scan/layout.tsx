import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

export default async function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");

  return <AppShell profile={profile}>{children}</AppShell>;
}

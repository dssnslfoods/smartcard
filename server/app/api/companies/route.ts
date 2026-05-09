/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated", status: 401 } as const;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "super_admin")
    return { error: "forbidden", status: 403 } as const;
  return { user, supabase } as const;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .maybeSingle();

  const url = new URL(req.url);
  const includeArchived = url.searchParams.get("all") === "1";

  // super_admin sees all; others see only their company
  let query = supabase
    .from("companies")
    .select("id, name, slug, description, logo_url, active, archived_at, created_at")
    .order("created_at", { ascending: false });

  if (profile?.role !== "super_admin") {
    if (!profile?.company_id)
      return NextResponse.json({ companies: [] });
    query = query.eq("id", profile.company_id);
  }

  if (!includeArchived) query = query.is("archived_at", null);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ companies: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json()) as {
    name?: string;
    slug?: string;
    description?: string;
    logo_url?: string;
    active?: boolean;
  };

  if (!body.name || !body.slug) {
    return NextResponse.json(
      { error: "name and slug are required" },
      { status: 400 }
    );
  }

  // Use service client to bypass RLS for INSERT (admin operation)
  const service = createServiceClient();
  const { data, error } = await service
    .from("companies")
    .insert({
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      logo_url: body.logo_url ?? null,
      active: body.active ?? true,
      created_by: auth.user.id,
    })
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ company: data });
}

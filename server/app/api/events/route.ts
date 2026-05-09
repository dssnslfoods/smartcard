/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EventField } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const includeArchived = url.searchParams.get("all") === "1";

  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select("id, slug, name, description, event_date, fields, active, created_at, archived_at")
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!includeArchived) {
    query = query.is("archived_at", null).eq("active", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ events: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  // Get current user's company (admin's company OR super_admin can pass company_id)
  const { data: me } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .maybeSingle();

  const body = (await req.json()) as {
    slug?: string;
    name?: string;
    description?: string;
    event_date?: string;
    fields?: EventField[];
    active?: boolean;
    company_id?: string;
  };

  if (!body.slug || !body.name) {
    return NextResponse.json(
      { error: "slug and name are required" },
      { status: 400 }
    );
  }

  // Resolve company_id: super_admin must specify; admin auto-uses own
  let companyId: string;
  if (me?.role === "super_admin") {
    if (!body.company_id)
      return NextResponse.json(
        { error: "super_admin must specify company_id" },
        { status: 400 }
      );
    companyId = body.company_id;
  } else if (me?.role === "admin") {
    if (!me.company_id)
      return NextResponse.json(
        { error: "admin has no company assigned" },
        { status: 400 }
      );
    companyId = me.company_id;
  } else {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      slug: body.slug,
      name: body.name,
      description: body.description ?? null,
      event_date: body.event_date ?? null,
      fields: body.fields ?? [],
      active: body.active ?? true,
      created_by: user.id,
      company_id: companyId,
    })
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ event: data });
}

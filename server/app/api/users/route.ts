/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: me } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!me || (me.role !== "admin" && me.role !== "super_admin"))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const service = createServiceClient();
  let query = service
    .from("profiles")
    .select("id, email, display_name, role, company_id, created_at")
    .order("created_at", { ascending: false });

  // Admin sees only own company; super_admin sees all
  if (me.role === "admin" && me.company_id) {
    query = query.eq("company_id", me.company_id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also fetch companies for the role context
  const { data: companies } = await service
    .from("companies")
    .select("id, name, slug")
    .is("archived_at", null);

  return NextResponse.json({ users: data ?? [], companies: companies ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: me } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!me || (me.role !== "admin" && me.role !== "super_admin"))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json()) as {
    email?: string;
    password?: string;
    display_name?: string;
    role?: "user" | "admin" | "super_admin";
    company_id?: string | null;
  };

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  // Decide company assignment + role guards
  let targetCompanyId: string | null;
  let targetRole = body.role ?? "user";

  if (me.role === "super_admin") {
    // Super admin can pick anything
    if (targetRole === "super_admin") {
      targetCompanyId = null;
    } else {
      targetCompanyId = body.company_id ?? null;
      if (!targetCompanyId) {
        return NextResponse.json(
          { error: "company_id is required for non-super_admin users" },
          { status: 400 }
        );
      }
    }
  } else {
    // Regular admin can only create users in their own company; cannot create super_admin
    if (targetRole === "super_admin") {
      return NextResponse.json(
        { error: "Only super_admin can create super_admin users" },
        { status: 403 }
      );
    }
    targetCompanyId = me.company_id;
    if (!targetCompanyId) {
      return NextResponse.json(
        { error: "Your account has no company" },
        { status: 400 }
      );
    }
  }

  const service = createServiceClient();

  const { data: authData, error: authErr } = await service.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: {
      name: body.display_name ?? body.email,
      role: targetRole,
      ...(targetCompanyId ? { company_id: targetCompanyId } : {}),
    },
  });
  if (authErr || !authData.user)
    return NextResponse.json(
      { error: authErr?.message ?? "failed to create user" },
      { status: 400 }
    );

  // Profile already created by trigger; ensure correct values
  const { error: profErr } = await service
    .from("profiles")
    .update({
      display_name: body.display_name ?? body.email,
      role: targetRole,
      company_id: targetCompanyId,
    })
    .eq("id", authData.user.id);
  if (profErr)
    return NextResponse.json({ error: profErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: authData.user.id });
}

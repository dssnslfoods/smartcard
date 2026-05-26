/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSystemController } from "@/lib/system";

export const dynamic = "force-dynamic";

// Return current system status. Any authenticated user can read it.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("system_settings")
    .select("is_active, inactive_message, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    isActive: data?.is_active ?? true,
    inactiveMessage: data?.inactive_message ?? null,
    updatedAt: data?.updated_at ?? null,
    canControl: isSystemController(user.email),
  });
}

// Toggle inactive mode + set message. Controller account only.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  if (!isSystemController(user.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    isActive?: boolean;
    inactiveMessage?: string;
  };

  if (typeof body.isActive !== "boolean") {
    return NextResponse.json(
      { error: "isActive (boolean) is required" },
      { status: 400 }
    );
  }

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("system_settings")
    .update({
      is_active: body.isActive,
      inactive_message: body.inactiveMessage ?? null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select("is_active, inactive_message, updated_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    isActive: data?.is_active ?? body.isActive,
    inactiveMessage: data?.inactive_message ?? null,
    updatedAt: data?.updated_at ?? null,
  });
}

/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { currentPassword, newPassword } = (await req.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" },
      { status: 400 }
    );
  }
  if (!currentPassword) {
    return NextResponse.json(
      { error: "กรุณาใส่รหัสผ่านปัจจุบันเพื่อยืนยัน" },
      { status: 400 }
    );
  }
  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสปัจจุบัน" },
      { status: 400 }
    );
  }

  // Verify current password via a one-shot signIn (separate client → won't affect current session)
  const verifyClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { error: verifyErr } = await verifyClient.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyErr) {
    return NextResponse.json(
      { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  // Update via admin API (keeps current session valid)
  const service = createServiceClient();
  const { error } = await service.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

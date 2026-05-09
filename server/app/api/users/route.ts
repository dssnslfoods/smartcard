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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (me?.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("profiles")
    .select("id, email, display_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (me?.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json()) as {
    email?: string;
    password?: string;
    display_name?: string;
    role?: "user" | "admin";
  };

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  const service = createServiceClient();

  // Create the auth user
  const { data: authData, error: authErr } = await service.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { name: body.display_name ?? body.email },
  });
  if (authErr || !authData.user)
    return NextResponse.json(
      { error: authErr?.message ?? "failed to create user" },
      { status: 400 }
    );

  // Update profile (trigger already inserted base row)
  const { error: profErr } = await service
    .from("profiles")
    .update({
      display_name: body.display_name ?? body.email,
      role: body.role ?? "user",
    })
    .eq("id", authData.user.id);
  if (profErr)
    return NextResponse.json({ error: profErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: authData.user.id });
}

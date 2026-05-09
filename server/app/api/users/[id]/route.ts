import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated", status: 401 } as const;
  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (me?.role !== "admin")
    return { error: "forbidden", status: 403 } as const;
  return { user, supabase } as const;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json()) as {
    role?: "user" | "admin";
    display_name?: string;
    password?: string;
  };

  const service = createServiceClient();

  if (body.password) {
    const { error } = await service.auth.admin.updateUserById(id, {
      password: body.password,
    });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const profileUpdate: Partial<{
    role: "user" | "admin";
    display_name: string | null;
  }> = {};
  if (body.role !== undefined) profileUpdate.role = body.role;
  if (body.display_name !== undefined)
    profileUpdate.display_name = body.display_name;

  if (Object.keys(profileUpdate).length > 0) {
    const { error } = await service
      .from("profiles")
      .update(profileUpdate)
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const service = createServiceClient();
  const { error } = await service.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

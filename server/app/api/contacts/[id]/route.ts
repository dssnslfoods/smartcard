import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EventResponse } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

function flattenEventResponse(response: EventResponse): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [key, val] of Object.entries(response)) {
    if (typeof val === "string") flat[key] = val;
    else if (val && typeof val === "object" && "selected" in val) {
      flat[key] = (val.selected ?? []).join(", ");
      if (val.other) flat[`${key}__other`] = val.other;
    }
  }
  return flat;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const body = (await req.json()) as {
    name?: string | null;
    position?: string | null;
    company?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address?: string | null;
    event_id?: string | null;
    eventResponse?: EventResponse;
  };

  const update: Partial<{
    name: string | null;
    position: string | null;
    company: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    event_id: string | null;
    event_data: Record<string, string>;
    updated_at: string;
  }> = { updated_at: new Date().toISOString() };
  for (const k of [
    "name",
    "position",
    "company",
    "phone",
    "email",
    "website",
    "address",
    "event_id",
  ] as const) {
    if (k in body) update[k] = body[k] as string | null;
  }
  if (body.eventResponse !== undefined) {
    update.event_data = flattenEventResponse(body.eventResponse);
  }

  const { data, error } = await supabase
    .from("contacts")
    .update(update)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ contact: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

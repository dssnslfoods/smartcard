import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EventField } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = (await req.json()) as {
    name?: string;
    description?: string;
    event_date?: string | null;
    fields?: EventField[];
    active?: boolean;
  };

  const { data, error } = await supabase
    .from("events")
    .update({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.event_date !== undefined && { event_date: body.event_date }),
      ...(body.fields !== undefined && { fields: body.fields }),
      ...(body.active !== undefined && { active: body.active }),
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ event: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ archived_at: new Date().toISOString(), active: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

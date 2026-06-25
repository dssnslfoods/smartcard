/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteCardImages } from "@/lib/storage";
import type { EventField } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

// GET — returns usage info for the delete dialog (attendance count etc.)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("attendances")
    .select("id", { count: "exact", head: true })
    .eq("event_id", id)
    .is("deleted_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ attendanceCount: count ?? 0 });
}

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

// DELETE — supports three modes via query string:
//   ?mode=archive           (default) soft archive, keep attendances as-is
//   ?mode=move&to=<eid>     move all attendances to another event, then hard-delete event
//   ?mode=delete_cards      hard delete all attendances (cleanup orphan contacts +
//                           Storage images), then hard-delete event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "archive";
  const moveTo = url.searchParams.get("to");

  if (mode === "archive") {
    const { error } = await supabase
      .from("events")
      .update({ archived_at: new Date().toISOString(), active: false })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, mode: "archive" });
  }

  if (mode === "move") {
    if (!moveTo) {
      return NextResponse.json(
        { error: "missing 'to' event id for move mode" },
        { status: 400 }
      );
    }
    if (moveTo === id) {
      return NextResponse.json(
        { error: "cannot move attendances to the same event" },
        { status: 400 }
      );
    }
    // Verify the target event exists and is in the caller's scope (RLS).
    const { data: target, error: tErr } = await supabase
      .from("events")
      .select("id")
      .eq("id", moveTo)
      .maybeSingle();
    if (tErr || !target) {
      return NextResponse.json(
        { error: "target event not found" },
        { status: 404 }
      );
    }

    const { error: mvErr, count } = await supabase
      .from("attendances")
      .update({ event_id: moveTo }, { count: "exact" })
      .eq("event_id", id);
    if (mvErr)
      return NextResponse.json({ error: mvErr.message }, { status: 400 });

    const { error: dErr } = await supabase.from("events").delete().eq("id", id);
    if (dErr)
      return NextResponse.json({ error: dErr.message }, { status: 400 });
    return NextResponse.json({ ok: true, mode: "move", moved: count ?? 0 });
  }

  if (mode === "delete_cards") {
    // Pull all attendances for this event (incl. image_urls for storage cleanup
    // and contact_id for orphan check).
    const { data: atts, error: aErr } = await supabase
      .from("attendances")
      .select("id, contact_id, image_urls")
      .eq("event_id", id);
    if (aErr)
      return NextResponse.json({ error: aErr.message }, { status: 400 });

    const attRows = atts ?? [];
    const allImages: string[] = [];
    const contactIds = new Set<string>();
    for (const r of attRows) {
      if (Array.isArray(r.image_urls)) allImages.push(...r.image_urls);
      if (r.contact_id) contactIds.add(r.contact_id);
    }

    // Hard-delete all attendances for this event.
    if (attRows.length > 0) {
      const { error: dAttErr } = await supabase
        .from("attendances")
        .delete()
        .eq("event_id", id);
      if (dAttErr)
        return NextResponse.json({ error: dAttErr.message }, { status: 400 });
    }

    // For each affected contact, if it has no remaining attendances → delete it
    // (and collect its lingering Storage images for cleanup).
    for (const cid of contactIds) {
      const { count: remaining } = await supabase
        .from("attendances")
        .select("id", { count: "exact", head: true })
        .eq("contact_id", cid);
      if ((remaining ?? 0) === 0) {
        const { data: c } = await supabase
          .from("contacts")
          .select("image_urls")
          .eq("id", cid)
          .maybeSingle();
        if (c?.image_urls && Array.isArray(c.image_urls)) {
          allImages.push(...c.image_urls);
        }
        await supabase.from("contacts").delete().eq("id", cid);
      }
    }

    // Cleanup Storage (best-effort; don't fail the request if it errors).
    const uniqueImages = Array.from(new Set(allImages));
    if (uniqueImages.length > 0) {
      await deleteCardImages(uniqueImages).catch((e) =>
        console.error("[events/delete] storage cleanup failed:", e)
      );
    }

    // Finally, hard-delete the event row itself.
    const { error: dEvErr } = await supabase
      .from("events")
      .delete()
      .eq("id", id);
    if (dEvErr)
      return NextResponse.json({ error: dEvErr.message }, { status: 400 });

    return NextResponse.json({
      ok: true,
      mode: "delete_cards",
      deletedAttendances: attRows.length,
    });
  }

  return NextResponse.json({ error: `unknown mode: ${mode}` }, { status: 400 });
}

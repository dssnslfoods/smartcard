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
import type { EventResponse } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

// NOTE: id here is attendance.id (each row in dashboard = 1 attendance)

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
    // Contact fields (master record)
    name?: string | null;
    position?: string | null;
    company?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address?: string | null;
    // Attendance fields
    event_id?: string | null;
    eventResponse?: EventResponse;
    notes?: string | null;
  };

  // First fetch the attendance to find contact_id
  const { data: att, error: attErr } = await supabase
    .from("attendances")
    .select("id, contact_id")
    .eq("id", id)
    .maybeSingle();
  if (attErr || !att)
    return NextResponse.json({ error: "attendance not found" }, { status: 404 });

  // Update contact (master) fields if provided
  const contactUpdate: Partial<{
    name: string | null;
    position: string | null;
    company: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
  }> = {};
  for (const k of [
    "name",
    "position",
    "company",
    "phone",
    "email",
    "website",
    "address",
  ] as const) {
    if (k in body) contactUpdate[k] = body[k] ?? null;
  }
  if (Object.keys(contactUpdate).length > 0) {
    const { error } = await supabase
      .from("contacts")
      .update(contactUpdate)
      .eq("id", att.contact_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Update attendance fields
  const attUpdate: Partial<{
    event_id: string | null;
    event_data: Record<string, string>;
    notes: string | null;
  }> = {};
  if ("event_id" in body) attUpdate.event_id = body.event_id ?? null;
  if (body.eventResponse !== undefined)
    attUpdate.event_data = flattenEventResponse(body.eventResponse);
  if ("notes" in body) attUpdate.notes = body.notes ?? null;

  if (Object.keys(attUpdate).length > 0) {
    const { error } = await supabase
      .from("attendances")
      .update(attUpdate)
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Get attendance details (need image_urls + contact_id)
  const { data: att } = await supabase
    .from("attendances")
    .select("contact_id, image_urls")
    .eq("id", id)
    .maybeSingle();

  // 2. Hard delete the attendance row
  const { error: delErr } = await supabase
    .from("attendances")
    .delete()
    .eq("id", id);
  if (delErr)
    return NextResponse.json({ error: delErr.message }, { status: 400 });

  // 3. Delete images of this attendance from Storage
  const attImages = att?.image_urls ?? [];
  if (attImages.length > 0) {
    await deleteCardImages(attImages).catch((e) =>
      console.error("[contacts/delete] storage cleanup failed:", e)
    );
  }

  // 4. If no more attendances → delete contact + remaining contact images
  if (att?.contact_id) {
    const { count } = await supabase
      .from("attendances")
      .select("id", { count: "exact", head: true })
      .eq("contact_id", att.contact_id);

    if ((count ?? 0) === 0) {
      const { data: contact } = await supabase
        .from("contacts")
        .select("image_urls")
        .eq("id", att.contact_id)
        .maybeSingle();

      await supabase.from("contacts").delete().eq("id", att.contact_id);

      // Cleanup any contact-level images that weren't already deleted with the attendance
      if (contact?.image_urls && contact.image_urls.length > 0) {
        const remaining = contact.image_urls.filter(
          (u: string) => !attImages.includes(u)
        );
        if (remaining.length > 0) {
          await deleteCardImages(remaining).catch((e) =>
            console.error("[contacts/delete] contact storage cleanup failed:", e)
          );
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}

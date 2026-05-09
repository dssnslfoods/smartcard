/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadCardImages } from "@/lib/storage";
import type { EventResponse } from "@/lib/supabase/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type CardData = {
  name?: string;
  position?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
};

function flattenEventResponse(response: EventResponse): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [key, val] of Object.entries(response)) {
    if (typeof val === "string") {
      flat[key] = val;
    } else if (val && typeof val === "object" && "selected" in val) {
      flat[key] = (val.selected ?? []).join(", ");
      if (val.other) flat[`${key}__other`] = val.other;
    }
  }
  return flat;
}

function normalizePhone(s: string | undefined | null): string {
  return (s ?? "").replace(/[^0-9+]/g, "");
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json()) as {
    card?: CardData;
    eventId?: string | null;
    eventResponse?: EventResponse;
    imagesBase64?: string[];
    imageUrls?: string[];
    notes?: string;
  };

  const card = body.card ?? {};

  // Step 1: Resolve image URLs (use pre-uploaded if provided, else upload now)
  let imageUrls: string[] = [];
  let imageError: string | undefined;
  if (body.imageUrls && body.imageUrls.length > 0) {
    imageUrls = body.imageUrls;
  } else if (body.imagesBase64 && body.imagesBase64.length > 0) {
    try {
      const results = await uploadCardImages(
        body.imagesBase64,
        card.name || "card"
      );
      imageUrls = results.map((r) => r.url);
    } catch (e) {
      imageError = e instanceof Error ? e.message : String(e);
      console.error("[contacts] image upload failed:", e);
    }
  }

  // Step 2: Find existing contact (by email or phone)
  let contactId: string | null = null;
  let isNewContact = false;

  const emailKey = (card.email ?? "").trim().toLowerCase();
  const phoneKey = normalizePhone(card.phone);

  if (emailKey) {
    const { data: existing } = await supabase
      .from("contacts")
      .select("id")
      .ilike("email", emailKey)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();
    if (existing) contactId = existing.id;
  }

  if (!contactId && phoneKey && phoneKey.length >= 6) {
    // Phone match — fetch all contacts and compare normalized digits
    const { data: candidates } = await supabase
      .from("contacts")
      .select("id, phone")
      .not("phone", "is", null)
      .is("deleted_at", null)
      .limit(50);
    const match = (candidates ?? []).find(
      (c) => normalizePhone(c.phone) === phoneKey
    );
    if (match) contactId = match.id;
  }

  // Step 3: Create or update contact
  if (contactId) {
    // Existing contact — update last_scanned_at + merge missing fields
    const updates: Partial<{
      last_scanned_at: string;
      image_urls: string[];
    }> = {
      last_scanned_at: new Date().toISOString(),
    };
    if (imageUrls.length > 0) updates.image_urls = imageUrls;
    await supabase.from("contacts").update(updates).eq("id", contactId);
  } else {
    const { data: newContact, error: createErr } = await supabase
      .from("contacts")
      .insert({
        name: card.name ?? null,
        position: card.position ?? null,
        company: card.company ?? null,
        phone: card.phone ?? null,
        email: card.email ?? null,
        website: card.website ?? null,
        address: card.address ?? null,
        image_urls: imageUrls,
        first_scanned_by: user.id,
      })
      .select("id")
      .maybeSingle();

    if (createErr || !newContact) {
      return NextResponse.json(
        { error: createErr?.message ?? "Failed to create contact" },
        { status: 400 }
      );
    }
    contactId = newContact.id;
    isNewContact = true;
  }

  // Step 4: Create attendance record (always — even without event)
  const eventData = body.eventResponse
    ? flattenEventResponse(body.eventResponse)
    : {};

  const { data: attendance, error: attErr } = await supabase
    .from("attendances")
    .insert({
      contact_id: contactId,
      event_id: body.eventId ?? null,
      event_data: eventData,
      image_urls: imageUrls,
      notes: body.notes ?? null,
      scanned_by: user.id,
    })
    .select("id")
    .maybeSingle();

  if (attErr) {
    return NextResponse.json({ error: attErr.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    contactId,
    attendanceId: attendance?.id,
    isNewContact,
    imageUrls,
    imageError,
  });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const url = new URL(req.url);
  const eventId = url.searchParams.get("event_id");
  const dateFrom = url.searchParams.get("date_from");
  const dateTo = url.searchParams.get("date_to");
  const search = url.searchParams.get("search");
  const scannedBy = url.searchParams.get("scanned_by");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "500"), 5000);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);

  const eventDataFilters: Array<[string, string]> = [];
  for (const [k, v] of url.searchParams.entries()) {
    if (k.startsWith("event_data[") && k.endsWith("]")) {
      eventDataFilters.push([k.slice("event_data[".length, -1), v]);
    }
  }

  let query = supabase
    .from("attendances")
    .select(
      `
      id, scanned_at, event_id, event_data, image_urls, notes, scanned_by,
      contacts:contact_id (
        id, name, position, company, phone, email, website, address, image_urls
      ),
      events:event_id ( id, name, slug, event_date ),
      profiles:scanned_by ( id, email, display_name )
    `,
      { count: "exact" }
    )
    .is("deleted_at", null)
    .order("scanned_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (eventId === "none") query = query.is("event_id", null);
  else if (eventId) query = query.eq("event_id", eventId);
  if (scannedBy) query = query.eq("scanned_by", scannedBy);
  if (dateFrom) query = query.gte("scanned_at", dateFrom);
  if (dateTo) query = query.lte("scanned_at", dateTo);
  for (const [k, v] of eventDataFilters) {
    query = query.ilike(`event_data->>${k}`, `%${v}%`);
  }

  const { data: rows, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type RawRow = {
    id: string;
    scanned_at: string;
    event_id: string | null;
    event_data: Record<string, string> | null;
    image_urls: string[] | null;
    notes: string | null;
    scanned_by: string | null;
    contacts: {
      id: string;
      name: string | null;
      position: string | null;
      company: string | null;
      phone: string | null;
      email: string | null;
      website: string | null;
      address: string | null;
      image_urls: string[] | null;
    } | null;
    events: { id: string; name: string; slug: string; event_date: string | null } | null;
    profiles: { id: string; email: string; display_name: string | null } | null;
  };
  let result = (rows ?? []) as unknown as RawRow[];

  if (search) {
    const s = search.toLowerCase();
    result = result.filter((r) => {
      const c = r.contacts;
      return [c?.name, c?.company, c?.email, c?.phone, ...Object.values(r.event_data ?? {})]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s));
    });
  }

  // Map to flat shape compatible with the existing dashboard UI
  const contacts = result.map((r) => ({
    id: r.id,
    contact_id: r.contacts?.id ?? null,
    name: r.contacts?.name ?? null,
    position: r.contacts?.position ?? null,
    company: r.contacts?.company ?? null,
    phone: r.contacts?.phone ?? null,
    email: r.contacts?.email ?? null,
    website: r.contacts?.website ?? null,
    address: r.contacts?.address ?? null,
    image_urls: r.image_urls ?? [],
    event_id: r.event_id,
    event_data: r.event_data ?? {},
    notes: r.notes,
    scanned_by: r.scanned_by,
    created_at: r.scanned_at,
    events: r.events,
    profiles: r.profiles,
  }));

  return NextResponse.json({
    contacts,
    total: search ? contacts.length : count ?? 0,
  });
}

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
  };

  const card = body.card ?? {};

  // Upload images
  let imageUrls: string[] = [];
  let imageError: string | undefined;
  if (body.imagesBase64 && body.imagesBase64.length > 0) {
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

  const eventData = body.eventResponse
    ? flattenEventResponse(body.eventResponse)
    : {};

  const { data, error } = await supabase
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
      event_id: body.eventId ?? null,
      event_data: eventData,
      scanned_by: user.id,
    })
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, id: data?.id, imageUrls, imageError });
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

  // event_data filters via repeating event_data[key]=value query params
  const eventDataFilters: Array<[string, string]> = [];
  for (const [k, v] of url.searchParams.entries()) {
    if (k.startsWith("event_data[") && k.endsWith("]")) {
      const key = k.slice("event_data[".length, -1);
      eventDataFilters.push([key, v]);
    }
  }

  let query = supabase
    .from("contacts")
    .select(
      `
      id, name, position, company, phone, email, website, address,
      image_urls, event_id, event_data, scanned_by,
      created_at, updated_at,
      events:event_id ( id, name, slug, event_date ),
      profiles:scanned_by ( id, email, display_name )
    `,
      { count: "exact" }
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (eventId === "none") query = query.is("event_id", null);
  else if (eventId) query = query.eq("event_id", eventId);
  if (scannedBy) query = query.eq("scanned_by", scannedBy);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);
  if (search) {
    const s = search.replace(/[%_]/g, (c) => `\\${c}`);
    query = query.or(
      `name.ilike.%${s}%,company.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`
    );
  }
  for (const [k, v] of eventDataFilters) {
    // Match if event_data[k] contains v (substring)
    query = query.ilike(`event_data->>${k}`, `%${v}%`);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ contacts: data ?? [], total: count ?? 0 });
}

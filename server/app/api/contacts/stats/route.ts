/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

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

  const eventDataFilters: Array<[string, string]> = [];
  for (const [k, v] of url.searchParams.entries()) {
    if (k.startsWith("event_data[") && k.endsWith("]")) {
      eventDataFilters.push([k.slice("event_data[".length, -1), v]);
    }
  }

  // Lightweight aggregation query — only fields needed for stats.
  // RLS scopes to the caller's company automatically.
  let query = supabase
    .from("attendances")
    .select(
      `scanned_at, scanned_by, event_data,
       contacts:contact_id ( name, company, email, phone ),
       profiles:scanned_by ( id, email, display_name )`
    )
    .is("deleted_at", null)
    .limit(20000);

  if (eventId === "none") query = query.is("event_id", null);
  else if (eventId) query = query.eq("event_id", eventId);
  if (scannedBy) query = query.eq("scanned_by", scannedBy);
  if (dateFrom) query = query.gte("scanned_at", dateFrom);
  if (dateTo) query = query.lte("scanned_at", dateTo);
  for (const [k, v] of eventDataFilters) {
    query = query.ilike(`event_data->>${k}`, `%${v}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type Row = {
    scanned_at: string;
    scanned_by: string | null;
    event_data: Record<string, string> | null;
    contacts: {
      name: string | null;
      company: string | null;
      email: string | null;
      phone: string | null;
    } | null;
    profiles: { id: string; email: string; display_name: string | null } | null;
  };
  let rows = (data ?? []) as unknown as Row[];

  // Client-side search across joined contact fields (mirror /api/contacts)
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter((r) => {
      const c = r.contacts;
      return [c?.name, c?.company, c?.email, c?.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s));
    });
  }

  // Today boundary in Asia/Bangkok (server runs UTC; compute BKK midnight)
  const now = new Date();
  const bkkOffsetMs = 7 * 60 * 60 * 1000;
  const bkkNow = new Date(now.getTime() + bkkOffsetMs);
  const bkkMidnightUtc = new Date(
    Date.UTC(
      bkkNow.getUTCFullYear(),
      bkkNow.getUTCMonth(),
      bkkNow.getUTCDate()
    ) - bkkOffsetMs
  );

  let todayCount = 0;
  const scannerMap = new Map<
    string,
    { id: string; name: string; email: string; count: number; todayCount: number }
  >();

  for (const r of rows) {
    const isToday = new Date(r.scanned_at) >= bkkMidnightUtc;
    if (isToday) todayCount += 1;
    if (r.scanned_by) {
      const existing = scannerMap.get(r.scanned_by);
      if (existing) {
        existing.count += 1;
        if (isToday) existing.todayCount += 1;
      } else {
        scannerMap.set(r.scanned_by, {
          id: r.scanned_by,
          name: r.profiles?.display_name ?? r.profiles?.email ?? "Unknown",
          email: r.profiles?.email ?? "",
          count: 1,
          todayCount: isToday ? 1 : 0,
        });
      }
    }
  }

  const scannerRanking = Array.from(scannerMap.values()).sort(
    (a, b) => b.count - a.count
  );

  // 30-day daily series (BKK dates)
  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(bkkMidnightUtc.getTime() - i * 24 * 60 * 60 * 1000);
    const bkk = new Date(d.getTime() + bkkOffsetMs);
    const key = bkk.toISOString().slice(0, 10);
    dayMap.set(key, 0);
  }
  for (const r of rows) {
    const bkk = new Date(new Date(r.scanned_at).getTime() + bkkOffsetMs);
    const key = bkk.toISOString().slice(0, 10);
    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
  }
  const dailySeries = Array.from(dayMap.entries()).map(([date, count]) => ({
    date,
    label: date.slice(5),
    count,
  }));

  return NextResponse.json({
    total: rows.length,
    todayCount,
    scannerRanking,
    dailySeries,
  });
}

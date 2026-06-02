/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import type { EventField, EventRow } from "@/lib/supabase/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const HEADER_FILL = "FF3B82F6";
const HEADER_FONT = "FFFFFFFF";
const ALT_FILL = "FFF8FAFC";
const LINK_COLOR = "FF2563EB";

function applyHeaderStyle(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: HEADER_FONT }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_FILL },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });
  row.height = 32;
}

function applyDataStyle(row: ExcelJS.Row, isAlt: boolean) {
  row.eachCell((cell) => {
    cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FFE2E8F0" } },
      bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      left: { style: "thin", color: { argb: "FFE2E8F0" } },
      right: { style: "thin", color: { argb: "FFE2E8F0" } },
    };
    if (isAlt) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: ALT_FILL },
      };
    }
  });
}

function setSimpleHyperlink(cell: ExcelJS.Cell, url: string, label?: string) {
  if (!url) return;
  const href = url.startsWith("http") ? url : `https://${url}`;
  cell.value = { text: label ?? url, hyperlink: href };
  cell.font = { color: { argb: LINK_COLOR }, underline: true };
}

function setImagesHyperlink(cell: ExcelJS.Cell, urls: string[]) {
  if (urls.length === 0) return;
  cell.value = {
    text: urls.length > 1 ? `เปิดรูป (${urls.length})` : "เปิดรูป",
    hyperlink: urls[0],
  };
  cell.font = { color: { argb: LINK_COLOR }, underline: true };
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (me?.role !== "admin" && me?.role !== "super_admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const eventId = url.searchParams.get("event_id");
    const dateFrom = url.searchParams.get("date_from");
    const dateTo = url.searchParams.get("date_to");
    const search = url.searchParams.get("search");

    const eventDataFilters: Array<[string, string]> = [];
    for (const [k, v] of url.searchParams.entries()) {
      if (k.startsWith("event_data[") && k.endsWith("]")) {
        eventDataFilters.push([k.slice("event_data[".length, -1), v]);
      }
    }

    let query = supabase
      .from("attendances")
      .select(
        `id, scanned_at, event_id, event_data, image_urls, notes,
         contacts:contact_id ( id, name, position, company, phone, email, website, address ),
         events:event_id ( id, name, slug, event_date ),
         profiles:scanned_by ( id, email, display_name )`
      )
      .is("deleted_at", null)
      .order("scanned_at", { ascending: false })
      .limit(10000);

    if (eventId === "none") query = query.is("event_id", null);
    else if (eventId) query = query.eq("event_id", eventId);
    if (dateFrom) query = query.gte("scanned_at", dateFrom);
    if (dateTo) query = query.lte("scanned_at", dateTo);

    // Group filters by key. Multiple values for the same key OR together
    // (e.g. interests=Snack OR interests=Drink); different keys AND together.
    const filtersByKey = new Map<string, string[]>();
    for (const [k, v] of eventDataFilters) {
      if (!filtersByKey.has(k)) filtersByKey.set(k, []);
      filtersByKey.get(k)!.push(v);
    }
    const escapeOrValue = (s: string) =>
      s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/\)/g, "\\)");
    for (const [k, vs] of filtersByKey) {
      if (vs.length === 1) {
        query = query.ilike(`event_data->>${k}`, `%${vs[0]}%`);
      } else {
        const orParts = vs
          .map((v) => `event_data->>${k}.ilike.%${escapeOrValue(v)}%`)
          .join(",");
        query = query.or(orParts);
      }
    }

    const { data: rows, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    type ExportRow = {
      id: string;
      scanned_at: string;
      event_id: string | null;
      event_data: Record<string, string> | null;
      image_urls: string[] | null;
      notes: string | null;
      contacts: {
        id: string;
        name: string | null;
        position: string | null;
        company: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
      } | null;
      events: {
        id: string;
        name: string;
        slug: string;
        event_date: string | null;
      } | null;
      profiles: {
        id: string;
        email: string;
        display_name: string | null;
      } | null;
    };
    let data = (rows ?? []) as unknown as ExportRow[];

    // Optional client-side search across joined fields
    if (search) {
      const s = search.toLowerCase();
      data = data.filter((r) => {
        const c = r.contacts;
        return [c?.name, c?.company, c?.email, c?.phone]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(s));
      });
    }

    // Get all unique event configs to know fields per event
    const eventIds = [...new Set(data.map((r) => r.event_id).filter(Boolean))];
    let eventConfigs: EventRow[] = [];
    if (eventIds.length > 0) {
      const { data: evts } = await supabase
        .from("events")
        .select("id, slug, name, fields")
        .in("id", eventIds as string[]);
      eventConfigs = (evts ?? []) as EventRow[];
    }

    // Build a master column list: base + union of event fields
    type Col = { header: string; key: string; width: number };
    const baseCols: Col[] = [
      { header: "วันที่", key: "date", width: 18 },
      { header: "ชื่อ", key: "name", width: 26 },
      { header: "ตำแหน่ง", key: "position", width: 26 },
      { header: "บริษัท", key: "company", width: 28 },
      { header: "โทรศัพท์", key: "phone", width: 18 },
      { header: "อีเมล", key: "email", width: 26 },
      { header: "เว็บไซต์", key: "website", width: 22 },
      { header: "ที่อยู่", key: "address", width: 40 },
      { header: "ผู้สแกน", key: "scanner", width: 22 },
      { header: "Event", key: "eventName", width: 22 },
      { header: "วันที่ Event", key: "eventDate", width: 14 },
      { header: "รูปนามบัตร", key: "images", width: 16 },
    ];

    // If any criteria filters were applied, add a "เกณฑ์ที่ตรง" column showing
    // which selected values each row actually matched.
    const hasCriteria = filtersByKey.size > 0;
    if (hasCriteria) {
      baseCols.push({ header: "เกณฑ์ที่ตรง", key: "criteria", width: 42 });
    }

    const eventFieldKeys = new Map<string, EventField>(); // key -> field
    for (const ev of eventConfigs) {
      for (const f of ev.fields) {
        if (!eventFieldKeys.has(f.key)) eventFieldKeys.set(f.key, f);
      }
    }

    // Compute which selected values matched a given row's event_data.
    // Returns a human-readable string like:
    //   "ความสนใจ: Snack, Drink · Segment: Restaurant"
    const matchedCriteriaFor = (
      ed: Record<string, unknown>
    ): string => {
      const parts: string[] = [];
      for (const [key, wanted] of filtersByKey) {
        const val = ed[key];
        const wantedLower = wanted.map((w) => w.toLowerCase());
        const matched: string[] = [];
        if (
          val &&
          typeof val === "object" &&
          !Array.isArray(val) &&
          Array.isArray((val as { selected?: unknown }).selected)
        ) {
          const obj = val as { selected: unknown[]; other?: string };
          for (const s of obj.selected) {
            const sv = String(s);
            if (wantedLower.includes(sv.toLowerCase())) matched.push(sv);
          }
          if (obj.other) {
            const otherLower = String(obj.other).toLowerCase();
            for (const w of wanted) {
              if (otherLower.includes(w.toLowerCase()))
                matched.push(`${w} (อื่นๆ)`);
            }
          }
        } else if (Array.isArray(val)) {
          for (const s of val) {
            const sv = String(s);
            if (wantedLower.includes(sv.toLowerCase())) matched.push(sv);
          }
        } else if (typeof val === "string" && val) {
          const valLower = val.toLowerCase();
          for (const w of wanted) {
            if (valLower.includes(w.toLowerCase())) matched.push(w);
          }
        }
        if (matched.length > 0) {
          const f = eventFieldKeys.get(key);
          const label = f ? f.labelTh : key;
          // dedupe while preserving order
          const uniq = Array.from(new Set(matched));
          parts.push(`${label}: ${uniq.join(", ")}`);
        }
      }
      return parts.join(" · ");
    };
    const dynamicCols: Col[] = [];
    for (const [key, f] of eventFieldKeys) {
      dynamicCols.push({
        header: `${f.labelTh}/${f.labelEn}`,
        key,
        width: f.type === "textarea" ? 40 : 24,
      });
      if (f.type === "multiselect" && f.allowOther) {
        dynamicCols.push({
          header: `${f.labelTh} (อื่นๆ)`,
          key: `${key}__other`,
          width: 20,
        });
      }
    }

    const cols = [...baseCols, ...dynamicCols];

    const wb = new ExcelJS.Workbook();
    wb.creator = "SmartCard";
    wb.created = new Date();
    const ws = wb.addWorksheet("Contacts");

    ws.columns = cols;
    applyHeaderStyle(ws.getRow(1));

    data.forEach((r, idx) => {
      const c = r.contacts;
      const rowData: Record<string, unknown> = {
        date: formatDateTime(r.scanned_at),
        name: c?.name ?? "",
        position: c?.position ?? "",
        company: c?.company ?? "",
        phone: c?.phone ?? "",
        email: c?.email ?? "",
        website: c?.website ?? "",
        address: c?.address ?? "",
        scanner: r.profiles?.display_name ?? r.profiles?.email ?? "",
        eventName: r.events?.name ?? "",
        eventDate: r.events?.event_date ?? "",
        images: "",
      };
      const ed = (r.event_data ?? {}) as Record<string, unknown>;
      if (hasCriteria) rowData.criteria = matchedCriteriaFor(ed);
      for (const [key] of eventFieldKeys) {
        const v = ed[key];
        // Pretty-print multiselect objects: "Snack, Drink (อื่นๆ: Coffee)"
        if (
          v &&
          typeof v === "object" &&
          !Array.isArray(v) &&
          Array.isArray((v as { selected?: unknown }).selected)
        ) {
          const obj = v as { selected: unknown[]; other?: string };
          const sel = obj.selected.map((s) => String(s)).join(", ");
          rowData[key] = obj.other ? `${sel}${sel ? " · " : ""}อื่นๆ: ${obj.other}` : sel;
        } else {
          rowData[key] = v ?? "";
        }
        const otherKey = `${key}__other`;
        if (otherKey in ed) rowData[otherKey] = (ed as Record<string, unknown>)[otherKey];
      }

      const row = ws.addRow(rowData);
      applyDataStyle(row, idx % 2 === 1);

      // Highlight the criteria column so it stands out as the report's hook
      if (hasCriteria) {
        const cell = row.getCell("criteria");
        cell.font = { bold: true, color: { argb: "FF6D28D9" } };
      }

      if (c?.email) setSimpleHyperlink(row.getCell("email"), `mailto:${c.email}`, c.email);
      if (c?.website) setSimpleHyperlink(row.getCell("website"), c.website);
      if (r.image_urls && r.image_urls.length > 0)
        setImagesHyperlink(row.getCell("images"), r.image_urls);
    });

    ws.views = [{ state: "frozen", ySplit: 1 }];
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: ws.columnCount },
    };

    // Optional summary sheet — only when filters were applied
    if (hasCriteria || dateFrom || dateTo || eventId) {
      const summary = wb.addWorksheet("Criteria");
      summary.columns = [
        { header: "เกณฑ์", key: "label", width: 28 },
        { header: "ค่าที่เลือก", key: "value", width: 60 },
      ];
      applyHeaderStyle(summary.getRow(1));

      const addLine = (label: string, value: string) => {
        const r = summary.addRow({ label, value });
        applyDataStyle(r, summary.rowCount % 2 === 0);
      };

      if (eventId === "none") addLine("Event", "(ไม่ระบุ event)");
      else if (eventId) {
        const ev = eventConfigs.find((e) => e.id === eventId);
        addLine("Event", ev ? `${ev.name} (${ev.slug})` : eventId);
      } else {
        addLine("Event", "ทุก event");
      }
      if (dateFrom) addLine("วันที่เริ่ม", formatDateTime(dateFrom));
      if (dateTo) addLine("วันที่สิ้นสุด", formatDateTime(dateTo));
      for (const [key, vs] of filtersByKey) {
        const f = eventFieldKeys.get(key);
        const label = f ? `${f.labelTh} / ${f.labelEn}` : key;
        addLine(label, vs.join(", "));
      }
      addLine("จำนวนผลลัพธ์", `${data.length.toLocaleString()} รายการ`);
      addLine("สร้างเมื่อ", formatDateTime(new Date().toISOString()));

      summary.views = [{ state: "frozen", ySplit: 1 }];
    }

    const buffer = await wb.xlsx.writeBuffer();
    const date = new Date().toISOString().slice(0, 10);
    const filename = `smartcard-contacts-${date}.xlsx`;

    return new NextResponse(buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("export error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

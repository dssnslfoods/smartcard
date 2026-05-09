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
    if (me?.role !== "admin") {
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
      .from("contacts")
      .select(
        `id, name, position, company, phone, email, website, address,
         image_urls, event_id, event_data, created_at,
         events:event_id ( id, name, slug, event_date ),
         profiles:scanned_by ( id, email, display_name )`
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(10000);

    if (eventId === "none") query = query.is("event_id", null);
    else if (eventId) query = query.eq("event_id", eventId);
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo);
    if (search) {
      const s = search.replace(/[%_]/g, (c) => `\\${c}`);
      query = query.or(
        `name.ilike.%${s}%,company.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`
      );
    }
    for (const [k, v] of eventDataFilters) {
      query = query.ilike(`event_data->>${k}`, `%${v}%`);
    }

    const { data: rows, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    type ExportRow = {
      id: string;
      name: string | null;
      position: string | null;
      company: string | null;
      phone: string | null;
      email: string | null;
      website: string | null;
      address: string | null;
      image_urls: string[] | null;
      event_id: string | null;
      event_data: Record<string, string> | null;
      created_at: string;
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
    const data = (rows ?? []) as unknown as ExportRow[];

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

    const eventFieldKeys = new Map<string, EventField>(); // key -> field
    for (const ev of eventConfigs) {
      for (const f of ev.fields) {
        if (!eventFieldKeys.has(f.key)) eventFieldKeys.set(f.key, f);
      }
    }
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
      const rowData: Record<string, unknown> = {
        date: formatDateTime(r.created_at),
        name: r.name ?? "",
        position: r.position ?? "",
        company: r.company ?? "",
        phone: r.phone ?? "",
        email: r.email ?? "",
        website: r.website ?? "",
        address: r.address ?? "",
        scanner: r.profiles?.display_name ?? r.profiles?.email ?? "",
        eventName: r.events?.name ?? "",
        eventDate: r.events?.event_date ?? "",
        images: "",
      };
      const ed = r.event_data ?? {};
      for (const [key] of eventFieldKeys) {
        rowData[key] = ed[key] ?? "";
        const otherKey = `${key}__other`;
        if (otherKey in ed) rowData[otherKey] = ed[otherKey];
      }

      const row = ws.addRow(rowData);
      applyDataStyle(row, idx % 2 === 1);

      if (r.email) setSimpleHyperlink(row.getCell("email"), `mailto:${r.email}`, r.email);
      if (r.website) setSimpleHyperlink(row.getCell("website"), r.website);
      if (r.image_urls && r.image_urls.length > 0)
        setImagesHyperlink(row.getCell("images"), r.image_urls);
    });

    ws.views = [{ state: "frozen", ySplit: 1 }];
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: ws.columnCount },
    };

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

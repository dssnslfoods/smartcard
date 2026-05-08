import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { listContacts } from "@/lib/sheets";
import {
  listEventContacts,
  getEvent,
  type EventConfig,
  type EventContact,
} from "@/lib/events";
import type { Contact } from "@/lib/contact";

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
    cell.alignment = {
      vertical: "top",
      horizontal: "left",
      wrapText: true,
    };
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

function setHyperlink(cell: ExcelJS.Cell, urlsRaw: string) {
  if (!urlsRaw) return;
  const urls = urlsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (urls.length === 0) return;
  cell.value = {
    text: urls.length > 1 ? `เปิดรูป (${urls.length})` : "เปิดรูป",
    hyperlink: urls[0],
  };
  cell.font = { color: { argb: LINK_COLOR }, underline: true };
}

function setSimpleHyperlink(cell: ExcelJS.Cell, url: string, label?: string) {
  if (!url) return;
  const href = url.startsWith("http") ? url : `https://${url}`;
  cell.value = { text: label ?? url, hyperlink: href };
  cell.font = { color: { argb: LINK_COLOR }, underline: true };
}

async function writeContactsSheet(ws: ExcelJS.Worksheet, contacts: Contact[]) {
  ws.columns = [
    { header: "วันที่", key: "date", width: 18 },
    { header: "ชื่อ", key: "name", width: 28 },
    { header: "ตำแหน่ง", key: "position", width: 30 },
    { header: "บริษัท", key: "company", width: 30 },
    { header: "โทรศัพท์", key: "phone", width: 20 },
    { header: "อีเมล", key: "email", width: 28 },
    { header: "เว็บไซต์", key: "website", width: 24 },
    { header: "ที่อยู่", key: "address", width: 50 },
    { header: "บันทึกโดย", key: "device", width: 18 },
    { header: "รูปนามบัตร", key: "imageUrl", width: 16 },
  ];

  applyHeaderStyle(ws.getRow(1));

  contacts.forEach((c, idx) => {
    const row = ws.addRow({
      date: c.date,
      name: c.name,
      position: c.position,
      company: c.company,
      phone: c.phone,
      email: c.email,
      website: c.website,
      address: c.address,
      device: c.device,
      imageUrl: "",
    });
    applyDataStyle(row, idx % 2 === 1);

    if (c.email) setSimpleHyperlink(row.getCell("email"), `mailto:${c.email}`, c.email);
    if (c.website) setSimpleHyperlink(row.getCell("website"), c.website);
    if (c.imageUrl) setHyperlink(row.getCell("imageUrl"), c.imageUrl);
  });

  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: ws.columnCount },
  };
}

async function writeEventSheet(
  ws: ExcelJS.Worksheet,
  event: EventConfig,
  contacts: EventContact[]
) {
  type Col = { header: string; key: string; width: number };
  const cols: Col[] = [
    { header: "วันที่", key: "date", width: 18 },
    { header: "ชื่อ", key: "name", width: 28 },
    { header: "ตำแหน่ง", key: "position", width: 30 },
    { header: "บริษัท", key: "company", width: 30 },
    { header: "โทรศัพท์", key: "phone", width: 20 },
    { header: "อีเมล", key: "email", width: 28 },
    { header: "เว็บไซต์", key: "website", width: 24 },
    { header: "ที่อยู่", key: "address", width: 50 },
    { header: "บันทึกโดย", key: "device", width: 18 },
    { header: "รูปนามบัตร", key: "imageUrl", width: 16 },
    { header: "Event", key: "eventName", width: 24 },
  ];

  for (const f of event.fields) {
    cols.push({
      header: `${f.labelTh} / ${f.labelEn}`,
      key: f.key,
      width: f.type === "textarea" ? 50 : f.type === "multiselect" ? 32 : 24,
    });
    if (f.type === "multiselect" && f.allowOther) {
      cols.push({
        header: `${f.labelTh} (อื่นๆ)`,
        key: `${f.key}__other`,
        width: 24,
      });
    }
  }

  ws.columns = cols;
  applyHeaderStyle(ws.getRow(1));

  contacts.forEach((c, idx) => {
    const data: Record<string, string> = {
      date: c.date,
      name: c.name,
      position: c.position,
      company: c.company,
      phone: c.phone,
      email: c.email,
      website: c.website,
      address: c.address,
      device: c.device,
      imageUrl: "",
      eventName: c.eventName,
    };
    for (const f of event.fields) {
      data[f.key] = c.eventData[f.key] ?? "";
      if (f.type === "multiselect" && f.allowOther) {
        data[`${f.key}__other`] = c.eventData[`${f.key}__other`] ?? "";
      }
    }
    const row = ws.addRow(data);
    applyDataStyle(row, idx % 2 === 1);

    if (c.email) setSimpleHyperlink(row.getCell("email"), `mailto:${c.email}`, c.email);
    if (c.website) setSimpleHyperlink(row.getCell("website"), c.website);
    if (c.imageUrl) setHyperlink(row.getCell("imageUrl"), c.imageUrl);
  });

  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: ws.columnCount },
  };
}

function sanitizeSheetName(s: string): string {
  return s
    .replace(/[\\/?*[\]:]/g, "")
    .slice(0, 31)
    .trim() || "Sheet1";
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tab = url.searchParams.get("tab") || "default";

    const wb = new ExcelJS.Workbook();
    wb.creator = "SmartCard";
    wb.created = new Date();

    let filenameBase = "smartcard";

    if (tab === "default") {
      const contacts = await listContacts();
      const ws = wb.addWorksheet("นามบัตร");
      await writeContactsSheet(ws, contacts);
      filenameBase = "smartcard-contacts";
    } else {
      const event = await getEvent(tab);
      if (!event) {
        return NextResponse.json({ error: "event not found" }, { status: 404 });
      }
      const contacts = await listEventContacts(tab);
      const ws = wb.addWorksheet(sanitizeSheetName(event.name));
      await writeEventSheet(ws, event, contacts);
      filenameBase = `smartcard-${event.id}`;
    }

    const buffer = await wb.xlsx.writeBuffer();
    const date = new Date().toISOString().slice(0, 10);
    const filename = `${filenameBase}-${date}.xlsx`;

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

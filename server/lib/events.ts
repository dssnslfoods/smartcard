import { google, sheets_v4 } from "googleapis";
import type { CardData } from "./gemini";

const EVENTS_TAB = "_Events";

export type EventField =
  | { type: "text"; key: string; labelTh: string; labelEn: string; placeholder?: string }
  | { type: "textarea"; key: string; labelTh: string; labelEn: string; rows?: number }
  | {
      type: "multiselect";
      key: string;
      labelTh: string;
      labelEn: string;
      options: string[];
      allowOther?: boolean;
    };

export type EventConfig = {
  id: string;
  name: string;
  sheetTab: string;
  active: boolean;
  fields: EventField[];
};

export type EventResponseValue =
  | string
  | { selected: string[]; other?: string };

export type EventResponse = Record<string, EventResponseValue>;

const THAIFEX_2026: EventConfig = {
  id: "thaifex-2026",
  name: "Thaifex - Anuga ASIA 2026",
  sheetTab: "Thaifex_2026",
  active: true,
  fields: [
    { type: "text", key: "lineId", labelTh: "Line ID", labelEn: "Line ID" },
    { type: "text", key: "shopName", labelTh: "ชื่อร้าน", labelEn: "Shop Name" },
    { type: "text", key: "province", labelTh: "จังหวัด", labelEn: "Province" },
    {
      type: "multiselect",
      key: "businessType",
      labelTh: "ประเภทธุรกิจ",
      labelEn: "Type of Business",
      options: [
        "Manufacturer",
        "Wholesaler",
        "Restaurant/Café",
        "Hotel",
        "Supermarket",
        "Convenience Store",
        "Importer",
        "Distributor",
        "Online",
      ],
      allowOther: true,
    },
    {
      type: "multiselect",
      key: "interestedProducts",
      labelTh: "กลุ่มสินค้าที่สนใจ",
      labelEn: "Interested Products",
      options: [
        "Beef",
        "Lamb",
        "French Fries",
        "Vegetables",
        "Seafood",
        "Salmon",
        "Fish",
        "Cheese",
        "RTE/RTC",
        "Processed Food",
        "Bakery",
      ],
      allowOther: true,
    },
    {
      type: "textarea",
      key: "information",
      labelTh: "รายการสินค้าที่สนใจ",
      labelEn: "Information",
      rows: 3,
    },
    {
      type: "textarea",
      key: "otherRequirements",
      labelTh: "ข้อกำหนดอื่นๆ",
      labelEn: "Other Requirements",
      rows: 3,
    },
    {
      type: "multiselect",
      key: "followUp",
      labelTh: "Follow Up",
      labelEn: "Follow Up",
      options: [
        "ส่งใบเสนอราคา/Quotation",
        "ส่งตัวอย่าง/Sample",
        "ส่งข้อมูลสินค้า/Product Information",
      ],
      allowOther: true,
    },
    { type: "text", key: "noteBy", labelTh: "Note By", labelEn: "Note By" },
  ],
};

const DEFAULT_EVENTS: EventConfig[] = [THAIFEX_2026];

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY");
  }
  const privateKey = rawKey.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("Missing GOOGLE_SHEET_ID");
  return id;
}

async function tabExists(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  tab: string
): Promise<boolean> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  return !!meta.data.sheets?.find((s) => s.properties?.title === tab);
}

async function createTab(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  tab: string
) {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tab } } }],
    },
  });
}

function safeJsonParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

async function ensureEventsTab(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string
): Promise<void> {
  const exists = await tabExists(sheets, spreadsheetId, EVENTS_TAB);
  if (!exists) {
    await createTab(sheets, spreadsheetId, EVENTS_TAB);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${EVENTS_TAB}!A1:E1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["id", "name", "sheetTab", "active", "fieldsJson"]],
      },
    });
    const seedRows = DEFAULT_EVENTS.map((e) => [
      e.id,
      e.name,
      e.sheetTab,
      e.active ? "TRUE" : "FALSE",
      JSON.stringify(e.fields),
    ]);
    if (seedRows.length) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${EVENTS_TAB}!A:E`,
        valueInputOption: "RAW",
        requestBody: { values: seedRows },
      });
    }
  }
}

export async function listEvents(activeOnly = true): Promise<EventConfig[]> {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();
  await ensureEventsTab(sheets, spreadsheetId);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${EVENTS_TAB}!A2:E`,
  });
  const rows = res.data.values ?? [];

  return rows
    .filter((r) => r[0])
    .map(
      (r): EventConfig => ({
        id: String(r[0]),
        name: String(r[1] ?? ""),
        sheetTab: String(r[2] ?? ""),
        active: String(r[3] ?? "").toUpperCase() === "TRUE",
        fields: safeJsonParse<EventField[]>(String(r[4] ?? "[]")) ?? [],
      })
    )
    .filter((e) => !activeOnly || e.active);
}

export async function getEvent(id: string): Promise<EventConfig | null> {
  const events = await listEvents(false);
  return events.find((e) => e.id === id) ?? null;
}

export async function upsertEvent(event: EventConfig): Promise<void> {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();
  await ensureEventsTab(sheets, spreadsheetId);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${EVENTS_TAB}!A2:E`,
  });
  const rows = res.data.values ?? [];
  const existingIndex = rows.findIndex((r) => String(r[0]) === event.id);

  const row = [
    event.id,
    event.name,
    event.sheetTab,
    event.active ? "TRUE" : "FALSE",
    JSON.stringify(event.fields),
  ];

  if (existingIndex >= 0) {
    const rowNumber = existingIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${EVENTS_TAB}!A${rowNumber}:E${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${EVENTS_TAB}!A:E`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  }
}

export async function deleteEvent(id: string): Promise<void> {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const eventsSheet = meta.data.sheets?.find(
    (s) => s.properties?.title === EVENTS_TAB
  );
  if (!eventsSheet?.properties?.sheetId && eventsSheet?.properties?.sheetId !== 0) {
    return;
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${EVENTS_TAB}!A2:E`,
  });
  const rows = res.data.values ?? [];
  const idx = rows.findIndex((r) => String(r[0]) === id);
  if (idx < 0) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: eventsSheet.properties.sheetId as number,
              dimension: "ROWS",
              startIndex: idx + 1,
              endIndex: idx + 2,
            },
          },
        },
      ],
    },
  });
}

const BASE_HEADERS = [
  "วันที่",
  "ชื่อ",
  "ตำแหน่ง",
  "บริษัท",
  "โทรศัพท์",
  "อีเมล",
  "เว็บไซต์",
  "ที่อยู่",
  "บันทึกโดย (เครื่อง)",
  "รูปนามบัตร",
  "Event",
];

function buildEventHeaders(event: EventConfig): string[] {
  const eventCols: string[] = [];
  for (const f of event.fields) {
    eventCols.push(`${f.labelTh}/${f.labelEn}`);
    if (f.type === "multiselect" && f.allowOther) {
      eventCols.push(`${f.labelTh} (อื่นๆ)`);
    }
  }
  return [...BASE_HEADERS, ...eventCols];
}

export function eventHeaderKeys(event: EventConfig): string[] {
  const keys: string[] = [];
  for (const f of event.fields) {
    keys.push(f.key);
    if (f.type === "multiselect" && f.allowOther) {
      keys.push(`${f.key}__other`);
    }
  }
  return keys;
}

function columnLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function escapeFormula(v: string): string {
  if (!v) return v;
  return /^[=+\-@]/.test(v) ? `'${v}` : v;
}

function formatThaiDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

async function ensureEventTab(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  event: EventConfig
): Promise<void> {
  const exists = await tabExists(sheets, spreadsheetId, event.sheetTab);
  if (!exists) {
    await createTab(sheets, spreadsheetId, event.sheetTab);
  }

  const headers = buildEventHeaders(event);
  const lastCol = columnLetter(headers.length);
  const range = `${event.sheetTab}!A1:${lastCol}1`;

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const currentHeaders = current.data.values?.[0] ?? [];
  if (currentHeaders.length < headers.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
  }
}

export async function saveEventResponse(
  eventId: string,
  card: CardData,
  deviceLabel: string,
  imageUrl: string,
  response: EventResponse
): Promise<void> {
  const event = await getEvent(eventId);
  if (!event) throw new Error(`Event not found: ${eventId}`);

  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();
  await ensureEventTab(sheets, spreadsheetId, event);

  const eventCols: string[] = [];
  for (const f of event.fields) {
    const v = response[f.key];
    if (f.type === "multiselect") {
      let selected: string[] = [];
      let other = "";
      if (Array.isArray(v)) {
        selected = v as unknown as string[];
      } else if (v && typeof v === "object" && "selected" in v) {
        selected = v.selected ?? [];
        other = v.other ?? "";
      }
      eventCols.push(selected.join(", "));
      if (f.allowOther) eventCols.push(other);
    } else {
      eventCols.push(typeof v === "string" ? v : "");
    }
  }

  const row = [
    formatThaiDate(new Date()),
    card.name,
    card.position,
    card.company,
    escapeFormula(card.phone),
    card.email,
    card.website,
    card.address,
    deviceLabel,
    imageUrl,
    event.name,
    ...eventCols,
  ];

  const lastCol = columnLetter(row.length);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${event.sheetTab}!A:${lastCol}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

export type EventContact = {
  rowIndex: number;
  date: string;
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  device: string;
  imageUrl: string;
  eventName: string;
  eventData: Record<string, string>;
};

export async function listEventContacts(eventId: string): Promise<EventContact[]> {
  const event = await getEvent(eventId);
  if (!event) throw new Error(`Event not found: ${eventId}`);

  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();
  await ensureEventTab(sheets, spreadsheetId, event);

  const headers = buildEventHeaders(event);
  const lastCol = columnLetter(headers.length);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${event.sheetTab}!A2:${lastCol}`,
  });
  const rows = res.data.values ?? [];

  const eventKeys = eventHeaderKeys(event);

  return rows
    .map((row, i): EventContact => {
      const eventData: Record<string, string> = {};
      eventKeys.forEach((k, idx) => {
        eventData[k] = String(row[BASE_HEADERS.length + idx] ?? "");
      });
      return {
        rowIndex: i + 2,
        date: String(row[0] ?? ""),
        name: String(row[1] ?? ""),
        position: String(row[2] ?? ""),
        company: String(row[3] ?? ""),
        phone: String(row[4] ?? ""),
        email: String(row[5] ?? ""),
        website: String(row[6] ?? ""),
        address: String(row[7] ?? ""),
        device: String(row[8] ?? ""),
        imageUrl: String(row[9] ?? ""),
        eventName: String(row[10] ?? ""),
        eventData,
      };
    })
    .filter((c) => c.name || c.company || c.phone || c.email);
}

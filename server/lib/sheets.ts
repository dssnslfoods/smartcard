import { google, sheets_v4 } from "googleapis";
import type { CardData } from "./gemini";

const HEADER_ROW = [
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
];

const SHEET_RANGE = "A:J";
const HEADER_RANGE = "A1:J1";

export type Contact = CardData & {
  rowIndex: number;
  date: string;
  device: string;
  imageUrl: string;
};

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

function formatThaiDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// Sheets parses values starting with + = - @ as formulas under USER_ENTERED.
// Prefix with apostrophe to force text mode (not displayed in cell).
function escapeFormula(v: string): string {
  if (!v) return v;
  return /^[=+\-@]/.test(v) ? `'${v}` : v;
}

function getSheetConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID");
  const tab = process.env.GOOGLE_SHEET_TAB || "Sheet1";
  return { spreadsheetId, tab };
}

async function ensureHeaderRow(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  tab: string
) {
  const range = `${tab}!${HEADER_RANGE}`;
  const current = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const values = current.data.values?.[0] ?? [];
  if (values.length < HEADER_ROW.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values: [HEADER_ROW] },
    });
  }
}

async function getNumericSheetId(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  tab: string
): Promise<number> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const found = meta.data.sheets?.find((s) => s.properties?.title === tab);
  if (!found?.properties?.sheetId && found?.properties?.sheetId !== 0) {
    throw new Error(`Sheet tab "${tab}" not found`);
  }
  return found.properties.sheetId as number;
}

export async function appendCardToSheet(
  card: CardData,
  deviceLabel: string,
  imageUrl: string = ""
): Promise<void> {
  const { spreadsheetId, tab } = getSheetConfig();
  const sheets = getSheetsClient();
  await ensureHeaderRow(sheets, spreadsheetId, tab);

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
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!${SHEET_RANGE}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

export async function listContactsFromTab(tab: string): Promise<Contact[]> {
  const { spreadsheetId } = getSheetConfig();
  const sheets = getSheetsClient();

  // Try reading first 10 columns; tab may not exist
  let res;
  try {
    res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tab}!A2:J`,
    });
  } catch {
    return [];
  }

  const rows = res.data.values ?? [];
  return rows
    .map((row, i): Contact => ({
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
    }))
    .filter((c) => c.name || c.company || c.phone || c.email);
}

export async function listAllSheetTabs(): Promise<string[]> {
  const { spreadsheetId } = getSheetConfig();
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  return (meta.data.sheets ?? [])
    .map((s) => s.properties?.title ?? "")
    .filter((t) => t.length > 0);
}

export async function listContacts(): Promise<Contact[]> {
  const { spreadsheetId, tab } = getSheetConfig();
  const sheets = getSheetsClient();
  await ensureHeaderRow(sheets, spreadsheetId, tab);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A2:J`,
  });

  const rows = res.data.values ?? [];
  return rows
    .map((row, i): Contact => ({
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
    }))
    .filter((c) => c.name || c.company || c.phone || c.email);
}

export async function updateContact(
  rowIndex: number,
  card: CardData,
  device: string
): Promise<void> {
  const { spreadsheetId, tab } = getSheetConfig();
  const sheets = getSheetsClient();

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A${rowIndex}:J${rowIndex}`,
  });
  const existingRow = existing.data.values?.[0] ?? [];
  const currentDate = String(existingRow[0] ?? formatThaiDate(new Date()));
  const currentImageUrl = String(existingRow[9] ?? "");

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!A${rowIndex}:J${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          currentDate,
          card.name,
          card.position,
          card.company,
          escapeFormula(card.phone),
          card.email,
          card.website,
          card.address,
          device,
          currentImageUrl,
        ],
      ],
    },
  });
}

export async function deleteContact(rowIndex: number): Promise<void> {
  const { spreadsheetId, tab } = getSheetConfig();
  const sheets = getSheetsClient();
  const sheetId = await getNumericSheetId(sheets, spreadsheetId, tab);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });
}

import { google, drive_v3 } from "googleapis";
import { Readable } from "stream";

function getDriveClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY");
  }
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

async function getSheetParentFolder(
  drive: drive_v3.Drive,
  sheetId: string
): Promise<string> {
  const res = await drive.files.get({
    fileId: sheetId,
    fields: "parents",
    supportsAllDrives: true,
  });
  const parent = res.data.parents?.[0];
  if (!parent) {
    throw new Error(
      "Spreadsheet has no parent folder. Move it into a folder and share that folder with the service account."
    );
  }
  return parent;
}

async function findOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId: string
): Promise<string> {
  const escapedName = name.replace(/'/g, "\\'");
  const q = `mimeType='application/vnd.google-apps.folder' and name='${escapedName}' and '${parentId}' in parents and trashed=false`;

  const res = await drive.files.list({
    q,
    fields: "files(id,name)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const found = res.data.files?.[0]?.id;
  if (found) return found;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
    supportsAllDrives: true,
  });
  if (!created.data.id) throw new Error(`Failed to create folder "${name}"`);
  return created.data.id;
}

function sanitizeName(s: string): string {
  const cleaned = (s || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60)
    .trim();
  return cleaned || "card";
}

export type UploadResult = { id: string; webViewLink: string };

export async function uploadCardImage(
  imageBase64: string,
  contactName: string
): Promise<UploadResult> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");

  const drive = getDriveClient();
  const parentId = await getSheetParentFolder(drive, sheetId);
  const imageFolderId = await findOrCreateFolder(drive, "image", parentId);

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
  const dateFolderId = await findOrCreateFolder(drive, dateStr, imageFolderId);

  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(
    now.getSeconds()
  )}`;
  const filename = `${timeStr}_${sanitizeName(contactName)}.jpg`;

  const buffer = Buffer.from(imageBase64, "base64");
  const stream = Readable.from(buffer);

  const created = await drive.files.create({
    requestBody: { name: filename, parents: [dateFolderId] },
    media: { mimeType: "image/jpeg", body: stream },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  if (!created.data.id) throw new Error("Drive upload returned no file id");

  return {
    id: created.data.id,
    webViewLink:
      created.data.webViewLink ||
      `https://drive.google.com/file/d/${created.data.id}/view`,
  };
}

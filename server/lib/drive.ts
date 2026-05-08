import { google, drive_v3 } from "googleapis";
import { PassThrough } from "stream";

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

async function uploadOne(
  drive: drive_v3.Drive,
  dateFolderId: string,
  filename: string,
  imageBase64: string
): Promise<UploadResult> {
  const cleanBase64 = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;
  const buffer = Buffer.from(cleanBase64, "base64");
  if (buffer.length < 100) {
    throw new Error(
      `Image buffer suspiciously small (${buffer.length} bytes). base64 length=${cleanBase64.length}`
    );
  }

  const stream = new PassThrough();
  stream.end(buffer);

  const created = await drive.files.create({
    requestBody: { name: filename, parents: [dateFolderId] },
    media: { mimeType: "image/jpeg", body: stream },
    fields: "id, webViewLink, webContentLink, parents",
    supportsAllDrives: true,
  });

  if (!created.data.id) throw new Error("Drive upload returned no file id");

  console.log(
    `[drive] uploaded ${filename} (${buffer.length} bytes): id=${created.data.id}`
  );

  return {
    id: created.data.id,
    webViewLink:
      created.data.webViewLink ||
      `https://drive.google.com/file/d/${created.data.id}/view`,
  };
}

export async function uploadCardImage(
  imageBase64: string,
  contactName: string
): Promise<UploadResult> {
  const results = await uploadCardImages([imageBase64], contactName);
  return results[0];
}

export async function uploadCardImages(
  imagesBase64: string[],
  contactName: string
): Promise<UploadResult[]> {
  if (imagesBase64.length === 0) return [];

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
  const safeName = sanitizeName(contactName);

  const results: UploadResult[] = [];
  for (let i = 0; i < imagesBase64.length; i++) {
    const suffix = imagesBase64.length > 1 ? `_${i + 1}` : "";
    const filename = `${timeStr}_${safeName}${suffix}.jpg`;
    const r = await uploadOne(drive, dateFolderId, filename, imagesBase64[i]);
    results.push(r);
  }
  return results;
}

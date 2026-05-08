import {
  getApps,
  initializeApp,
  applicationDefault,
  cert,
} from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { randomUUID } from "crypto";

const PROJECT_ID = process.env.GCLOUD_PROJECT || "smartcard-d24ec";
const BUCKET_NAME =
  process.env.FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.firebasestorage.app`;

function ensureApp() {
  if (getApps().length !== 0) return;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (email && rawKey) {
    initializeApp({
      credential: cert({
        projectId: PROJECT_ID,
        clientEmail: email,
        privateKey: rawKey.replace(/\\n/g, "\n"),
      }),
      storageBucket: BUCKET_NAME,
    });
  } else {
    initializeApp({
      credential: applicationDefault(),
      projectId: PROJECT_ID,
      storageBucket: BUCKET_NAME,
    });
  }
}

export type UploadResult = { url: string; path: string };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function sanitizeName(s: string): string {
  const cleaned = (s || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60)
    .trim();
  return cleaned || "card";
}

export async function uploadCardImages(
  imagesBase64: string[],
  contactName: string
): Promise<UploadResult[]> {
  if (imagesBase64.length === 0) return [];

  ensureApp();
  const bucket = getStorage().bucket();

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(
    now.getSeconds()
  )}`;
  const safeName = sanitizeName(contactName);

  const results: UploadResult[] = [];
  for (let i = 0; i < imagesBase64.length; i++) {
    const cleanBase64 = imagesBase64[i].includes(",")
      ? imagesBase64[i].split(",")[1]
      : imagesBase64[i];
    const buffer = Buffer.from(cleanBase64, "base64");
    if (buffer.length < 100) {
      throw new Error(
        `Image buffer suspiciously small (${buffer.length} bytes)`
      );
    }

    const suffix = imagesBase64.length > 1 ? `_${i + 1}` : "";
    const filename = `${timeStr}_${safeName}${suffix}.jpg`;
    const path = `cards/${dateStr}/${filename}`;
    const token = randomUUID();

    const file = bucket.file(path);
    await file.save(buffer, {
      contentType: "image/jpeg",
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=31536000",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(path)}?alt=media&token=${token}`;

    console.log(`[storage] uploaded ${path} (${buffer.length} bytes)`);
    results.push({ url, path });
  }

  return results;
}

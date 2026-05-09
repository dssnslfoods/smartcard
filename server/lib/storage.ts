/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

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

  // Parallel upload — concurrent instead of sequential = ~2x faster for 2 images
  const uploads = imagesBase64.map(async (b64, i): Promise<UploadResult> => {
    const cleanBase64 = b64.includes(",") ? b64.split(",")[1] : b64;
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
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(path)}?alt=media&token=${token}`;

    console.log(`[storage] uploaded ${path} (${buffer.length} bytes)`);
    return { url, path };
  });

  return Promise.all(uploads);
}

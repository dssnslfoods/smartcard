/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { NextRequest, NextResponse } from "next/server";
import { extractCardFromImage } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      imageBase64?: string;
      imagesBase64?: string[];
    };
    const images: string[] =
      body.imagesBase64 && Array.isArray(body.imagesBase64)
        ? body.imagesBase64.filter((s) => typeof s === "string" && s.length > 0)
        : body.imageBase64 && typeof body.imageBase64 === "string"
        ? [body.imageBase64]
        : [];

    if (images.length === 0) {
      return NextResponse.json(
        { error: "imageBase64 or imagesBase64 is required" },
        { status: 400 }
      );
    }
    if (images.length > 4) {
      return NextResponse.json(
        { error: "Too many images (max 4)" },
        { status: 400 }
      );
    }

    const card = await extractCardFromImage(images);
    return NextResponse.json(card);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("scan error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

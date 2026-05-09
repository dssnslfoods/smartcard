/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadCardImages } from "@/lib/storage";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json()) as {
    imagesBase64?: string[];
    name?: string;
  };

  const images = (body.imagesBase64 ?? []).filter(
    (s) => typeof s === "string" && s.length > 0
  );
  if (images.length === 0) {
    return NextResponse.json({ error: "imagesBase64 required" }, { status: 400 });
  }
  if (images.length > 4) {
    return NextResponse.json({ error: "max 4 images" }, { status: 400 });
  }

  try {
    const results = await uploadCardImages(images, body.name || "card");
    return NextResponse.json({ urls: results.map((r) => r.url) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[upload] failed:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

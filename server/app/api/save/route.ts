import { NextRequest, NextResponse } from "next/server";
import { appendCardToSheet } from "@/lib/sheets";
import { uploadCardImages } from "@/lib/drive";
import type { CardData } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      card?: CardData;
      deviceLabel?: string;
      imageBase64?: string;
      imagesBase64?: string[];
    };
    const { card, deviceLabel } = body;

    if (!card || typeof card !== "object") {
      return NextResponse.json({ error: "card is required" }, { status: 400 });
    }
    if (!deviceLabel || typeof deviceLabel !== "string") {
      return NextResponse.json({ error: "deviceLabel is required" }, { status: 400 });
    }

    const images: string[] =
      body.imagesBase64 && Array.isArray(body.imagesBase64)
        ? body.imagesBase64.filter((s) => typeof s === "string" && s.length > 0)
        : body.imageBase64 && typeof body.imageBase64 === "string"
        ? [body.imageBase64]
        : [];

    let imageUrls: string[] = [];
    let imageError: string | undefined;
    if (images.length > 0) {
      try {
        console.log(
          `[save] uploading ${images.length} image(s) for ${card.name}`
        );
        const results = await uploadCardImages(images, card.name || "card");
        imageUrls = results.map((r) => r.webViewLink);
        console.log(`[save] uploaded ${imageUrls.length} image(s)`);
      } catch (driveErr) {
        imageError =
          driveErr instanceof Error ? driveErr.message : String(driveErr);
        console.error("[save] drive upload failed:", driveErr);
      }
    } else {
      console.warn("[save] no images provided");
    }

    const imageUrl = imageUrls.join(", ");
    await appendCardToSheet(card, deviceLabel, imageUrl);
    return NextResponse.json({ ok: true, imageUrl, imageUrls, imageError });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("save error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

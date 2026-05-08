import { NextRequest, NextResponse } from "next/server";
import { appendCardToSheet } from "@/lib/sheets";
import { uploadCardImage } from "@/lib/drive";
import type { CardData } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { card, deviceLabel, imageBase64 } = (await req.json()) as {
      card?: CardData;
      deviceLabel?: string;
      imageBase64?: string;
    };
    if (!card || typeof card !== "object") {
      return NextResponse.json({ error: "card is required" }, { status: 400 });
    }
    if (!deviceLabel || typeof deviceLabel !== "string") {
      return NextResponse.json({ error: "deviceLabel is required" }, { status: 400 });
    }

    let imageUrl = "";
    let imageError: string | undefined;
    if (imageBase64 && typeof imageBase64 === "string") {
      try {
        console.log(
          `[save] uploading image for ${card.name}, base64 length=${imageBase64.length}`
        );
        const upload = await uploadCardImage(imageBase64, card.name || "card");
        imageUrl = upload.webViewLink;
        console.log(`[save] image uploaded: ${imageUrl}`);
      } catch (driveErr) {
        imageError =
          driveErr instanceof Error ? driveErr.message : String(driveErr);
        console.error("[save] drive upload failed:", driveErr);
      }
    } else {
      console.warn("[save] no imageBase64 provided");
    }

    await appendCardToSheet(card, deviceLabel, imageUrl);
    return NextResponse.json({ ok: true, imageUrl, imageError });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("save error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

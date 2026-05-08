import { NextRequest, NextResponse } from "next/server";
import { saveEventResponse, type EventResponse } from "@/lib/events";
import { uploadCardImage } from "@/lib/drive";
import type { CardData } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { eventId, card, deviceLabel, imageBase64, response } =
      (await req.json()) as {
        eventId?: string;
        card?: CardData;
        deviceLabel?: string;
        imageBase64?: string;
        response?: EventResponse;
      };

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }
    if (!card || typeof card !== "object") {
      return NextResponse.json({ error: "card is required" }, { status: 400 });
    }
    if (!deviceLabel || typeof deviceLabel !== "string") {
      return NextResponse.json(
        { error: "deviceLabel is required" },
        { status: 400 }
      );
    }

    let imageUrl = "";
    if (imageBase64 && typeof imageBase64 === "string") {
      try {
        const upload = await uploadCardImage(imageBase64, card.name || "card");
        imageUrl = upload.webViewLink;
      } catch (driveErr) {
        console.error("drive upload failed (continuing):", driveErr);
      }
    }

    await saveEventResponse(
      eventId,
      card,
      deviceLabel,
      imageUrl,
      response ?? {}
    );

    return NextResponse.json({ ok: true, imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("save-event error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

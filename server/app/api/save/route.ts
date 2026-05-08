import { NextRequest, NextResponse } from "next/server";
import { appendCardToSheet } from "@/lib/sheets";
import type { CardData } from "@/lib/gemini";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { card, deviceLabel } = (await req.json()) as {
      card?: CardData;
      deviceLabel?: string;
    };
    if (!card || typeof card !== "object") {
      return NextResponse.json({ error: "card is required" }, { status: 400 });
    }
    if (!deviceLabel || typeof deviceLabel !== "string") {
      return NextResponse.json({ error: "deviceLabel is required" }, { status: 400 });
    }
    await appendCardToSheet(card, deviceLabel);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("save error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

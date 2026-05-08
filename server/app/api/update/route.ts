import { NextRequest, NextResponse } from "next/server";
import { updateContact } from "@/lib/sheets";
import type { CardData } from "@/lib/gemini";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { rowIndex, card, device } = (await req.json()) as {
      rowIndex?: number;
      card?: CardData;
      device?: string;
    };
    if (typeof rowIndex !== "number" || rowIndex < 2) {
      return NextResponse.json({ error: "rowIndex must be a number >= 2" }, { status: 400 });
    }
    if (!card || typeof card !== "object") {
      return NextResponse.json({ error: "card is required" }, { status: 400 });
    }
    await updateContact(rowIndex, card, device ?? "");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("update error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

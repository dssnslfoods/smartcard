import { NextRequest, NextResponse } from "next/server";
import { deleteContact } from "@/lib/sheets";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { rowIndex } = (await req.json()) as { rowIndex?: number };
    if (typeof rowIndex !== "number" || rowIndex < 2) {
      return NextResponse.json({ error: "rowIndex must be a number >= 2" }, { status: 400 });
    }
    await deleteContact(rowIndex);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("delete error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

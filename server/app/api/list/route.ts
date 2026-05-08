import { NextResponse } from "next/server";
import { listContacts } from "@/lib/sheets";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contacts = await listContacts();
    return NextResponse.json({ contacts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("list error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { listEventContacts, getEvent } from "@/lib/events";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const event = await getEvent(id);
    if (!event) {
      return NextResponse.json({ error: "event not found" }, { status: 404 });
    }
    const contacts = await listEventContacts(id);
    return NextResponse.json({ event, contacts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("list-event error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

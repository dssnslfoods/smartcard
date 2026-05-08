import { NextRequest, NextResponse } from "next/server";
import {
  listEvents,
  upsertEvent,
  deleteEvent,
  type EventConfig,
} from "@/lib/events";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "1";
    const events = await listEvents(!all);
    return NextResponse.json({ events });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("events list error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { event?: EventConfig };
    if (!body.event || !body.event.id || !body.event.sheetTab) {
      return NextResponse.json(
        { error: "event with id and sheetTab is required" },
        { status: 400 }
      );
    }
    await upsertEvent(body.event);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("events upsert error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await deleteEvent(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("events delete error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

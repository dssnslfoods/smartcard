import { NextResponse } from "next/server";
import {
  listContacts,
  listContactsFromTab,
  listAllSheetTabs,
} from "@/lib/sheets";
import { listEvents } from "@/lib/events";
import type { Contact } from "@/lib/contact";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const SYSTEM_TABS = new Set(["_Events"]);

export async function GET() {
  try {
    const defaultTab = process.env.GOOGLE_SHEET_TAB || "Sheet1";

    const [defaultContacts, events, allTabs] = await Promise.all([
      listContacts(),
      listEvents(false),
      listAllSheetTabs(),
    ]);

    const eventByTab = new Map(events.map((e) => [e.sheetTab, e]));
    const knownEventTabs = new Set(events.map((e) => e.sheetTab));

    const all: Contact[] = [];

    // Default tab — no event
    for (const c of defaultContacts) {
      all.push({
        ...c,
        eventId: null,
        eventName: null,
        eventTab: null,
      });
    }

    // Each non-system, non-default tab
    for (const tab of allTabs) {
      if (SYSTEM_TABS.has(tab)) continue;
      if (tab === defaultTab) continue;

      const event = eventByTab.get(tab);
      const tabContacts = await listContactsFromTab(tab);

      for (const c of tabContacts) {
        if (event) {
          all.push({
            ...c,
            eventId: event.id,
            eventName: event.name,
            eventTab: tab,
          });
        } else if (!knownEventTabs.has(tab)) {
          // Orphan tab — event was deleted but data remains
          all.push({
            ...c,
            eventId: `orphan:${tab}`,
            eventName: `${tab} (event ถูกลบ)`,
            eventTab: tab,
          });
        }
      }
    }

    return NextResponse.json({ contacts: all });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("list-all error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

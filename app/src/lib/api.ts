import { API_BASE_URL, ASSERT_API_BASE_URL } from "../config";
import type { CardData, EventConfig, EventResponse } from "../types";

export async function scanBusinessCard(imageBase64: string): Promise<CardData> {
  ASSERT_API_BASE_URL();
  const res = await fetch(`${API_BASE_URL}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Scan failed (${res.status}): ${text}`);
  }
  return JSON.parse(text) as CardData;
}

export async function saveBusinessCard(
  card: CardData,
  deviceLabel: string,
  imageBase64: string
): Promise<{ ok: true; imageUrl?: string }> {
  ASSERT_API_BASE_URL();
  const res = await fetch(`${API_BASE_URL}/api/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ card, deviceLabel, imageBase64 }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Save failed (${res.status}): ${text}`);
  }
  return JSON.parse(text);
}

export async function getEvents(): Promise<EventConfig[]> {
  ASSERT_API_BASE_URL();
  const res = await fetch(`${API_BASE_URL}/api/events`);
  const text = await res.text();
  if (!res.ok) throw new Error(`Get events failed (${res.status}): ${text}`);
  const data = JSON.parse(text) as { events: EventConfig[] };
  return data.events ?? [];
}

export async function saveEventCard(
  eventId: string,
  card: CardData,
  deviceLabel: string,
  imageBase64: string,
  response: EventResponse
): Promise<{ ok: true; imageUrl?: string }> {
  ASSERT_API_BASE_URL();
  const res = await fetch(`${API_BASE_URL}/api/save-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, card, deviceLabel, imageBase64, response }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Save event failed (${res.status}): ${text}`);
  return JSON.parse(text);
}

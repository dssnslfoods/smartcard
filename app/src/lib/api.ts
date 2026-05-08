import { API_BASE_URL, ASSERT_API_BASE_URL } from "../config";
import type { CardData } from "../types";

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
  deviceLabel: string
): Promise<{ ok: true }> {
  ASSERT_API_BASE_URL();
  const res = await fetch(`${API_BASE_URL}/api/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ card, deviceLabel }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Save failed (${res.status}): ${text}`);
  }
  return JSON.parse(text);
}

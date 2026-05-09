"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Loader2, AlertCircle, User, Tag } from "lucide-react";
import type { EventField, EventRow } from "@/lib/supabase/types";

type MultiState = { selected: string[]; other: string };
type EventStateValue = string | MultiState;

export type ContactEditTarget = {
  id: string;
  name: string | null;
  position: string | null;
  company: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  event_id: string | null;
  event_data: Record<string, string>;
  notes: string | null;
};

const CARD_FIELDS: { key: keyof ContactEditTarget; label: string; multiline?: boolean; type?: string }[] = [
  { key: "name", label: "ชื่อ" },
  { key: "position", label: "ตำแหน่ง" },
  { key: "company", label: "บริษัท" },
  { key: "phone", label: "โทรศัพท์", type: "tel" },
  { key: "email", label: "อีเมล", type: "email" },
  { key: "website", label: "เว็บไซต์", type: "url" },
  { key: "address", label: "ที่อยู่", multiline: true },
];

export function ContactEditDialog({
  contact,
  events,
  onClose,
  onSaved,
}: {
  contact: ContactEditTarget | null;
  events: EventRow[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<ContactEditTarget | null>(null);
  const [eventState, setEventState] = useState<Record<string, EventStateValue>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!contact) {
      setDraft(null);
      return;
    }
    setDraft({ ...contact });
    setErr(null);
    initEventState(contact, events);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact?.id]);

  const initEventState = (c: ContactEditTarget, evs: EventRow[]) => {
    const ev = evs.find((e) => e.id === c.event_id);
    if (!ev) {
      setEventState({});
      return;
    }
    const init: Record<string, EventStateValue> = {};
    for (const f of ev.fields) {
      if (f.type === "multiselect") {
        const raw = c.event_data?.[f.key] ?? "";
        const selected = raw.split(",").map((s) => s.trim()).filter(Boolean);
        const other = c.event_data?.[`${f.key}__other`] ?? "";
        init[f.key] = { selected, other };
      } else {
        init[f.key] = c.event_data?.[f.key] ?? "";
      }
    }
    setEventState(init);
  };

  if (!contact || !draft) return null;

  const selectedEvent = events.find((e) => e.id === draft.event_id);

  const setCardField = <K extends keyof ContactEditTarget>(
    k: K,
    v: ContactEditTarget[K]
  ) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const setEventText = (key: string, v: string) =>
    setEventState((p) => ({ ...p, [key]: v }));
  const toggleEventOption = (key: string, opt: string) =>
    setEventState((p) => {
      const cur = p[key] as MultiState;
      const has = cur.selected.includes(opt);
      const selected = has
        ? cur.selected.filter((o) => o !== opt)
        : [...cur.selected, opt];
      return { ...p, [key]: { ...cur, selected } };
    });
  const setEventOther = (key: string, v: string) =>
    setEventState((p) => {
      const cur = p[key] as MultiState;
      return { ...p, [key]: { ...cur, other: v } };
    });

  const onChangeEvent = (newId: string) => {
    setCardField("event_id", newId || null);
    const ev = events.find((e) => e.id === newId);
    if (!ev) {
      setEventState({});
      return;
    }
    const init: Record<string, EventStateValue> = {};
    for (const f of ev.fields) {
      if (f.type === "multiselect") init[f.key] = { selected: [], other: "" };
      else init[f.key] = "";
    }
    setEventState(init);
  };

  const buildEventResponse = () => {
    if (!selectedEvent) return undefined;
    const response: Record<string, unknown> = {};
    for (const f of selectedEvent.fields) {
      const v = eventState[f.key];
      if (f.type === "multiselect") {
        const m = v as MultiState;
        response[f.key] = { selected: m.selected, other: m.other };
      } else {
        response[f.key] = (v as string) ?? "";
      }
    }
    return response;
  };

  const onSave = async () => {
    setSaving(true);
    setErr(null);
    try {
      const body: Record<string, unknown> = {
        name: draft.name,
        position: draft.position,
        company: draft.company,
        phone: draft.phone,
        email: draft.email,
        website: draft.website,
        address: draft.address,
        event_id: draft.event_id,
        notes: draft.notes,
      };
      if (selectedEvent) {
        body.eventResponse = buildEventResponse();
      }

      const res = await fetch(`/api/contacts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-background w-full sm:max-w-2xl sm:rounded-xl shadow-soft-lg flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            แก้ไขข้อมูลนามบัตร
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {err && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              ข้อมูลนามบัตร
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CARD_FIELDS.map((f) => (
                <div key={f.key} className={f.multiline ? "sm:col-span-2" : ""}>
                  <Label className="mb-1.5 block">{f.label}</Label>
                  {f.multiline ? (
                    <Textarea
                      value={(draft[f.key] as string) ?? ""}
                      onChange={(e) =>
                        setCardField(f.key, e.target.value as never)
                      }
                      rows={2}
                    />
                  ) : (
                    <Input
                      type={f.type ?? "text"}
                      value={(draft[f.key] as string) ?? ""}
                      onChange={(e) =>
                        setCardField(f.key, e.target.value as never)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {events.length > 0 && (
            <section className="space-y-3 pt-3 border-t">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-3 w-3" />
                Event
              </h3>
              <div>
                <Label className="mb-1.5 block">Event</Label>
                <select
                  value={draft.event_id ?? ""}
                  onChange={(e) => onChangeEvent(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">— ไม่ผูก event —</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEvent && (
                <div className="space-y-3">
                  {selectedEvent.fields.map((f) => (
                    <EventFieldEdit
                      key={f.key}
                      field={f}
                      value={eventState[f.key]}
                      onText={(v) => setEventText(f.key, v)}
                      onToggle={(opt) => toggleEventOption(f.key, opt)}
                      onOther={(v) => setEventOther(f.key, v)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <div className="border-t px-5 py-3 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                บันทึก
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EventFieldEdit({
  field,
  value,
  onText,
  onToggle,
  onOther,
}: {
  field: EventField;
  value: EventStateValue | undefined;
  onText: (v: string) => void;
  onToggle: (opt: string) => void;
  onOther: (v: string) => void;
}) {
  if (field.type === "text") {
    return (
      <div>
        <Label className="mb-1.5 block">
          {field.labelTh}
          {field.labelEn ? ` / ${field.labelEn}` : ""}
        </Label>
        <Input
          value={(value as string) ?? ""}
          onChange={(e) => onText(e.target.value)}
        />
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div>
        <Label className="mb-1.5 block">
          {field.labelTh} / {field.labelEn}
        </Label>
        <Textarea
          value={(value as string) ?? ""}
          onChange={(e) => onText(e.target.value)}
          rows={field.rows ?? 3}
        />
      </div>
    );
  }
  const m = (value as MultiState) ?? { selected: [], other: "" };
  return (
    <div>
      <Label className="mb-1.5 block">
        {field.labelTh} / {field.labelEn}
      </Label>
      <div className="flex flex-wrap gap-2">
        {field.options.map((opt) => {
          const active = m.selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-input hover:bg-muted"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {field.allowOther && (
        <Input
          className="mt-2"
          value={m.other}
          onChange={(e) => onOther(e.target.value)}
          placeholder="อื่นๆ ระบุ..."
        />
      )}
    </div>
  );
}

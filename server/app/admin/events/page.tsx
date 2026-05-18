"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  X,
  ChevronUp,
  ChevronDown,
  Save,
  Calendar,
  Copy,
  Sparkles,
} from "lucide-react";
import type { EventField, EventRow } from "@/lib/supabase/types";
import { EVENT_TEMPLATES, type EventTemplate } from "@/lib/event-templates";

type FieldType = "text" | "textarea" | "multiselect";

type FieldDraft = {
  type: FieldType;
  key: string;
  labelTh: string;
  labelEn: string;
  placeholder?: string;
  rows?: number;
  options?: string[];
  allowOther?: boolean;
};

type EventDraft = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  event_date: string;
  fields: FieldDraft[];
  active: boolean;
};

const emptyDraft = (): EventDraft => ({
  slug: "",
  name: "",
  description: "",
  event_date: "",
  fields: [],
  active: true,
});

const newField = (): FieldDraft => ({
  type: "text",
  key: "",
  labelTh: "",
  labelEn: "",
});

function autoSlug(name: string): string {
  const slug = (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length >= 2) return slug;
  // Fallback: random suffix when name contains no ASCII (e.g., Thai-only name)
  return `event-${Date.now().toString(36)}`;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EventDraft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [pickingTemplate, setPickingTemplate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events?all=1", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { events: EventRow[] };
      setEvents(data.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = () => {
    setPickingTemplate(true);
  };

  const onPickTemplate = (template: EventTemplate) => {
    setPickingTemplate(false);
    const draft = emptyDraft();
    draft.fields = template.fields.map((f) => ({ ...f })) as FieldDraft[];
    setEditing(draft);
    setIsNew(true);
  };

  const onDuplicateEvent = (ev: EventRow) => {
    setPickingTemplate(false);
    const draft = emptyDraft();
    draft.fields = ((ev.fields ?? []) as FieldDraft[]).map((f) => ({ ...f }));
    draft.name = `${ev.name} (Copy)`;
    setEditing(draft);
    setIsNew(true);
  };

  const onEdit = (ev: EventRow) => {
    setEditing({
      id: ev.id,
      slug: ev.slug,
      name: ev.name,
      description: ev.description ?? "",
      event_date: ev.event_date ?? "",
      fields: (ev.fields ?? []) as FieldDraft[],
      active: ev.active,
    });
    setIsNew(false);
  };

  const onDelete = async (ev: EventRow) => {
    if (
      !confirm(
        `ลบ event "${ev.name}" ใช่ไหม?\nข้อมูลนามบัตรที่ผูก event นี้ยังเก็บไว้`
      )
    )
      return;
    try {
      const res = await fetch(`/api/events/${ev.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการ Events</h1>
          <p className="text-sm text-muted-foreground">
            สร้าง/แก้ไข event ที่จะใช้ตอนสแกนนามบัตร
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4" />
          เพิ่ม Event
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[88px] rounded-xl border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            ยังไม่มี event — กด "เพิ่ม Event" เพื่อเริ่มสร้าง
          </CardContent>
        </Card>
      ) : (
        events.map((ev) => (
          <Card
            key={ev.id}
            className={`card-hover shadow-soft ${ev.archived_at ? "opacity-60" : ""}`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold truncate">{ev.name}</span>
                  {ev.archived_at && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      archived
                    </span>
                  )}
                  {!ev.active && !ev.archived_at && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                      inactive
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-3">
                  <span>
                    slug: <code>{ev.slug}</code>
                  </span>
                  {ev.event_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {ev.event_date}
                    </span>
                  )}
                  <span>{(ev.fields ?? []).length} fields</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(ev)}
                title="แก้ไข"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDuplicateEvent(ev)}
                title={`คัดลอก event นี้ (สร้างใหม่พร้อม ${(ev.fields ?? []).length} fields)`}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                <Copy className="h-4 w-4" />
              </Button>
              {!ev.archived_at && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(ev)}
                  title="Archive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {pickingTemplate && (
        <TemplatePicker
          existingEvents={events}
          onPickTemplate={onPickTemplate}
          onDuplicate={onDuplicateEvent}
          onClose={() => setPickingTemplate(false)}
        />
      )}

      {editing && (
        <EventEditor
          event={editing}
          isNew={isNew}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function TemplatePicker({
  existingEvents,
  onPickTemplate,
  onDuplicate,
  onClose,
}: {
  existingEvents: EventRow[];
  onPickTemplate: (t: EventTemplate) => void;
  onDuplicate: (ev: EventRow) => void;
  onClose: () => void;
}) {
  const usable = existingEvents.filter((e) => !e.archived_at);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-background w-full sm:max-w-4xl sm:rounded-xl shadow-xl flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              เลือก Template
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              เริ่มต้นด้วย field สำเร็จรูป แล้วปรับให้เข้ากับงานของคุณ
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              เทมเพลตสำเร็จรูป
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {EVENT_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onPickTemplate(t)}
                  className="text-left p-4 rounded-xl border-2 border-transparent hover:border-primary hover:shadow-md transition-all bg-card group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-2xl rounded-lg w-12 h-12 flex items-center justify-center shrink-0 ${t.color}`}
                    >
                      {t.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                        {t.name}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {t.description}
                      </div>
                      <div className="text-xs text-muted-foreground/70 mt-2">
                        {t.fields.length === 0
                          ? "ไม่มี field เริ่มต้น"
                          : `${t.fields.length} fields`}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {usable.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                <Copy className="h-3 w-3" />
                หรือ คัดลอกจาก Event ที่มีอยู่
              </h3>
              <div className="space-y-2">
                {usable.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onDuplicate(e)}
                    className="w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-all flex items-center gap-3"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{e.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(e.fields ?? []).length} fields
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function EventEditor({
  event,
  isNew,
  onClose,
  onSaved,
}: {
  event: EventDraft;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<EventDraft>(event);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const setMeta = <K extends keyof EventDraft>(key: K, value: EventDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const updateField = (idx: number, patch: Partial<FieldDraft>) =>
    setDraft((d) => ({
      ...d,
      fields: d.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    }));

  const addField = () =>
    setDraft((d) => ({ ...d, fields: [...d.fields, newField()] }));

  const removeField = (idx: number) =>
    setDraft((d) => ({ ...d, fields: d.fields.filter((_, i) => i !== idx) }));

  const moveField = (idx: number, dir: -1 | 1) =>
    setDraft((d) => {
      const next = [...d.fields];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return d;
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...d, fields: next };
    });

  const validate = (): string | null => {
    if (!draft.name.trim()) return "ใส่ชื่อ event";
    // Slug is optional — will be auto-generated if empty
    if (draft.slug.trim() && !/^[a-z0-9-]+$/.test(draft.slug))
      return "รหัสภายใน ใช้ได้เฉพาะ a-z 0-9 - เท่านั้น";
    const keys = new Set<string>();
    for (const f of draft.fields) {
      if (!f.key.trim())
        return `field "${f.labelEn || f.labelTh || "?"}" ขาด key`;
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(f.key))
        return `field key "${f.key}" รูปแบบไม่ถูกต้อง`;
      if (keys.has(f.key)) return `field key ซ้ำ: ${f.key}`;
      keys.add(f.key);
      if (!f.labelTh.trim() && !f.labelEn.trim())
        return `field "${f.key}" ขาด label`;
      if (
        f.type === "multiselect" &&
        (!f.options || f.options.filter((o) => o.trim()).length === 0)
      )
        return `field "${f.key}" ต้องมี options ≥ 1`;
    }
    return null;
  };

  const onSave = async () => {
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const cleanFields: EventField[] = draft.fields.map((f) => {
        if (f.type === "text") {
          return {
            type: "text" as const,
            key: f.key.trim(),
            labelTh: f.labelTh.trim(),
            labelEn: f.labelEn.trim(),
            ...(f.placeholder ? { placeholder: f.placeholder } : {}),
          };
        }
        if (f.type === "textarea") {
          return {
            type: "textarea" as const,
            key: f.key.trim(),
            labelTh: f.labelTh.trim(),
            labelEn: f.labelEn.trim(),
            ...(f.rows ? { rows: f.rows } : {}),
          };
        }
        return {
          type: "multiselect" as const,
          key: f.key.trim(),
          labelTh: f.labelTh.trim(),
          labelEn: f.labelEn.trim(),
          options: (f.options ?? [])
            .map((o) => o.trim())
            .filter((o) => o.length > 0),
          allowOther: !!f.allowOther,
        };
      });

      const finalSlug = draft.slug.trim() || autoSlug(draft.name);

      const body = {
        slug: finalSlug,
        name: draft.name,
        description: draft.description || null,
        event_date: draft.event_date || null,
        fields: cleanFields,
        active: draft.active,
      };

      const url = isNew ? "/api/events" : `/api/events/${event.id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
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
      <div className="bg-background w-full sm:max-w-3xl sm:rounded-xl shadow-xl flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-semibold">
            {isNew ? "เพิ่ม Event ใหม่" : `แก้ไข: ${event.name}`}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {err && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          )}

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              ข้อมูล Event
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">
                  ชื่อ Event <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setMeta("name", e.target.value)}
                  placeholder="เช่น Thaifex - Anuga ASIA 2026"
                />
                {isNew && (
                  <p className="text-xs text-muted-foreground mt-1">
                    รหัสภายในจะถูกสร้างอัตโนมัติเป็น{" "}
                    <code className="text-foreground bg-muted px-1 rounded">
                      {draft.slug.trim() || autoSlug(draft.name)}
                    </code>
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">วันที่จัดงาน</Label>
                <Input
                  type="date"
                  value={draft.event_date}
                  onChange={(e) => setMeta("event_date", e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) => setMeta("active", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">รายละเอียด (ไม่บังคับ)</Label>
                <Textarea
                  value={draft.description}
                  onChange={(e) => setMeta("description", e.target.value)}
                  rows={2}
                  placeholder="คำอธิบายสั้นๆ เกี่ยวกับ event"
                />
              </div>

              {/* Advanced: editable slug — only when editing existing */}
              {!isNew && (
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    รหัสภายใน (ID)
                  </Label>
                  <Input
                    value={draft.slug}
                    disabled
                    className="font-mono text-sm bg-muted"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Fields ({draft.fields.length})
              </h3>
              <Button size="sm" variant="outline" onClick={addField}>
                <Plus className="h-3.5 w-3.5" />
                เพิ่ม Field
              </Button>
            </div>

            {draft.fields.length === 0 && (
              <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-6 text-center">
                ยังไม่มี field — กด "เพิ่ม Field"
              </div>
            )}

            {draft.fields.map((f, idx) => (
              <FieldEditor
                key={idx}
                index={idx}
                total={draft.fields.length}
                field={f}
                onChange={(patch) => updateField(idx, patch)}
                onRemove={() => removeField(idx)}
                onMoveUp={() => moveField(idx, -1)}
                onMoveDown={() => moveField(idx, 1)}
              />
            ))}
          </section>
        </div>

        <div className="border-t px-5 py-3 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "กำลังบันทึก..." : isNew ? "สร้าง Event" : "บันทึก"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FieldEditor({
  index,
  total,
  field,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  index: number;
  total: number;
  field: FieldDraft;
  onChange: (patch: Partial<FieldDraft>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            #{index + 1}
          </span>
          <select
            value={field.type}
            onChange={(e) => onChange({ type: e.target.value as FieldType })}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="multiselect">Multi-select</option>
          </select>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={index === total - 1}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="mb-1.5 block text-xs">Key *</Label>
            <Input
              value={field.key}
              onChange={(e) => onChange({ key: e.target.value })}
              placeholder="lineId"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Label (ไทย)</Label>
            <Input
              value={field.labelTh}
              onChange={(e) => onChange({ labelTh: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Label (English)</Label>
            <Input
              value={field.labelEn}
              onChange={(e) => onChange({ labelEn: e.target.value })}
            />
          </div>
        </div>

        {field.type === "text" && (
          <div>
            <Label className="mb-1.5 block text-xs">Placeholder</Label>
            <Input
              value={field.placeholder ?? ""}
              onChange={(e) => onChange({ placeholder: e.target.value })}
            />
          </div>
        )}

        {field.type === "textarea" && (
          <div className="w-32">
            <Label className="mb-1.5 block text-xs">Rows</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={field.rows ?? 3}
              onChange={(e) =>
                onChange({ rows: Number(e.target.value) || 3 })
              }
            />
          </div>
        )}

        {field.type === "multiselect" && (
          <div className="space-y-2">
            <div>
              <Label className="mb-1.5 block text-xs">
                Options * (1 บรรทัด/ตัวเลือก)
              </Label>
              <Textarea
                value={(field.options ?? []).join("\n")}
                onChange={(e) =>
                  onChange({
                    options: e.target.value.split("\n").map((s) => s),
                  })
                }
                rows={5}
                placeholder="Manufacturer&#10;Hotel&#10;Restaurant"
                className="font-mono text-sm"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!field.allowOther}
                onChange={(e) => onChange({ allowOther: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">มีช่อง "อื่นๆ ระบุ..."</span>
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

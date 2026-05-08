"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  X,
  ChevronUp,
  ChevronDown,
  Save,
} from "lucide-react";

type FieldType = "text" | "textarea" | "multiselect";

type EventField = {
  type: FieldType;
  key: string;
  labelTh: string;
  labelEn: string;
  placeholder?: string;
  rows?: number;
  options?: string[];
  allowOther?: boolean;
};

type EventConfig = {
  id: string;
  name: string;
  sheetTab: string;
  active: boolean;
  fields: EventField[];
};

const emptyEvent = (): EventConfig => ({
  id: "",
  name: "",
  sheetTab: "",
  active: true,
  fields: [],
});

const newField = (): EventField => ({
  type: "text",
  key: "",
  labelTh: "",
  labelEn: "",
});

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EventConfig | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events?all=1", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { events: EventConfig[] };
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
    setEditing(emptyEvent());
    setIsNew(true);
  };

  const onEdit = (ev: EventConfig) => {
    setEditing(JSON.parse(JSON.stringify(ev)));
    setIsNew(false);
  };

  const onDelete = async (ev: EventConfig) => {
    if (!confirm(`ลบ event "${ev.name}" ใช่ไหม? (tab ใน spreadsheet จะไม่ถูกลบ)`)) return;
    try {
      const res = await fetch(`/api/events?id=${encodeURIComponent(ev.id)}`, {
        method: "DELETE",
      });
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
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <h1 className="font-semibold">⚙️ จัดการ Events</h1>
          <Button size="sm" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">เพิ่ม Event</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[80px] rounded-xl border bg-card animate-pulse" />
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
            <Card key={ev.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{ev.name}</span>
                    {!ev.active && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">inactive</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    id: <code>{ev.id}</code> · tab: <code>{ev.sheetTab}</code> ·{" "}
                    {ev.fields.length} fields
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onEdit(ev)} title="แก้ไข">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(ev)}
                  title="ลบ"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </main>

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

function EventEditor({
  event,
  isNew,
  onClose,
  onSaved,
}: {
  event: EventConfig;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<EventConfig>(event);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const setMeta = <K extends keyof EventConfig>(key: K, value: EventConfig[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const updateField = (idx: number, patch: Partial<EventField>) => {
    setDraft((d) => ({
      ...d,
      fields: d.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    }));
  };

  const addField = () => {
    setDraft((d) => ({ ...d, fields: [...d.fields, newField()] }));
  };

  const removeField = (idx: number) => {
    setDraft((d) => ({ ...d, fields: d.fields.filter((_, i) => i !== idx) }));
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    setDraft((d) => {
      const next = [...d.fields];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return d;
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...d, fields: next };
    });
  };

  const validate = (): string | null => {
    if (!draft.id.trim()) return "ใส่ id ของ event";
    if (!/^[a-z0-9-]+$/.test(draft.id)) return "id ใช้ได้เฉพาะ a-z 0-9 และ - เท่านั้น";
    if (!draft.name.trim()) return "ใส่ชื่อ event";
    if (!draft.sheetTab.trim()) return "ใส่ชื่อ sheet tab";
    const keys = new Set<string>();
    for (const f of draft.fields) {
      if (!f.key.trim()) return `field "${f.labelEn || f.labelTh || "?"}" ขาด key`;
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(f.key))
        return `field key "${f.key}" รูปแบบไม่ถูกต้อง (ขึ้นต้นด้วยตัวอักษร, ใช้ a-z A-Z 0-9 _)`;
      if (keys.has(f.key)) return `field key ซ้ำ: ${f.key}`;
      keys.add(f.key);
      if (!f.labelTh.trim() && !f.labelEn.trim())
        return `field "${f.key}" ขาด label`;
      if (f.type === "multiselect") {
        if (!f.options || f.options.length === 0)
          return `field "${f.key}" ต้องมี options อย่างน้อย 1 รายการ`;
      }
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
      const cleaned: EventConfig = {
        ...draft,
        fields: draft.fields.map((f) => {
          const base: EventField = {
            type: f.type,
            key: f.key.trim(),
            labelTh: f.labelTh.trim(),
            labelEn: f.labelEn.trim(),
          };
          if (f.type === "text" && f.placeholder) base.placeholder = f.placeholder;
          if (f.type === "textarea" && f.rows) base.rows = f.rows;
          if (f.type === "multiselect") {
            base.options = (f.options ?? [])
              .map((o) => o.trim())
              .filter((o) => o.length > 0);
            base.allowOther = !!f.allowOther;
          }
          return base;
        }),
      };
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: cleaned }),
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
            <h3 className="text-sm font-semibold text-muted-foreground">ข้อมูล Event</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">
                  ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={draft.id}
                  onChange={(e) => setMeta("id", e.target.value)}
                  placeholder="thaifex-2026"
                  disabled={!isNew}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  a-z, 0-9, - เท่านั้น (ไม่แก้หลังสร้าง)
                </p>
              </div>
              <div>
                <Label className="mb-1.5 block">
                  ชื่อ Event <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setMeta("name", e.target.value)}
                  placeholder="Thaifex - Anuga ASIA 2026"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">
                  Sheet Tab <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={draft.sheetTab}
                  onChange={(e) => setMeta("sheetTab", e.target.value)}
                  placeholder="Thaifex_2026"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ชื่อ tab ใน Spreadsheet (สร้างอัตโนมัติเมื่อ save ครั้งแรก)
                </p>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) => setMeta("active", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active (แสดงในหน้าสแกน)</span>
                </label>
              </div>
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
  field: EventField;
  onChange: (patch: Partial<EventField>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>
          <select
            value={field.type}
            onChange={(e) => onChange({ type: e.target.value as FieldType })}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="text">Text (1 บรรทัด)</option>
            <option value="textarea">Textarea (หลายบรรทัด)</option>
            <option value="multiselect">Multi-select (เลือกหลายอย่าง)</option>
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
            <Label className="mb-1.5 block text-xs">
              Key <span className="text-destructive">*</span>
            </Label>
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
              placeholder="Line ID"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Label (English)</Label>
            <Input
              value={field.labelEn}
              onChange={(e) => onChange({ labelEn: e.target.value })}
              placeholder="Line ID"
            />
          </div>
        </div>

        {field.type === "text" && (
          <div>
            <Label className="mb-1.5 block text-xs">Placeholder (optional)</Label>
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
              onChange={(e) => onChange({ rows: Number(e.target.value) || 3 })}
            />
          </div>
        )}

        {field.type === "multiselect" && (
          <div className="space-y-2">
            <div>
              <Label className="mb-1.5 block text-xs">
                Options <span className="text-destructive">*</span> (1 บรรทัดต่อ 1 ตัวเลือก)
              </Label>
              <Textarea
                value={(field.options ?? []).join("\n")}
                onChange={(e) =>
                  onChange({ options: e.target.value.split("\n").map((s) => s) })
                }
                rows={5}
                placeholder="Manufacturer&#10;Wholesaler&#10;Hotel"
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
              <span className="text-sm">มีช่อง "อื่นๆ ระบุ..." (เพิ่มอีก 1 column)</span>
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

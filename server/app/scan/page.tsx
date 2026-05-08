"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  Check,
  ArrowLeft,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { fileToResizedBase64 } from "@/lib/image-resize";

type CardData = {
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
};

type EventField =
  | { type: "text"; key: string; labelTh: string; labelEn: string; placeholder?: string }
  | { type: "textarea"; key: string; labelTh: string; labelEn: string; rows?: number }
  | {
      type: "multiselect";
      key: string;
      labelTh: string;
      labelEn: string;
      options: string[];
      allowOther?: boolean;
    };

type EventConfig = {
  id: string;
  name: string;
  sheetTab: string;
  active: boolean;
  fields: EventField[];
};

const empty: CardData = {
  name: "",
  position: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  address: "",
};

const FIELDS: { key: keyof CardData; label: string; multiline?: boolean; type?: string }[] = [
  { key: "name", label: "ชื่อ" },
  { key: "position", label: "ตำแหน่ง" },
  { key: "company", label: "บริษัท" },
  { key: "phone", label: "โทรศัพท์", type: "tel" },
  { key: "email", label: "อีเมล", type: "email" },
  { key: "website", label: "เว็บไซต์", type: "url" },
  { key: "address", label: "ที่อยู่", multiline: true },
];

type Step = "home" | "scanning" | "review" | "event" | "saving" | "done";
type MultiState = { selected: string[]; other: string };
type EventStateValue = string | MultiState;
type ImageEntry = { base64: string; preview: string };

const MAX_IMAGES = 2;

export default function ScanPage() {
  const [step, setStep] = useState<Step>("home");
  const [card, setCard] = useState<CardData>(empty);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState("");
  const [editingDevice, setEditingDevice] = useState(false);
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [eventState, setEventState] = useState<Record<string, EventStateValue>>({});
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("smartcard.device") : null;
    if (stored) {
      setDevice(stored);
    } else {
      setEditingDevice(true);
    }
    fetch("/api/events", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]));
  }, []);

  const saveDevice = (name: string) => {
    const trimmed = name.trim() || "Web";
    setDevice(trimmed);
    localStorage.setItem("smartcard.device", trimmed);
    setEditingDevice(false);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    try {
      const base64 = await fileToResizedBase64(file);
      const preview = URL.createObjectURL(file);
      setImages((prev) =>
        prev.length < MAX_IMAGES ? [...prev, { base64, preview }] : prev
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const removed = prev[idx];
      if (removed?.preview.startsWith("blob:")) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const onScan = async () => {
    if (images.length === 0) return;
    setError(null);
    setStep("scanning");
    try {
      const imagesBase64 = images.map((i) => i.base64);
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagesBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setCard({
        name: data.name ?? "",
        position: data.position ?? "",
        company: data.company ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        website: data.website ?? "",
        address: data.address ?? "",
      });
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep("home");
    }
  };

  const onContinueToEvent = () => {
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) return;
    const init: Record<string, EventStateValue> = {};
    for (const f of event.fields) {
      if (f.type === "multiselect") init[f.key] = { selected: [], other: "" };
      else init[f.key] = "";
    }
    setEventState(init);
    setStep("event");
  };

  const onSaveNoEvent = async () => {
    setStep("saving");
    setError(null);
    try {
      const imagesBase64 = images.map((i) => i.base64);
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card, deviceLabel: device || "Web", imagesBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.imageError) {
        console.warn("Image upload failed:", data.imageError);
        setError(`บันทึกข้อมูลแล้ว แต่อัปโหลดรูปไม่สำเร็จ: ${data.imageError}`);
      }
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep("review");
    }
  };

  const onSaveEvent = async () => {
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) return;
    setStep("saving");
    setError(null);
    try {
      const response: Record<string, unknown> = {};
      for (const f of event.fields) {
        const v = eventState[f.key];
        if (f.type === "multiselect") {
          const m = v as MultiState;
          response[f.key] = { selected: m.selected, other: m.other };
        } else {
          response[f.key] = v as string;
        }
      }
      const imagesBase64 = images.map((i) => i.base64);
      const res = await fetch("/api/save-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          card,
          deviceLabel: device || "Web",
          imagesBase64,
          response,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.imageError) {
        console.warn("Image upload failed:", data.imageError);
        setError(`บันทึกข้อมูลแล้ว แต่อัปโหลดรูปไม่สำเร็จ: ${data.imageError}`);
      }
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep("event");
    }
  };

  const reset = () => {
    setCard(empty);
    images.forEach((i) => {
      if (i.preview.startsWith("blob:")) URL.revokeObjectURL(i.preview);
    });
    setImages([]);
    setError(null);
    setSelectedEventId("");
    setEventState({});
    setStep("home");
  };

  const setEventText = (key: string, v: string) => {
    setEventState((p) => ({ ...p, [key]: v }));
  };
  const toggleEventOption = (key: string, opt: string) => {
    setEventState((p) => {
      const cur = p[key] as MultiState;
      const has = cur.selected.includes(opt);
      const selected = has ? cur.selected.filter((o) => o !== opt) : [...cur.selected, opt];
      return { ...p, [key]: { ...cur, selected } };
    });
  };
  const setEventOther = (key: string, v: string) => {
    setEventState((p) => {
      const cur = p[key] as MultiState;
      return { ...p, [key]: { ...cur, other: v } };
    });
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <h1 className="font-semibold">📇 SmartCard Scanner</h1>
          <div className="w-[80px]" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <DeviceCard
          device={device}
          editing={editingDevice}
          onEdit={() => setEditingDevice(true)}
          onSave={saveDevice}
          onCancel={() => setEditingDevice(false)}
        />

        {error && step === "home" && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {step === "home" && (
          <Card>
            <CardContent className="p-6 space-y-3">
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0] ?? null);
                  if (cameraRef.current) cameraRef.current.value = "";
                }}
              />
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0] ?? null);
                  if (galleryRef.current) galleryRef.current.value = "";
                }}
              />

              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground font-medium">
                    รูปที่จะสแกน ({images.length}/{MAX_IMAGES})
                  </div>
                  <div className="flex gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img.preview}
                          alt={`scan-${idx}`}
                          className="w-32 h-24 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
                          title="ลบรูปนี้"
                        >
                          ✕
                        </button>
                        <div className="text-[11px] text-center text-muted-foreground mt-1 font-medium">
                          {idx === 0 ? "ด้านหน้า" : "ด้านหลัง"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {images.length < MAX_IMAGES && (
                <>
                  <Button
                    size="lg"
                    className="w-full h-16 text-base"
                    onClick={() => cameraRef.current?.click()}
                    disabled={!device || editingDevice}
                  >
                    <Camera className="h-5 w-5" />
                    {images.length === 0
                      ? "ถ่ายรูปนามบัตร"
                      : "ถ่ายเพิ่ม (หน้าหลัง)"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-16 text-base"
                    onClick={() => galleryRef.current?.click()}
                    disabled={!device || editingDevice}
                  >
                    <ImageIcon className="h-5 w-5" />
                    เลือกจากคลังรูปภาพ
                  </Button>
                </>
              )}

              {images.length > 0 && (
                <Button
                  size="lg"
                  className="w-full h-16 text-base bg-emerald-600 hover:bg-emerald-700"
                  onClick={onScan}
                  disabled={!device || editingDevice}
                >
                  ✨ สแกน {images.length} รูป
                </Button>
              )}

              {!device && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  ใส่ชื่อเครื่อง/ผู้บันทึกด้านบนก่อน
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {step === "scanning" && (
          <Card>
            <CardContent className="p-12 flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-base font-medium">กำลังอ่านนามบัตร...</p>
              <p className="text-sm text-muted-foreground">Gemini กำลังแยกข้อมูล</p>
            </CardContent>
          </Card>
        )}

        {step === "review" && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="font-semibold">ตรวจสอบข้อมูล</h2>
                <p className="text-xs text-muted-foreground">แก้ไขก่อนบันทึกได้</p>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {FIELDS.map((f) => (
                  <div key={f.key}>
                    <Label htmlFor={f.key} className="mb-1.5 block">
                      {f.label}
                    </Label>
                    {f.multiline ? (
                      <Textarea
                        id={f.key}
                        value={card[f.key]}
                        onChange={(e) => setCard({ ...card, [f.key]: e.target.value })}
                      />
                    ) : (
                      <Input
                        id={f.key}
                        type={f.type ?? "text"}
                        value={card[f.key]}
                        onChange={(e) => setCard({ ...card, [f.key]: e.target.value })}
                        autoCapitalize={f.type === "email" ? "none" : "sentences"}
                      />
                    )}
                  </div>
                ))}
              </div>

              {events.length > 0 && (
                <div className="pt-2">
                  <Label className="mb-1.5 block">ผูกกับ Event (ถ้ามี)</Label>
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      label="ไม่เลือก"
                      active={!selectedEventId}
                      onClick={() => setSelectedEventId("")}
                    />
                    {events.map((e) => (
                      <Chip
                        key={e.id}
                        label={e.name}
                        active={selectedEventId === e.id}
                        onClick={() => setSelectedEventId(e.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={reset}>
                  ยกเลิก
                </Button>
                {selectedEventId ? (
                  <Button className="flex-1" onClick={onContinueToEvent}>
                    ถัดไป: กรอกข้อมูล Event
                  </Button>
                ) : (
                  <Button className="flex-1" onClick={onSaveNoEvent}>
                    บันทึกลง Sheet
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {(step === "event" || step === "saving") && selectedEvent && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="font-semibold">{selectedEvent.name}</h2>
                <p className="text-xs text-muted-foreground">
                  กรอกข้อมูลเพิ่มเติมสำหรับ event นี้
                </p>
              </div>

              <div className="rounded-md bg-indigo-50 px-3 py-2 text-sm">
                <div className="font-semibold text-indigo-900">{card.name}</div>
                {card.company && (
                  <div className="text-xs text-muted-foreground">{card.company}</div>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              {selectedEvent.fields.map((f) => (
                <EventFieldRow
                  key={f.key}
                  field={f}
                  value={eventState[f.key]}
                  disabled={step === "saving"}
                  onText={(v) => setEventText(f.key, v)}
                  onToggle={(opt) => toggleEventOption(f.key, opt)}
                  onOther={(v) => setEventOther(f.key, v)}
                />
              ))}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("review")}
                  disabled={step === "saving"}
                >
                  กลับ
                </Button>
                <Button
                  className="flex-1"
                  onClick={onSaveEvent}
                  disabled={step === "saving"}
                >
                  {step === "saving" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    "บันทึก"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "done" && (
          <Card>
            <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-emerald-100 p-4">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">บันทึกเรียบร้อย!</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent
                    ? `เพิ่มข้อมูลลง ${selectedEvent.sheetTab} แล้ว`
                    : "เพิ่มข้อมูลลง Google Sheet แล้ว"}
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/">ดู Dashboard</Link>
                </Button>
                <Button className="flex-1" onClick={reset}>
                  สแกนต่อ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background border-input hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

function EventFieldRow({
  field,
  value,
  disabled,
  onText,
  onToggle,
  onOther,
}: {
  field: EventField;
  value: EventStateValue | undefined;
  disabled: boolean;
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
          disabled={disabled}
          placeholder={field.placeholder ?? field.labelEn}
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
          disabled={disabled}
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
        {field.options.map((opt) => (
          <Chip
            key={opt}
            label={opt}
            active={m.selected.includes(opt)}
            onClick={() => !disabled && onToggle(opt)}
          />
        ))}
      </div>
      {field.allowOther && (
        <Input
          className="mt-2"
          value={m.other}
          onChange={(e) => onOther(e.target.value)}
          placeholder="อื่นๆ ระบุ..."
          disabled={disabled}
        />
      )}
    </div>
  );
}

function DeviceCard({
  device,
  editing,
  onEdit,
  onSave,
  onCancel,
}: {
  device: string;
  editing: boolean;
  onEdit: () => void;
  onSave: (v: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(device);
  useEffect(() => setDraft(device), [device, editing]);

  if (editing) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <Label htmlFor="device">ชื่อผู้บันทึก / เครื่อง</Label>
          <Input
            id="device"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="เช่น iPhone Sales A, Sales-Golf, ฝ่ายขายเหนือ"
            autoFocus
          />
          <div className="flex gap-2">
            {device && (
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                ยกเลิก
              </Button>
            )}
            <Button className="flex-1" onClick={() => onSave(draft)}>
              บันทึก
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">บันทึกในนาม</p>
          <p className="font-semibold">{device || "—"}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

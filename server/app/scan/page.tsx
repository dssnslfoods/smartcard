"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

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
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import { fileToResizedBase64 } from "@/lib/image-resize";
import type { EventConfig as Evt } from "@/lib/supabase/types";

type CardData = {
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
};

type EventConfig = {
  id: string;
  slug: string;
  name: string;
  event_date: string | null;
  fields: Evt extends never ? never : Array<
    | { type: "text"; key: string; labelTh: string; labelEn: string; placeholder?: string }
    | { type: "textarea"; key: string; labelTh: string; labelEn: string; rows?: number }
    | {
        type: "multiselect";
        key: string;
        labelTh: string;
        labelEn: string;
        options: string[];
        allowOther?: boolean;
      }
  >;
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

const MAX_IMAGES = 2;

type Step = "capture" | "scanning" | "review" | "event" | "saving" | "done";

type ImageEntry = { base64: string; preview: string };
type MultiState = { selected: string[]; other: string };
type EventStateValue = string | MultiState;

export default function ScanPage() {
  const [step, setStep] = useState<Step>("capture");
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [card, setCard] = useState<CardData>(empty);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [eventState, setEventState] = useState<Record<string, EventStateValue>>({});
  // Pre-upload optimization: kick off image upload in parallel with OCR
  const uploadPromiseRef = useRef<Promise<string[]> | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/events", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]));
  }, []);

  const addFile = async (file: File | null) => {
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

      // Kick off image upload in parallel with OCR (saves ~1-2s on save step)
      uploadPromiseRef.current = fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagesBase64, name: "card" }),
      })
        .then(async (r) => {
          if (!r.ok) throw new Error("upload failed");
          const j = (await r.json()) as { urls: string[] };
          return j.urls ?? [];
        })
        .catch((e) => {
          console.warn("[scan] pre-upload failed, will fallback:", e);
          return [] as string[]; // empty → save will fall back to base64 upload
        });

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
      setStep("capture");
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

  const buildEventResponse = () => {
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) return undefined;
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
    return response;
  };

  const onSave = async (withEvent: boolean) => {
    setStep("saving");
    setError(null);
    try {
      // Wait for the pre-upload (started during OCR) to complete
      const uploadedUrls = uploadPromiseRef.current
        ? await uploadPromiseRef.current
        : [];

      const body: Record<string, unknown> = {
        card,
        eventId: withEvent ? selectedEventId : null,
        eventResponse: withEvent ? buildEventResponse() : undefined,
      };
      // Use pre-uploaded URLs if available; fall back to base64 if pre-upload failed
      if (uploadedUrls.length > 0) {
        body.imageUrls = uploadedUrls;
      } else {
        body.imagesBase64 = images.map((i) => i.base64);
      }

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.imageError) {
        setError(`บันทึกแล้ว แต่อัปโหลดรูปไม่สำเร็จ: ${data.imageError}`);
      }
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep(withEvent ? "event" : "review");
    }
  };

  const reset = () => {
    images.forEach((i) => {
      if (i.preview.startsWith("blob:")) URL.revokeObjectURL(i.preview);
    });
    setImages([]);
    setCard(empty);
    setError(null);
    setSelectedEventId("");
    setEventState({});
    uploadPromiseRef.current = null;
    setStep("capture");
  };

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

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 space-y-4">
      {step === "capture" && (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">สแกนนามบัตร</h1>
            <span className="text-sm text-muted-foreground">
              {images.length}/{MAX_IMAGES} รูป
            </span>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}

          {images.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.preview}
                        alt={`scan-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm flex items-center justify-center hover:bg-black/80"
                        title="ลบรูปนี้"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium">
                        {idx === 0 ? "ด้านหน้า" : "ด้านหลัง"}
                      </div>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button
                      onClick={() => cameraRef.current?.click()}
                      className="aspect-[4/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Camera className="h-6 w-6" />
                      <span className="text-xs">เพิ่มหน้าหลัง</span>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: "none",
            }}
            onChange={(e) => {
              addFile(e.target.files?.[0] ?? null);
              if (cameraRef.current) cameraRef.current.value = "";
            }}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="sr-only"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: "none",
            }}
            onChange={(e) => {
              addFile(e.target.files?.[0] ?? null);
              if (galleryRef.current) galleryRef.current.value = "";
            }}
          />

          {images.length === 0 ? (
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button
                  size="lg"
                  className="w-full h-16 text-base"
                  onClick={() => cameraRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                  ถ่ายรูปนามบัตร
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-16 text-base"
                  onClick={() => galleryRef.current?.click()}
                >
                  <ImageIcon className="h-5 w-5" />
                  เลือกจากคลังรูปภาพ
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Button
              size="lg"
              className="w-full h-14 text-base bg-emerald-600 hover:bg-emerald-700"
              onClick={onScan}
            >
              <Sparkles className="h-5 w-5" />
              ✨ สแกน {images.length} รูป
            </Button>
          )}
        </>
      )}

      {step === "scanning" && (
        <Card>
          <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-base font-medium">กำลังอ่านนามบัตร...</p>
            <p className="text-sm text-muted-foreground">AI กำลังแยกข้อมูล</p>
          </CardContent>
        </Card>
      )}

      {(step === "review" || (step === "saving" && !selectedEventId)) && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("capture")}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับ
              </button>
              <h2 className="font-semibold">ตรวจสอบข้อมูล</h2>
              <span className="w-12" />
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
                      disabled={step === "saving"}
                    />
                  ) : (
                    <Input
                      id={f.key}
                      type={f.type ?? "text"}
                      value={card[f.key]}
                      onChange={(e) => setCard({ ...card, [f.key]: e.target.value })}
                      disabled={step === "saving"}
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
                <Button
                  className="flex-1"
                  onClick={() => onSave(false)}
                  disabled={step === "saving"}
                >
                  {(step as Step) === "saving" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    "บันทึก"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(step === "event" || (step === "saving" && selectedEventId)) && selectedEvent && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("review")}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับ
              </button>
              <h2 className="font-semibold truncate">{selectedEvent.name}</h2>
              <span className="w-12" />
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
                onClick={() => onSave(true)}
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
              <p className="text-sm text-muted-foreground mt-1">
                เพิ่มข้อมูลลงฐานข้อมูลแล้ว
              </p>
            </div>
            {error && (
              <div className="rounded-md bg-amber-50 text-amber-700 text-sm px-3 py-2 w-full">
                {error}
              </div>
            )}
            <Button className="w-full" size="lg" onClick={reset}>
              <Camera className="h-5 w-5" />
              สแกนใบใหม่
            </Button>
          </CardContent>
        </Card>
      )}
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
  field: EventConfig["fields"][number];
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

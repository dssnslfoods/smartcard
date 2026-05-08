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

type Step = "home" | "scanning" | "review" | "saving" | "done";

export default function ScanPage() {
  const [step, setStep] = useState<Step>("home");
  const [card, setCard] = useState<CardData>(empty);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState("");
  const [editingDevice, setEditingDevice] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("smartcard.device") : null;
    if (stored) {
      setDevice(stored);
    } else {
      setEditingDevice(true);
    }
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
    setStep("scanning");
    try {
      const base64 = await fileToResizedBase64(file);
      setImageBase64(base64);
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
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

  const onSave = async () => {
    setStep("saving");
    setError(null);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card, deviceLabel: device || "Web", imageBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep("review");
    }
  };

  const reset = () => {
    setCard(empty);
    setImageBase64("");
    setError(null);
    setStep("home");
  };

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
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              <Button
                size="lg"
                className="w-full h-16 text-base"
                onClick={() => cameraRef.current?.click()}
                disabled={!device || editingDevice}
              >
                <Camera className="h-5 w-5" />
                ถ่ายรูปนามบัตร
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

        {(step === "review" || step === "saving") && (
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

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={reset}
                  disabled={step === "saving"}
                >
                  ยกเลิก
                </Button>
                <Button className="flex-1" onClick={onSave} disabled={step === "saving"}>
                  {step === "saving" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    "บันทึกลง Sheet"
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
                  เพิ่มข้อมูลลง Google Sheet แล้ว
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
